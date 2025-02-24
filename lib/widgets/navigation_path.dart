import 'dart:math';

import 'package:flutter/material.dart';
import 'package:seamless_navigation/models/map_objects.dart';
import 'package:seamless_navigation/utils/geometry_utils.dart';
import 'package:vector_math/vector_math.dart' as vm;
import 'package:seamless_navigation/services/map_service.dart';
import '../models/navigation_graph.dart';

class NavigationPathWidget extends StatefulWidget {
  final MapService mapService;
  final vm.Vector2 userPosition;
  final Function(List<NavNode>)? onPathUpdated;

  const NavigationPathWidget({
    super.key,
    required this.mapService,
    required this.userPosition,
    this.onPathUpdated,
  });

  @override
  State<NavigationPathWidget> createState() => _NavigationPathWidgetState();
}

class _NavigationPathWidgetState extends State<NavigationPathWidget> {
  NavNode? destination;
  List<NavNode> _path = [];

  List<NavNode> _findVisibleNodes(
    vm.Vector2 position,
    List<NavNode> nodes,
    List<Wall> walls,
  ) {
    if (nodes.isEmpty) return [];

    List<NavNode> visibleNodes = [];

    for (final node in nodes) {
      bool isPathClear = true;

      final lineSegment1 = LineSegment(position, node.position);

      for (final wall in walls) {
        final lineSegment2 = LineSegment(
          vm.Vector2(wall.startX, wall.startY),
          vm.Vector2(wall.endX, wall.endY),
        );

        if (doLinesIntersect(lineSegment1, lineSegment2)) {
          isPathClear = false;
          break;
        }
      }

      if (isPathClear) {
        visibleNodes.add(node);
      }
    }

    return visibleNodes;
  }

  void _computePath() {
    final currentMap = widget.mapService.currentMap;

    if (currentMap == null || destination == null) return;

    final navGraph = currentMap.navGraph;

    final visibleNodes = _findVisibleNodes(
      widget.userPosition,
      navGraph.nodes,
      currentMap.walls,
    );

    List<List<NavNode>> paths = visibleNodes.map((node) {
      return navGraph.findPath(node, destination!);
    }).toList();
    paths.sort((a, b) => a.length.compareTo(b.length));

    if (paths.isEmpty) {
      setState(() {
        _path = [];
      });
      return;
    }

    final computedPath = paths.first;
    setState(() {
      _path = computedPath;
    });
    widget.onPathUpdated?.call(_path);
  }

  double _getPathLength(List<NavNode> path) {
    if (path.isEmpty) return 0;

    final dx = path.first.position.x - widget.userPosition.x;
    final dy = path.first.position.y - widget.userPosition.y;

    double totalLength = sqrt(dx * dx + dy * dy);

    if (path.length == 1) return totalLength;

    for (int i = 0; i < path.length - 1; i++) {
      final current = path[i].position;
      final next = path[i + 1].position;

      final dx = next.x - current.x;
      final dy = next.y - current.y;

      totalLength += sqrt(dx * dx + dy * dy);
    }

    return totalLength;
  }

  String getSecondsText(int number) {
    if (number % 10 == 1 && number % 100 != 11) {
      return "$number секунда";
    } else if ([2, 3, 4].contains(number % 10) &&
        !(11 <= number % 100 && number % 100 <= 14)) {
      return "$number секунды";
    } else {
      return "$number секунд";
    }
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

  @override
  Widget build(BuildContext context) {
    final currentMap = widget.mapService.currentMap;
    if (currentMap == null) {
      return const SizedBox.shrink();
    }
    final navGraph = currentMap.navGraph;

    final pathLength = _getPathLength(_path);
    final timeToDestinationMinutes = pathLength / (1.3 * 60);

    late String timeToDestination;
    if (timeToDestinationMinutes < 1) {
      final seconds = timeToDestinationMinutes * 60;
      timeToDestination = getSecondsText(seconds.round());
    } else {
      timeToDestination = getMinutesText(timeToDestinationMinutes.round());
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Padding(
          padding: const EdgeInsets.only(right: 8.0),
          child: Text(
            _path.isEmpty ? "Построить маршрут" : timeToDestination,
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(4.0),
          child: DropdownButton<NavNode>(
            hint: const Text("Место назначения"),
            value: destination,
            items: navGraph.interestingNodes
                .map((node) => DropdownMenuItem<NavNode>(
                      value: node,
                      child: Text(node.description ?? ""),
                    ))
                .toList(),
            onChanged: (node) {
              setState(() {
                destination = node;
              });
              _computePath();
            },
          ),
        ),
      ],
    );
  }
}
