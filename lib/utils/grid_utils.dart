import 'dart:ui';

class GridUtils {
  final Canvas canvas;
  final Size size;
  final double scale;

  GridUtils({required this.canvas, required this.size, required this.scale});

  double getScaledGridSize() {
    return size.width * 0.08 * scale;
  }
}
