import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:seamless_navigation/models/navigation_graph.dart';
import 'package:seamless_navigation/services/map_service.dart';
import 'package:seamless_navigation/utils/geometry_utils.dart';
import 'package:seamless_navigation/widgets/boundary_popup.dart';
import 'package:seamless_navigation/widgets/debug_panel.dart';
import 'package:seamless_navigation/widgets/navigation_path.dart';
import 'package:vector_math/vector_math.dart' as vm;
import '../models/beacon_rssi.dart';
import '../services/beacon_scanner.dart';
import '../services/kalman_filter.dart';
import '../widgets/location_painter.dart';

class LocationScreen extends StatefulWidget {
  final void Function(bool) setNavigationMode;

  const LocationScreen({
    super.key,
    required this.setNavigationMode,
  });

  @override
  State<LocationScreen> createState() => _LocationScreenState();
}

class _LocationScreenState extends State<LocationScreen> {
  final MapService _mapService = MapService();
  List<NavNode> _currentPath = [];

  final DynamicKalmanFilter _filter = DynamicKalmanFilter(dt: 0.01);
  late BeaconScanner _scanner;
  late StreamSubscription _scanSubscription;

  vm.Vector2 _position = vm.Vector2.zero();
  double _currentFloor = 0;
  double _prevFloor = 0;

  Offset _dragOffset = Offset.zero;
  double _currentScale = 1.0;
  double _initialScale = 1.0;

  List<BeaconRssi> _detectedBeacons = [];

  NavNode? destination;

  void setDestination(NavNode destination) {
    destination = destination;
  }

  _LocationScreenState() {
    _scanner = BeaconScanner(_mapService);
    // _mapService.fetchMap("LOTS_of_rooms"); // или еще можно "LOTS_of_rooms"
  }

  void _startScanning() async {
    if (!await FlutterBluePlus.isSupported) {
      return;
    }

    await FlutterBluePlus.startScan(
      continuousUpdates: true,
      androidUsesFineLocation: true,
    );

    _scanSubscription = _scanner.scanBeacons().listen((beacons) {
      setState(() {
        _detectedBeacons = beacons;
      });

      if (beacons.length < 3) return;

      final measurement = _trilaterate(beacons[0], beacons[1], beacons[2]);
      _filter.predict();
      _filter.update(measurement);
      setState(() {
        _position = vm.Vector2(_filter.state.x, _filter.state.y);
        _prevFloor = _currentFloor;
        _currentFloor = beacons[0].beacon.floor;
        if (_currentFloor != _prevFloor) {
          // Recompute he navigation path using the current floor.
          final currentMap = _mapService.currentMap;
          if (currentMap != null && destination != null) {
            final navGraph = currentMap.navGraph;
            // Get the nodes for the new floor.
            final floorNodes = navGraph.floors[_currentFloor]?.nodes;
            if (floorNodes != null && floorNodes.isNotEmpty) {
              // Find the nearest visible node from the user's position.
              floorNodes.sort((a, b) =>
                  (a.position - _position).length.compareTo((b.position - _position).length));
              final nearestNode = floorNodes.first;
              
              // If the destination is on a different floor, find the nearest stairs node.
              NavNode target = destination!;
              if (_currentFloor != destination!.floor) {
                for (final node in floorNodes) {
                  if (node.isStairs && node != nearestNode) {
                    target = node;
                    break;
                  }
                }
              }
              
              // Compute the new path using your navGraph.
              final newPath = navGraph.findPath(nearestNode, target, _currentFloor);
              setState(() {
                _currentPath = newPath.isNotEmpty ? newPath : [target];
              });
            }
          }
        }
      });
    });
  }

  vm.Vector2 _trilaterate(BeaconRssi b1, BeaconRssi b2, BeaconRssi b3) {
    final a = 2 * (b2.x - b1.x);
    final bVal = 2 * (b2.y - b1.y);

    final c = pow(b1.distance, 2) -
        pow(b2.distance, 2) -
        pow(b1.x, 2) +
        pow(b2.x, 2) -
        pow(b1.y, 2) +
        pow(b2.y, 2);

    final d = 2 * (b3.x - b2.x);
    final e = 2 * (b3.y - b2.y);

    final f = pow(b2.distance, 2) -
        pow(b3.distance, 2) -
        pow(b2.x, 2) +
        pow(b3.x, 2) -
        pow(b2.y, 2) +
        pow(b3.y, 2);

    final x = (c * e - f * bVal) / (e * a - bVal * d);
    final y = (c * d - a * f) / (bVal * d - a * e);

    return vm.Vector2(x.toDouble(), y.toDouble());
  }

  void _onScaleStart(ScaleStartDetails details) {
    _initialScale = _currentScale;
  }

  void _onScaleUpdate(ScaleUpdateDetails details) {
    setState(() {
      _currentScale = (_initialScale * details.scale).clamp(0.25, 3.0);
      _dragOffset += details.focalPointDelta;
    });
  }

  @override
  void initState() {
    super.initState();
    _startScanning();
  }

  @override
  void dispose() {
    _scanSubscription.cancel();
    FlutterBluePlus.stopScan();
    super.dispose();
  }

  void _updateNavigationPath(List<NavNode> newPath) {
    setState(() {
      _currentPath = newPath;
    });
  }

  @override
  Widget build(BuildContext context) {
    bool showBoundaryPopup = false;

    if (_mapService.currentMap?.bounds != null) {
      showBoundaryPopup = isPointCloseToBounds(
        _position,
        _mapService.currentMap!.bounds,
        1,
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Путь к платформе')),
      body: Column(
        children: [
          if (showBoundaryPopup)
            BoundaryPopupWidget(
              onPress: () => widget.setNavigationMode(false),
              labelText: "Выходите на улицу?",
            ),
          NavigationPathWidget(
            mapService: _mapService,
            userPosition: _position,
            floor: _currentFloor,
            onPathUpdated: _updateNavigationPath,
            setDestination: setDestination,
          ),
          //DebugPanelWidget(detectedBeacons: _detectedBeacons, floor: _currentFloor),
          Expanded(
            child: Center(
              child: GestureDetector(
                onScaleStart: _onScaleStart,
                onScaleUpdate: _onScaleUpdate,
                child: Stack(
                  children: [
                    AnimatedBuilder(
                      animation: _mapService,
                      builder: (context, child) {
                        return CustomPaint(
                          size: Size.infinite,
                          painter: LocationPainter(
                            _position,
                            _currentFloor,
                            _mapService.currentMap,
                            scale: _currentScale,
                            offset: _dragOffset,
                            navigationPath: _currentPath,
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
