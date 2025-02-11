import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:http/http.dart' as http;
import 'package:vector_math/vector_math.dart' as vm;

void main() => runApp(const IndoorNavigationApp());

// Модели данных GeoJSON
class GeoJsonFeature {
  final String type;
  final GeoGeometry geometry;
  final Map<String, dynamic> properties;

  GeoJsonFeature({
    required this.type,
    required this.geometry,
    required this.properties,
  });

  factory GeoJsonFeature.fromJson(Map<String, dynamic> json) {
    return GeoJsonFeature(
      type: json['type'],
      geometry: GeoGeometry.fromJson(json['geometry']),
      properties: Map<String, dynamic>.from(json['properties']),
    );
  }
}

class GeoGeometry {
  final String type;
  final dynamic coordinates;

  GeoGeometry({
    required this.type,
    required this.coordinates,
  });

  factory GeoGeometry.fromJson(Map<String, dynamic> json) {
    return GeoGeometry(
      type: json['type'],
      coordinates: json['coordinates'],
    );
  }
}

// Сервис для работы с API
class MapApiService {
  static const String _baseUrl = 'http://194.87.111.159/api/1';

  Future<List<GeoJsonFeature>> fetchMapData() async {
    final response = await http.get(Uri.parse(_baseUrl));
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['features'] as List)
          .map((feature) => GeoJsonFeature.fromJson(feature))
          .toList();
    } else {
      throw Exception('Failed to load map data');
    }
  }
}

class IndoorNavigationApp extends StatelessWidget {
  const IndoorNavigationApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BLE Indoor Navigation',
      theme: ThemeData(
        primarySwatch: Colors.teal,
        scaffoldBackgroundColor: Colors.grey[100],
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.teal,
          titleTextStyle: TextStyle(color: Colors.white, fontSize: 20),
        ),
        textTheme: const TextTheme(
          bodyMedium: TextStyle(color: Colors.black87),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ButtonStyle(
            backgroundColor: MaterialStateProperty.all<Color>(Colors.teal),
            foregroundColor: MaterialStateProperty.all<Color>(Colors.white),
          )
        )
      ),
      home: const LocationScreen(),
    );
  }
}

class Beacon {
  final String name;
  final double x;
  final double y;

  const Beacon(this.name, this.x, this.y);
}

class BeaconRssi {
  final Beacon beacon;
  final int rssi;
  final double distance;

  const BeaconRssi({
    required this.beacon,
    required this.rssi,
    required this.distance,
  });

  double get x => beacon.x;
  double get y => beacon.y;
}

class BeaconScanner {
  static const List<Beacon> knownBeacons = [
    Beacon("ESP32_BLE_Device_36", 0.0, 0.0),
    Beacon("ESP32_BLE_Device_33", 5.0, 0.0),
    Beacon("ESP32_BLE_Device_1", 2.5, 5.0),
  ];

  Stream<List<BeaconRssi>> scanBeacons() {
    return FlutterBluePlus.scanResults.map((results) {
      final List<BeaconRssi> beacons = [];

      for (final result in results) {
        final beaconName = result.advertisementData.localName;
        if (beaconName != null && beaconName.isNotEmpty) {
          final known = knownBeacons.where(
                (b) => b.name == beaconName,
          ).firstOrNull;

          if (known != null) {
            final txPower = result.advertisementData.txPowerLevel ?? -59;
            final distance = _calculateDistance(result.rssi, txPower);
            beacons.add(BeaconRssi(
              beacon: known,
              rssi: result.rssi,
              distance: distance,
            ));
          }
        }
      }

      beacons.sort((a, b) => a.distance.compareTo(b.distance));
      return beacons.take(3).toList();
    });
  }

  double _calculateDistance(int rssi, int txPower) {
    const n = 2.0;
    final exponent = (txPower - rssi) / (10 * n);
    return pow(10, exponent).toDouble();
  }
}

class LocationScreen extends StatefulWidget {
  const LocationScreen({super.key});

  @override
  State<LocationScreen> createState() => _LocationScreenState();
}

