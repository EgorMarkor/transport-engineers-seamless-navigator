import 'dart:math';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:seamless_navigation/services/map_service.dart';
import '../models/map_objects.dart';
import '../models/beacon_rssi.dart';

class BeaconScanner {
  final MapService mapService;
  List<Beacon> knownBeacons = [];

  BeaconScanner(this.mapService);

  Stream<List<BeaconRssi>> scanBeacons() async* {
    await for (final results in FlutterBluePlus.scanResults) {
      final List<BeaconRssi> beacons = [];

      for (final result in results) {
        final beaconName = result.advertisementData.localName;

        if (beaconName.isEmpty) {
          continue;
        }

        if (knownBeacons.isEmpty && beaconName.contains("BLE")) {
          final map = await mapService.fetchMap(beaconName);
          if (map != null) {
            knownBeacons = map.beacons;
          }
        }

        final beacon = knownBeacons.firstWhere(
          (b) => beaconName == b.name,
          orElse: () => const Beacon("", 0, 0),
        );

        if (beacon.name.isEmpty) {
          continue;
        }

        final txPower = result.advertisementData.txPowerLevel ?? -59;
        final distance = _calculateDistance(result.rssi, txPower);

        beacons.add(BeaconRssi(
          beacon: beacon,
          rssi: result.rssi,
          distance: distance,
        ));
      }

      beacons.sort((a, b) => a.distance.compareTo(b.distance));
      yield beacons.take(3).toList();
    }
  }

  double _calculateDistance(int rssi, int txPower) {
    const n = 15.0; // Path-loss exponent
    return pow(10, (txPower - rssi) / (10 * n)).toDouble();
  }
}
