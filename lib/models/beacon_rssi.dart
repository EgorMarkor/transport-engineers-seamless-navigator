import 'map_objects.dart';

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
