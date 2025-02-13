import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:seamless_navigation/models/navigation_graph.dart';
import 'package:seamless_navigation/services/map_service.dart';
import 'package:seamless_navigation/widgets/navigation_path.dart';
import 'package:vector_math/vector_math.dart' as vm;
import '../models/beacon_rssi.dart';
import '../services/beacon_scanner.dart';
import '../services/kalman_filter.dart';
import '../widgets/debug_panel.dart';
import '../widgets/location_painter.dart';

class LocationScreen extends StatefulWidget {
  const LocationScreen({super.key});

  @override
  State<LocationScreen> createState() => _LocationScreenState();
}

class _LocationScreenState extends State<LocationScreen> {
  final MapService _mapService = MapService();
  List<NavNode> _currentPath = [];

  final DynamicKalmanFilter _filter = DynamicKalmanFilter(dt: 0.01);
  late BeaconScanner _scanner;
  late StreamSubscription _scanSubscription;

  List<BeaconRssi> _detectedBeacons = [];
  vm.Vector2 _position = vm.Vector2.zero();

  Offset _dragOffset = Offset.zero;
  double _currentScale = 1.0;
  double _initialScale = 1.0;

  _LocationScreenState() {
    _scanner = BeaconScanner(_mapService);
    _mapService.fetchMap("many_rooms"); // или еще можно "LOTS_of_rooms"
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
      setState(() => _detectedBeacons = beacons);

      if (beacons.length < 3) {
        return;
      }

      final measurement = _trilaterate(beacons[0], beacons[1], beacons[2]);
      _filter.predict();
      _filter.update(measurement);
      setState(() => _position = vm.Vector2(_filter.state.x, _filter.state.y));
    });
  }

  void _stopScanning() {
    _scanSubscription.cancel();
    FlutterBluePlus.stopScan();
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
    _stopScanning();
    super.dispose();
  }

  void _updateNavigationPath(List<NavNode> newPath) {
    setState(() {
      _currentPath = newPath;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('BLE Indoor Navigation')),
      body: Column(
        children: [
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
                            _mapService.currentMap,
                            scale: _currentScale,
                            offset: _dragOffset,
                            navigationPath: _currentPath,
                          ),
                        );
                      },
                    ),
                    DebugPanelWidget(detectedBeacons: _detectedBeacons)
                  ],
                ),
              ),
            ),
          ),
          NavigationPathWidget(
            mapService: _mapService,
            userPosition: _position,
            onPathUpdated: _updateNavigationPath,
          ),
        ],
      ),
    );
  }
}
