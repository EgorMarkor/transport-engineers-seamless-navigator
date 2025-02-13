import 'dart:collection';

import 'package:seamless_navigation/models/map_objects.dart';
import 'package:seamless_navigation/utils/geometry_utils.dart';
import 'package:vector_math/vector_math.dart' as vm;

class NavigationGraph {
  final List<NavNode> nodes;

  NavigationGraph({required this.nodes});

  List<NavNode> findPath(NavNode start, NavNode end) {
    final openSet = SplayTreeSet<_NodeFScore>((a, b) {
      final cmp = a.fScore.compareTo(b.fScore);
      return (cmp != 0) ? cmp : a.node.hashCode.compareTo(b.node.hashCode);
    });

    final cameFrom = <NavNode, NavNode>{};

    final gScore = <NavNode, double>{};
    final fScore = <NavNode, double>{};

    for (final node in nodes) {
      gScore[node] = double.infinity;
      fScore[node] = double.infinity;
    }

    gScore[start] = 0.0;
    fScore[start] = (start.position - end.position).length;
    openSet.add(_NodeFScore(node: start, fScore: fScore[start]!));

    while (openSet.isNotEmpty) {
      final current = openSet.first.node;
      if (current == end) return _reconstructPath(cameFrom, current);

      openSet.removeWhere((entry) => entry.node == current);

      for (final edge in current.edges) {
        final neighbor = edge.target;
        final tentativeGScore = gScore[current]! + edge.cost;

        if (tentativeGScore < gScore[neighbor]!) {
          cameFrom[neighbor] = current;
          gScore[neighbor] = tentativeGScore;
          fScore[neighbor] =
              tentativeGScore + (neighbor.position - end.position).length;
          openSet.removeWhere((entry) => entry.node == neighbor);
          openSet.add(_NodeFScore(node: neighbor, fScore: fScore[neighbor]!));
        }
      }
    }

    return [];
  }

  _reconstructPath(Map<NavNode, NavNode> cameFrom, NavNode current) {
    final totalPath = <NavNode>[current];
    while (cameFrom.containsKey(current)) {
      current = cameFrom[current]!;
      totalPath.insert(0, current);
    }
    return totalPath;
  }

  factory NavigationGraph.build(List<Wall> walls, List<Door> doors) {
    final nodes = doors
        .map((door) => NavNode(position: vm.Vector2(door.x, door.y)))
        .toList();

    for (int i = 0; i < nodes.length; i++) {
      for (int j = i + 1; j < nodes.length; j++) {
        final nodeA = nodes[i];
        final nodeB = nodes[j];

        bool isPathClear = true;

        for (final wall in walls) {
          final doorNodes = LineSegment(nodeA.position, nodeB.position);
          final wallNodes = LineSegment(
            vm.Vector2(wall.startX, wall.startY),
            vm.Vector2(wall.endX, wall.endY),
          );

          if (doLinesIntersect(doorNodes, wallNodes)) {
            isPathClear = false;
            break;
          }
        }

        if (isPathClear) {
          final cost = (nodeA.position - nodeB.position).length;
          nodeA.edges.add(NavEdge(target: nodeB, cost: cost));
          nodeB.edges.add(NavEdge(target: nodeA, cost: cost));
        }
      }
    }

    return NavigationGraph(nodes: nodes);
  }
}

class NavNode {
  final vm.Vector2 position;
  final List<NavEdge> edges;

  NavNode({
    required this.position,
    List<NavEdge>? edges,
  }) : edges = edges ?? [];
}

class NavEdge {
  final NavNode target;
  final double cost;

  NavEdge({required this.target, required this.cost});
}

class _NodeFScore {
  final NavNode node;
  final double fScore;

  _NodeFScore({required this.node, required this.fScore});
}
