import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:open_route_service/open_route_service.dart';
import 'package:seamless_navigation/services/beacon_scanner.dart';
import 'package:seamless_navigation/services/map_service.dart';
import 'package:seamless_navigation/utils/geometry_utils.dart';
import 'package:seamless_navigation/widgets/address_widget.dart';
import 'package:seamless_navigation/widgets/boundary_popup.dart';

class OutdoorScreen extends StatefulWidget {
  final void Function(bool) setNavigationMode;
  final OpenRouteService client;

  const OutdoorScreen({
    super.key,
    required this.client,
    required this.setNavigationMode,
  });

  @override
  State<OutdoorScreen> createState() => _OutdoorScreenState();
}

class _OutdoorScreenState extends State<OutdoorScreen> {
  late final MapController _mapController;
  LatLng? _userLocation;
  List<LatLng> _routePoints = [];
  LatLng? _destination;

  final MapService _mapService = MapService();
  late BeaconScanner _scanner;
  late StreamSubscription _scanSubscription;
  late StreamSubscription<Position> _positionStreamSubscription;
  bool showBoundaryPopup = false;

  _OutdoorScreenState() {
    _scanner = BeaconScanner(_mapService);
  }

  @override
  void initState() {
    _mapController = MapController();
    _zoomToUserLocation();
    _startBleScanning();
    _startPositionStream();
    super.initState();
  }

  @override
  void dispose() {
    _mapController.dispose();
    _scanSubscription.cancel();
    FlutterBluePlus.stopScan();
    _positionStreamSubscription.cancel();
    super.dispose();
  }

  void _startBleScanning() async {
    if (!await FlutterBluePlus.isSupported) {
      return;
    }

    await FlutterBluePlus.startScan(
      continuousUpdates: true,
      androidUsesFineLocation: true,
    );

    _scanSubscription = _scanner.scanBeacons().listen((beacons) {
      if (beacons.isEmpty) return;
      showBoundaryPopup = true;
    });
  }

  void _startPositionStream() {
    const geolocationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
    );

    _positionStreamSubscription =
        Geolocator.getPositionStream(locationSettings: geolocationSettings)
            .listen((Position newPosition) {
      final newLatLng = LatLng(newPosition.latitude, newPosition.longitude);
      if (_userLocation == null ||
          Geolocator.distanceBetween(
                _userLocation!.latitude,
                _userLocation!.longitude,
                newLatLng.latitude,
                newLatLng.longitude,
              ) >=
              50) {
        _userLocation = newLatLng;
        if (_destination != null) {
          _fetchRoute(_userLocation!, _destination!);
        }
      }
    });
  }

  Future<void> _zoomToUserLocation() async {
    final position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
    final userLatLng = LatLng(position.latitude, position.longitude);

    setState(() {
      _userLocation = userLatLng;
    });

    _mapController.move(userLatLng, 15.0);
  }

  Future<void> _fetchRoute(LatLng start, LatLng end) async {
    final List<ORSCoordinate> routeCoordinates =
        await widget.client.directionsRouteCoordsGet(
      startCoordinate: ORSCoordinate(
        latitude: start.latitude,
        longitude: start.longitude,
      ),
      endCoordinate: ORSCoordinate(
        latitude: end.latitude,
        longitude: end.longitude,
      ),
    );

    setState(() {
      _routePoints = routeCoordinates
          .map((coord) => LatLng(coord.latitude, coord.longitude))
          .toList();
    });
  }

  Future<LatLng?> _geocodeAddress(String address) async {
    if (_userLocation == null) return null;

    final response = await widget.client.geocodeSearchGet(text: address);

    if (response.features.isEmpty) return null;

    final coords = response.features.map((feature) {
      final coords = feature.geometry.coordinates.first.first;
      return LatLng(coords.latitude, coords.longitude);
    }).toList();

    final nearest = coords.reduce((a, b) {
      final distanceA = sphericalDistance(_userLocation!, a);
      final distanceB = sphericalDistance(_userLocation!, b);

      if (distanceA < distanceB) return a;
      return b;
    });

    return LatLng(nearest.latitude, nearest.longitude);
  }

  Future<void> _fetchRouteToAddress(String address) async {
    if (_userLocation == null) return;
    final destination = await _geocodeAddress(address);
    if (destination == null) return;
    await _fetchRoute(_userLocation!, destination);
  }

  String getMinutesText(int number) {
    if (number % 10 == 1 && number % 100 != 11) {
      return "$number минута";
    } else if ([2, 3, 4].contains(number % 10) &&
        !(11 <= number % 100 && number % 100 <= 14)) {
      return "$number минуты";
    } else {
      return "$number минут";
    }
  }

  double _getRouteLength(List<LatLng> route) {
    if (route.isEmpty || _userLocation == null) return 0;

    double totalLength = sphericalDistance(_userLocation!, route.first);

    if (route.length == 1) return totalLength;

    for (int i = 0; i < route.length - 1; i++) {
      final current = route[i];
      final next = route[i + 1];

      totalLength += sphericalDistance(current, next);
    }

    return totalLength;
  }

  @override
  Widget build(BuildContext context) {
    final timeToDestinationMinutes = _getRouteLength(_routePoints) / 0.0013;
    final timeToDestination = getMinutesText(timeToDestinationMinutes.round());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Map Screen'),
      ),
      body: Column(
        children: [
          if (showBoundaryPopup)
            BoundaryPopupWidget(
              onPress: () => widget.setNavigationMode(true),
              labelText: "Входите в помещение?",
            ),
          Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: Text(
              _routePoints.isEmpty ? "" : timeToDestination,
            ),
          ),
          AddressWidget(onSubmitted: _fetchRouteToAddress),
          SizedBox(
            height: 676,
            child: FlutterMap(
              mapController: _mapController,
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.example.flutter_map_example',
                ),
                if (_userLocation != null)
                  CircleLayer(
                    circles: [
                      CircleMarker(
                        point: _userLocation!,
                        color: Colors.blue.withOpacity(0.2),
                        borderStrokeWidth: 2,
                        borderColor: Colors.blue,
                        useRadiusInMeter: true,
                        radius: 50,
                      ),
                    ],
                  ),
                if (_routePoints.isNotEmpty)
                  PolylineLayer(
                    polylines: [
                      Polyline(
                        points: _routePoints,
                        color: Colors.red,
                        strokeWidth: 4.0,
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
