import 'package:flutter/material.dart';
import 'package:seamless_navigation/models/map.dart';
import 'package:seamless_navigation/models/navigation_graph.dart';
import 'package:seamless_navigation/utils/grid_utils.dart';
import 'package:vector_math/vector_math.dart' as vm;

class LocationPainter extends CustomPainter {
  final vm.Vector2 position;
  final MapModel? map;
  final double scale; // Scale constant
  final Offset offset;
  final List<NavNode> navigationPath;
  final double floor;
  /// Animation value used to offset the dash pattern; update this via an AnimationController.
  final double animationValue;

  LocationPainter(
    this.position,
    this.floor,
    this.map, {
    this.scale = 10,
    this.offset = Offset.zero,
    this.navigationPath = const [],
    this.animationValue = 0.0,
  });

  void _drawUser(Canvas canvas, Size size, GridUtils gridUtils) {
    final scaledGridSize = gridUtils.getScaledGridSize();
    final userPos = Offset(
      position.x * scaledGridSize + offset.dx,
      position.y * scaledGridSize + offset.dy,
    );
    canvas.drawCircle(
      userPos,
      20,
      Paint()
        ..color = Colors.blue.withOpacity(0.5)
        ..style = PaintingStyle.fill,
    );
  }

  void _drawGrid(Canvas canvas, Size size, GridUtils gridUtils) {
    final gridPaint = Paint()
      ..color = Colors.grey[300]!
      ..strokeWidth = 0.5
      ..style = PaintingStyle.stroke;
    final scaledGridSize = gridUtils.getScaledGridSize();
    for (double x = offset.dx % scaledGridSize; x < size.width; x += scaledGridSize) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = offset.dy % scaledGridSize; y < size.height; y += scaledGridSize) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }
  }

  void _drawBeacons(Canvas canvas, Size size, GridUtils gridUtils) {
    if (map == null) return;
    final scaledGridSize = gridUtils.getScaledGridSize();
    for (final beacon in map!.beacons.where((b) => b.floor == floor)) {
      final pos = Offset(
        beacon.x * scaledGridSize + offset.dx,
        beacon.y * scaledGridSize + offset.dy,
      );
      canvas.drawCircle(
        pos,
        scale * 5,
        Paint()
          ..color = Colors.green.withOpacity(0.3)
          ..style = PaintingStyle.fill,
      );
    }
  }

  void _drawWalls(Canvas canvas, Size size, GridUtils gridUtils) {
    if (map == null) return;
    final scaledGridSize = gridUtils.getScaledGridSize();
    for (final wall in map!.walls.where((b) => b.floor == floor)) {
      final startPoint = Offset(
        wall.startX * scaledGridSize + offset.dx,
        wall.startY * scaledGridSize + offset.dy,
      );
      final endPoint = Offset(
        wall.endX * scaledGridSize + offset.dx,
        wall.endY * scaledGridSize + offset.dy,
      );
      canvas.drawLine(
        startPoint,
        endPoint,
        Paint()
          ..color = Colors.red[700]!
          ..style = PaintingStyle.fill,
      );
    }
  }

  void _drawDoors(Canvas canvas, Size size, GridUtils gridUtils) {
    if (map == null) return;
    final scaledGridSize = gridUtils.getScaledGridSize();
    for (final door in map!.doors.where((b) => b.floor == floor)) {
      final coord = Offset(
        door.x * scaledGridSize + offset.dx,
        door.y * scaledGridSize + offset.dy,
      );
      const doorIcon = Icons.door_front_door;
      final TextPainter textPainter = TextPainter(
        text: TextSpan(
          text: String.fromCharCode(doorIcon.codePoint),
          style: TextStyle(
            fontSize: 24.0,
            fontFamily: doorIcon.fontFamily,
            package: doorIcon.fontPackage,
            color: const Color.fromARGB(255, 163, 166, 161),
          ),
        ),
        textDirection: TextDirection.ltr,
      );
      textPainter.layout();
      final point = coord - Offset(textPainter.width / 2, textPainter.height / 2);
      textPainter.paint(canvas, point);
    }
  }

  void _drawPointsOfInterest(Canvas canvas, Size size, GridUtils gridUtils) {
    if (map == null) return;

    final scaledGridSize = gridUtils.getScaledGridSize();

    for (final poi in map!.pointsOfInterest.where((b) => b.floor == floor)) {
      final pos = Offset(
        poi.x * scaledGridSize + offset.dx,
        poi.y * scaledGridSize + offset.dy,
      );
      canvas.drawCircle(
        pos,
        scale * 5,
        Paint()
          ..color = Colors.brown.withOpacity(0.3)
          ..style = PaintingStyle.fill,
      );

          // Prepare the text (e.g., using beacon name or a fixed label)
      final textSpan = TextSpan(
        text: poi.description, // Replace with beacon.label if available
        style: const TextStyle(
          fontSize: 12.0,
          color: Colors.black,
        ),
      );
      
      final textPainter = TextPainter(
        text: textSpan,
        textAlign: TextAlign.center,
        textDirection: TextDirection.ltr,
      );
      
      textPainter.layout();
      
      // Position the text under the circle.
      // Adjust the vertical offset as needed.
      final textOffset = pos + Offset(-textPainter.width / 2, scale * 5 + 4);
      
      textPainter.paint(canvas, textOffset);
    }
  }

  void _drawNavigationPath(Canvas canvas, Size size, GridUtils gridUtils) {
    if (map == null || navigationPath.isEmpty) return;
    final scaledGridSize = gridUtils.getScaledGridSize();

    // Build the full path from the current position through all navigation nodes.
    final path = Path();
    path.moveTo(
      position.x * scaledGridSize + offset.dx,
      position.y * scaledGridSize + offset.dy,
    );
    for (final node in navigationPath) {
      path.lineTo(
        node.position.x * scaledGridSize + offset.dx,
        node.position.y * scaledGridSize + offset.dy,
      );
    }

    // Define the dash pattern.
    const double dashLength = 10.0;
    const double gapLength = 10.0;
    final double patternLength = dashLength + gapLength;

    final dashPaint = Paint()
      ..color = Colors.blue
      ..strokeWidth = 3.0
      ..style = PaintingStyle.stroke;

    // Compute the path metrics and animate the dash pattern offset.
    for (final metric in path.computeMetrics()) {
      // Use animationValue (modulo patternLength) to cycle the dash pattern.
      double distance = animationValue % patternLength;
      while (distance < metric.length) {
        final double start = distance;
        final double end = (distance + dashLength).clamp(0.0, metric.length);
        final extractedPath = metric.extractPath(start, end);
        canvas.drawPath(extractedPath, dashPaint);
        distance += patternLength;
      }
    }
  }

  @override
  void paint(Canvas canvas, Size size) {
    final gridUtils = GridUtils(
      canvas: canvas,
      size: size,
      scale: scale,
    );
    _drawUser(canvas, size, gridUtils);
    _drawGrid(canvas, size, gridUtils);
    _drawBeacons(canvas, size, gridUtils);
    _drawWalls(canvas, size, gridUtils);
    _drawDoors(canvas, size, gridUtils);
    _drawPointsOfInterest(canvas, size, gridUtils);
    _drawNavigationPath(canvas, size, gridUtils);
  }

  @override
  bool shouldRepaint(covariant LocationPainter oldDelegate) {
    return oldDelegate.map != map ||
        oldDelegate.position != position ||
        oldDelegate.scale != scale ||
        oldDelegate.offset != offset ||
        oldDelegate.navigationPath != navigationPath ||
        oldDelegate.animationValue != animationValue;
  }
}