class _LocationScreenState extends State<LocationScreen> {
  final BeaconScanner _scanner = BeaconScanner();
  final KalmanFilter _filter = KalmanFilter();
  final MapApiService _mapService = MapApiService();
  vm.Vector2 _position = vm.Vector2.zero();
  List<BeaconRssi> _detectedBeacons = [];
  List<GeoJsonFeature> _mapFeatures = [];
  StreamSubscription? _scanSubscription;
  bool _isScanning = false;
  bool _isLoadingMap = false;
  String _mapError = '';

  @override
  void initState() {
    super.initState();
    _loadMapData();
  }

  Future<void> _loadMapData() async {
    setState(() {
      _isLoadingMap = true;
      _mapError = '';
    });
    try {
      final features = await _mapService.fetchMapData();
      setState(() => _mapFeatures = features);
    } catch (e) {
      setState(() => _mapError = e.toString());
    } finally {
      setState(() => _isLoadingMap = false);
    }
  }

  void _startScanning() async {
    if (_isScanning) {
      _stopScanning();
      return;
    }

    setState(() => _isScanning = true);
    if (await FlutterBluePlus.isSupported) {
      await FlutterBluePlus.startScan(
        timeout: const Duration(seconds: 5),
        continuousUpdates: true,
      );

      _scanSubscription = _scanner.scanBeacons().listen((beacons) {
        setState(() => _detectedBeacons = beacons);
        if (beacons.length >= 3) {
          final position = _trilaterate(beacons[0], beacons[1], beacons[2]);
          _filter.update(position, 0.5);
          setState(() => _position = _filter.estimate);
        }
      });
    }
  }

  void _stopScanning() {
    _scanSubscription?.cancel();
    FlutterBluePlus.stopScan();
    setState(() => _isScanning = false);
  }

  vm.Vector2 _trilaterate(BeaconRssi b1, BeaconRssi b2, BeaconRssi b3) {
    final a = 2 * (b2.x - b1.x);
    final bVal = 2 * (b2.y - b1.y);
    final c = pow(b1.distance, 2) - pow(b2.distance, 2)
        - pow(b1.x, 2) + pow(b2.x, 2)
        - pow(b1.y, 2) + pow(b2.y, 2);

    final d = 2 * (b3.x - b2.x);
    final e = 2 * (b3.y - b2.y);
    final f = pow(b2.distance, 2) - pow(b3.distance, 2)
        - pow(b2.x, 2) + pow(b3.x, 2)
        - pow(b2.y, 2) + pow(b3.y, 2);

    final x = (c * e - f * bVal) / (e * a - bVal * d);
    final y = (c * d - a * f) / (bVal * d - a * e);

    return vm.Vector2(x.toDouble(), y.toDouble());
  }

  @override
  void dispose() {
    _stopScanning();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('BLE Indoor Navigation')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 16.0, left: 16.0, right: 16.0),
            child: ElevatedButton(
              onPressed: _startScanning,
              child: Text(_isScanning ? 'Stop Scanning' : 'Start Scanning'),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: _buildPositionInfo(),
          ),
          if (_isLoadingMap)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: CircularProgressIndicator(),
            ),
          if (_mapError.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(
                'Map Error: $_mapError',
                style: const TextStyle(color: Colors.red),
              ),
            ),
          Expanded(
            child: Stack(
              children: [
                CustomPaint(
                  painter: LocationPainter(_position, _detectedBeacons, _mapFeatures),
                  size: Size.infinite,
                ),
                _buildDebugPanel(),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: _buildBeaconStatus(),
          ),
        ],
      ),
    );
  }

  Widget _buildPositionInfo() {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8.0),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.3),
            spreadRadius: 2,
            blurRadius: 5,
            offset: const Offset(0, 3),
          ),
        ]
      ),
      child: Column(
        children: [
          const Text(
            'Current Position:',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'X: ${_position.x.toStringAsFixed(2)}, Y: ${_position.y.toStringAsFixed(2)}',
            style: const TextStyle(fontSize: 16),
          ),
          if (_isScanning)
            const Padding(
              padding: EdgeInsets.only(top: 8.0),
              child: Text('Scanning...', 
                style: TextStyle(color: Colors.teal, fontStyle: FontStyle.italic)),
            ),
        ],
      ),
    );
  }

  Widget _buildDebugPanel() {
    return Positioned(
      top: 10,
      left: 10,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.7),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Detected Beacons:',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ..._detectedBeacons.map((beacon) => Text(
              '${beacon.beacon.name}: ${beacon.distance.toStringAsFixed(2)}m '
                  '(RSSI: ${beacon.rssi})',
              style: const TextStyle(color: Colors.white),
            )),
            if (_detectedBeacons.length < 3)
              const Text('Need at least 3 beacons!',
                  style: TextStyle(color: Colors.red, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _buildBeaconStatus() {
    return Wrap(
      spacing: 10,
      children: BeaconScanner.knownBeacons.map((beacon) => Card(
        elevation: 3,
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.bluetooth,
                color: _detectedBeacons.any((b) => b.beacon.name == beacon.name)
                    ? Colors.green
                    : Colors.grey,
                size: 30,
              ),
              Text(beacon.name, style: const TextStyle(fontSize: 12)),
            ],
          ),
        )
      )).toList(),
    );
  }
}

