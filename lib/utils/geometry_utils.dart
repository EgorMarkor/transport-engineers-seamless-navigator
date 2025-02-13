import 'dart:math';
import "package:vector_math/vector_math.dart" as vm;

const EPSILON = 0.000001;

bool pointsEqual(vm.Vector2 a, vm.Vector2 b) {
  return (a - b).length < EPSILON;
}

class LineSegment {
  final vm.Vector2 first;
  final vm.Vector2 second;
  LineSegment(this.first, this.second);

  List<vm.Vector2> getBoundingBox() {
    final minX = min(first.x, second.x);
    final minY = min(first.y, second.y);
    final maxX = max(first.x, second.x);
    final maxY = max(first.y, second.y);
    return [vm.Vector2(minX, minY), vm.Vector2(maxX, maxY)];
  }
}

double crossProduct(vm.Vector2 a, vm.Vector2 b) {
  return a.x * b.y - b.x * a.y;
}

bool doBoundingBoxesIntersect(List<vm.Vector2> d, List<vm.Vector2> w) {
  return d[0].x <= w[1].x &&
      d[1].x >= w[0].x &&
      d[0].y <= w[1].y &&
      d[1].y >= w[0].y;
}

bool isPointOnLine(LineSegment a, vm.Vector2 b) {
  final aTmp = LineSegment(
    vm.Vector2.zero(),
    vm.Vector2(a.second.x - a.first.x, a.second.y - a.first.y),
  );
  final bTmp = vm.Vector2(b.x - a.first.x, b.y - a.first.y);
  final r = crossProduct(aTmp.second, bTmp);
  return r.abs() < EPSILON;
}

bool isPointRightOfLine(LineSegment a, vm.Vector2 b) {
  final aTmp = LineSegment(
    vm.Vector2.zero(),
    vm.Vector2(a.second.x - a.first.x, a.second.y - a.first.y),
  );
  final bTmp = vm.Vector2(b.x - a.first.x, b.y - a.first.y);
  return crossProduct(aTmp.second, bTmp) < 0;
}

bool lineSegmentTouchesOrCrossesLine(LineSegment a, LineSegment b) {
  return isPointOnLine(a, b.first) ||
      isPointOnLine(a, b.second) ||
      (isPointRightOfLine(a, b.first) ^ isPointRightOfLine(a, b.second));
}

bool doLinesIntersect(
  LineSegment doorNodes,
  LineSegment wall,
) {
  final doorBox = doorNodes.getBoundingBox();
  final wallBox = wall.getBoundingBox();

  final doSegmentsIntersect = doBoundingBoxesIntersect(doorBox, wallBox) &&
      lineSegmentTouchesOrCrossesLine(doorNodes, wall) &&
      lineSegmentTouchesOrCrossesLine(wall, doorNodes);

  if (!doSegmentsIntersect) {
    return false;
  }

  late double x, y;

  if (doorNodes.first.x == doorNodes.second.x) {
    // Линия дверных нод вертикальная

    x = doorNodes.first.x;

    // Линия стены тоже вертикальная
    if (wall.first.x == wall.second.x) {
      // Не считаем за пересечение, так как две вертикальные линии либо
      // параллельны либо совпадают, в обоих случиях нет никаких помех для
      // навигации
      return false;
    }

    // Линия стены не вертикальная и ее можно представить как линейную функцию
    final k = (wall.second.y - wall.first.y) / (wall.second.x - wall.first.x);
    final b = wall.first.y - k * wall.first.x;

    y = k * x + b;
  } else if (wall.first.x == wall.second.x) {
    // Линия стены вертикальная, а линия дверных нод нет, то же самое что и
    // в предыдущем случае, но линии поменяны местами

    x = wall.first.x;

    final k = (doorNodes.second.y - doorNodes.first.y) /
        (doorNodes.second.x - doorNodes.first.x);
    final b = doorNodes.first.y - k * doorNodes.first.x;

    y = k * x + b;
  } else {
    // Обе линии не вертикальные, и их можно представить как линейную функцию
    final k1 = (doorNodes.second.y - doorNodes.first.y) /
        (doorNodes.second.x - doorNodes.first.x);
    final b1 = doorNodes.first.y - k1 * doorNodes.first.x;

    final k2 = (wall.second.y - wall.first.y) / (wall.second.x - wall.first.x);
    final b2 = wall.first.y - k2 * wall.first.x;

    if (k1 == k2) {
      // Линии параллельны либо совпадают, также не считаем
      // помехой для навигации
      return false;
    }

    x = (b2 - b1) / (k1 - k2);
    y = k1 * x + b1;
  }

  // Если точка пересечения совпадает с одной из дверей, то это не мешает
  // навигации
  return !(((doorNodes.first.x - x).abs() < EPSILON &&
          (doorNodes.first.y - y).abs() < EPSILON) ||
      ((doorNodes.second.x - x).abs() < EPSILON &&
          (doorNodes.second.y - y).abs() < EPSILON) ||
      ((wall.first.x - x).abs() < EPSILON &&
          (wall.first.y - y).abs() < EPSILON) ||
      ((wall.second.x - x).abs() < EPSILON &&
          (wall.second.y - y).abs() < EPSILON));
}
