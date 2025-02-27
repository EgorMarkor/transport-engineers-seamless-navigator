import 'dart:collection';

import 'package:flutter/material.dart';
import 'package:seamless_navigation/models/map_objects.dart';
import 'package:seamless_navigation/utils/geometry_utils.dart';
import 'package:vector_math/vector_math.dart' as vm;

class NavigationGraph {
  final Map<double, NavGraphFloor> floors;
  final List<NavNode> interestingNodes;

  NavigationGraph({
    required this.floors,
    required this.interestingNodes,
  });

  List<NavNode> findPath(NavNode start, NavNode end, double floor) {
    print("start: ${start.position}; end: ${end.position}");
    if (start == end) return [start];

    final openSet = SplayTreeSet<_NodeFScore>((a, b) {
      final cmp = a.fScore.compareTo(b.fScore);
      return (cmp != 0) ? cmp : a.node.hashCode.compareTo(b.node.hashCode);
    });

    final cameFrom = <NavNode, NavNode>{};

    final gScore = <NavNode, double>{};
    final fScore = <NavNode, double>{};

    for (final node in floors[floor]!.nodes) {
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

  factory NavigationGraph.build(
    List<Wall> walls,
    List<Door> doors,
    List<Stairs> stairs,
    List<PointOfInterest> pois,
  ) {
    final doorNodes = doors
        .map((door) => NavNode(position: vm.Vector2(door.x, door.y), floor: door.floor, isStairs: false))
        .toList();
    final poiNodes = pois.map((poi) => NavNode(
        position: vm.Vector2(poi.x, poi.y), description: poi.description, floor: poi.floor, isStairs: false)).toList();
    final stairsNodes = stairs.expand((staircase) => [
      NavNode(position: staircase.direction.first, floor: staircase.startFloor, isStairs: true),
      NavNode(position: staircase.direction[1], floor: staircase.endFloor, isStairs: true),
    ]).toList();

    final nodes = [...doorNodes, ...poiNodes, ...stairsNodes];

    final Map<double, List<NavNode>> nodesByFloor = {};
    for (final node in nodes) {
      nodesByFloor.putIfAbsent(node.floor, () => []).add(node);
    }

    final sortedFloors = nodesByFloor.keys.toList()..sort();
    final List<List<NavNode>> groupedNodes = sortedFloors.map((floor) => nodesByFloor[floor]!).toList();

    final Map<double, NavGraphFloor> floors = {};

    for (final nodesOnOneFloor in groupedNodes) {
      for (int i = 0; i < nodesOnOneFloor.length; i++) {
        for (int j = i + 1; j < nodesOnOneFloor.length; j++) {
          final nodeA = nodes[i];
          final nodeB = nodes[j];

          bool isPathClear = nodeA.floor == nodeB.floor;
          
          if (!isPathClear) continue;

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

          if (!isPathClear) continue;

          final cost = (nodeA.position - nodeB.position).length;
          nodeA.edges.add(NavEdge(target: nodeB, cost: cost));
          nodeB.edges.add(NavEdge(target: nodeA, cost: cost)); 
        }
      }

      floors[nodesOnOneFloor.first.floor] = NavGraphFloor(
        nodes: nodesOnOneFloor, 
        interestingNodes: nodesOnOneFloor.where((n) => n.description != null).toList(),
      );
    }

    final allInterestingNodes = floors.values.expand((floor) {
      return floor.nodes.where((node) => node.description != null).toList();
    }).toList();

    return NavigationGraph(
      floors: floors,
      interestingNodes: allInterestingNodes,
    );
  }
}

class NavGraphFloor {
  final List<NavNode> nodes;
  final List<NavNode> interestingNodes;

  NavGraphFloor({
    required this.nodes,
    required this.interestingNodes,
  });
}

class NavNode {
  final vm.Vector2 position;
  final List<NavEdge> edges;
  final String? description;
  final double floor;
  final bool isStairs;

  NavNode({
    required this.position,
    required this.floor,
    required this.isStairs,
    this.description,
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
