import 'package:flutter/material.dart';
import '../models/beacon_rssi.dart';

class DebugPanelWidget extends StatelessWidget {
  final List<BeaconRssi> detectedBeacons;
  final double floor;

  const DebugPanelWidget({super.key, required this.detectedBeacons, required this.floor});

  @override
  Widget build(BuildContext context) {
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
            const Text(
              'Detected Beacons:',
              style:
                  TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
            ...detectedBeacons.map(
              (beacon) => Text(
                '${beacon.beacon.name}: ${beacon.distance.toStringAsFixed(2)}m '
                '(RSSI: ${beacon.rssi})',
                style: const TextStyle(color: Colors.white),
              ),
            ),
            Text("floor: $floor"),
          ],
        ),
      ),
    );
  }
}