class KalmanFilter {
  vm.Vector2 estimate = vm.Vector2.zero();
  double uncertainty = 1.0;

  void update(vm.Vector2 measurement, double measurementUncertainty) {
    final gain = uncertainty / (uncertainty + measurementUncertainty);
    estimate += (measurement - estimate) * gain;
    uncertainty *= (1 - gain);
  }
}

class LocationPainter extends CustomPainter {
  final vm.Vector2 position;
  final List<BeaconRssi> beacons;
  final List<GeoJsonFeature> mapFeatures;

  LocationPainter(this.position, this.beacons, this.mapFeatures);

  @override
  void paint(Canvas canvas, Size size) {
    _drawMapFeatures(canvas, size);
    _drawGrid(canvas, size);
    _drawBeacons(canvas, size);
    _drawUserPosition(canvas, size);
  }

  void _drawGrid(Canvas canvas, Size size) {
    final gridPaint = Paint()
      ..color = Colors.grey[300]!
      ..strokeWidth = 0.5
      ..style = PaintingStyle.stroke;

    for (double x = 0; x < size.width; x += 50) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += 50) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }
  }

  void _drawMapFeatures(Canvas canvas, Size size) {
    final pointPaint = Paint()
      ..color = Colors.blue
      ..style = PaintingStyle.fill;

    final linePaint = Paint()
      ..color = Colors.black
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    for (final feature in mapFeatures) {
      final geometry = feature.geometry;
      switch (geometry.type) {
        case 'Point':
          final coords = (geometry.coordinates as List).cast<double>();
          final offset = Offset(
            coords[0] * 50 + size.width / 2,
            size.height / 2 - coords[1] * 50,
          );
          canvas.drawCircle(offset, 5, pointPaint);
          break;
          
        case 'LineString':
          final coordsList = (geometry.coordinates as List).cast<List<double>>();
          final points = coordsList.map((coords) => Offset(
            coords[0] * 50 + size.width / 2,
            size.height / 2 - coords[1] * 50,
          )).toList();
          
          final path = Path()..addPolygon(points, false);
          canvas.drawPath(path, linePaint);
          break;
      }
    }
  }

  void _drawBeacons(Canvas canvas, Size size) {
    for (final beacon in beacons) {
      final pos = Offset(
        beacon.x * 50 + size.width / 2,
        size.height / 2 - beacon.y * 50,
      );

      canvas.drawCircle(
        pos,
        12,
        Paint()
          ..color = Colors.green.withOpacity(0.3)
          ..style = PaintingStyle.fill,
      );

      final textSpan = TextSpan(
        text: '${beacon.distance.toStringAsFixed(1)}m',
        style: const TextStyle(color: Colors.black, fontSize: 10),
      );
      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      )..layout();
      textPainter.paint(canvas, pos + const Offset(-15, 15));
    }
  }

  void _drawUserPosition(Canvas canvas, Size size) {
    final userPos = Offset(
      position.x * 50 + size.width / 2,
      size.height / 2 - position.y * 50,
    );
    canvas.drawCircle(
      userPos,
      20,
      Paint()
        ..color = Colors.blue.withOpacity(0.5)
        ..style = PaintingStyle.fill,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}