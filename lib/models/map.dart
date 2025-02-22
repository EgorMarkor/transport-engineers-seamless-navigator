import 'dart:math';
import 'package:vector_math/vector_math.dart' as vm;
import 'map_objects.dart';
import 'package:seamless_navigation/models/navigation_graph.dart';
import '../utils/geometry_utils.dart';

class MapModel {
  final String type;
  final Map<String, dynamic> properties;
  final List<Feature> features;

  final List<Beacon> beacons;
  final List<Wall> walls;
  final List<Door> doors;

  late List<LineSegment> bounds;
  late NavigationGraph navGraph;

  MapModel({
    required this.type,
    required this.properties,
    required this.features,
    required this.walls,
    required this.beacons,
    required this.doors,
    required this.bounds,
    required this.navGraph,
  });

  static List<Feature> _translateFeatures(List<Feature> features) {
    double minX = double.infinity;
    double minY = double.infinity;

    for (final feature in features) {
      final geometry = feature.geometry;

      if (geometry.type == 'Point') {
        final coords = geometry.coordinates as List<dynamic>;

        final x = (coords[0] as num).toDouble();
        final y = (coords[1] as num).toDouble();

        if (x < minX) minX = x;
        if (y < minY) minY = y;
      } else if (geometry.type == 'LineString') {
        final coordsList = geometry.coordinates as List<dynamic>;

        for (final coords in coordsList) {
          final x = (coords[0] as num).toDouble();
          final y = (coords[1] as num).toDouble();
          if (x < minX) minX = x;
          if (y < minY) minY = y;
        }
      }
    }

    return features.map((feature) {
      final geometry = feature.geometry;

      if (geometry.type == 'Point') {
        final coords = geometry.coordinates as List<dynamic>;

        final x = (coords[0] as num).toDouble() - minX;
        final y = (coords[1] as num).toDouble() - minY;

        final translatedGeometry = Geometry(
          type: geometry.type,
          coordinates: [x, y],
        );

        return Feature(
          type: feature.type,
          properties: feature.properties,
          geometry: translatedGeometry,
        );
      } else if (geometry.type == 'LineString') {
        final coordsList = geometry.coordinates as List<dynamic>;

        final translatedCoordsList = coordsList.map((coords) {
          final x = (coords[0] as num).toDouble() - minX;
          final y = (coords[1] as num).toDouble() - minY;
          return [x, y];
        }).toList();

        final translatedGeometry = Geometry(
          type: geometry.type,
          coordinates: translatedCoordsList,
        );

        return Feature(
          type: feature.type,
          properties: feature.properties,
          geometry: translatedGeometry,
        );
      }

      return feature;
    }).toList();
  }

  static List<Wall> _getWalls(List<Feature> features) {
    return features
        .where((feature) =>
            feature.properties['objectType'] == 'wall' &&
            feature.geometry.type == 'LineString')
        .map((feature) {
      final coordinates = feature.geometry.coordinates as List<dynamic>;
      final start = coordinates[0] as List<dynamic>;
      final end = coordinates[1] as List<dynamic>;
      final startX = (start[0] as num).toDouble();
      final startY = (start[1] as num).toDouble();
      final endX = (end[0] as num).toDouble();
      final endY = (end[1] as num).toDouble();
      return Wall(startX, startY, endX, endY);
    }).toList();
  }

  static List<Beacon> _getBeacons(List<Feature> features) {
    return features
        .where((feature) =>
            feature.properties['objectType'] == 'beacon' &&
            feature.properties.containsKey('bluetoothID'))
        .map((feature) {
      final name = feature.properties['bluetoothID'] as String;
      final coordinates = feature.geometry.coordinates as List<dynamic>;
      final x = (coordinates[0] as num).toDouble();
      final y = (coordinates[1] as num).toDouble();
      return Beacon(name, x, y);
    }).toList();
  }

  static List<Door> _getDoors(List<Feature> features) {
    return features
        .where((feature) => feature.properties['objectType'] == 'door')
        .map((feature) {
      final coordinates = feature.geometry.coordinates as List<dynamic>;
      final x = (coordinates[0] as num).toDouble();
      final y = (coordinates[1] as num).toDouble();
      return Door(x, y);
    }).toList();
  }

  static List<LineSegment> _getBounds(List<Wall> walls) {
    if (walls.isEmpty) return [];

    List<vm.Vector2> points = walls
        .expand((w) => [
              vm.Vector2(w.startX, w.startY),
              vm.Vector2(w.endX, w.endY),
            ])
        .toList();

    final bottomLeft = points.reduce(
      (a, b) => vm.Vector2(min(a.x, b.x), min(a.y, b.y)),
    );

    final topRight = points.reduce(
      (a, b) => vm.Vector2(max(a.x, b.x), max(a.y, b.y)),
    );

    final topLeft = vm.Vector2(bottomLeft.x, topRight.y);
    final bottomRight = vm.Vector2(topRight.x, bottomLeft.y);

    return [
      LineSegment(bottomLeft, topLeft),
      LineSegment(topLeft, topRight),
      LineSegment(topRight, bottomRight),
      LineSegment(bottomRight, bottomLeft),
    ];
  }

  static bool _areNormalized(List<Wall> walls) {
    for (int i = 0; i < walls.length; i++) {
      for (int j = i + 1; j < walls.length; j++) {
        if (!_areWallsCollinear(walls[i], walls[j])) continue;

        final wi = [
          vm.Vector2(walls[i].startX, walls[i].startY),
          vm.Vector2(walls[i].endX, walls[i].endY),
        ];
        final wj = [
          vm.Vector2(walls[j].startX, walls[j].startY),
          vm.Vector2(walls[j].endX, walls[j].endY),
        ];

        if (pointsEqual(wi[1], wj[0]) ||
            pointsEqual(wi[0], wj[1]) ||
            pointsEqual(wi[0], wj[0]) ||
            pointsEqual(wi[1], wj[1])) {
          return false;
        }
      }
    }

    return true;
  }

  static bool _areWallsCollinear(Wall wall1, Wall wall2) {
    final k1 = (wall1.endY - wall1.startY) / (wall1.endX - wall1.startX);
    final k2 = (wall2.endY - wall2.startY) / (wall2.endX - wall2.startX);
    return k1 == k2;
  }

  static List<Wall> _normalizeWalls(List<Wall> walls) {
    List<Wall> wallsToNormalize = List.from(walls);
    List<Wall> normalizedWalls = [];

    while (!_areNormalized(wallsToNormalize)) {
      bool mergedSomething = false;

      for (int i = 0; i < wallsToNormalize.length; i++) {
        for (int j = i + 1; j < wallsToNormalize.length; j++) {
          if (!_areWallsCollinear(wallsToNormalize[i], wallsToNormalize[j])) {
            continue;
          }

          final wi = [
            vm.Vector2(wallsToNormalize[i].startX, wallsToNormalize[i].startY),
            vm.Vector2(wallsToNormalize[i].endX, wallsToNormalize[i].endY),
          ];
          final wj = [
            vm.Vector2(wallsToNormalize[j].startX, wallsToNormalize[j].startY),
            vm.Vector2(wallsToNormalize[j].endX, wallsToNormalize[j].endY),
          ];

          if (pointsEqual(wi[1], wj[0])) {
            normalizedWalls.add(Wall(wi[0].x, wi[0].y, wj[1].x, wj[1].y));
            wallsToNormalize.removeAt(i);
            wallsToNormalize.removeAt(j - 1);
            mergedSomething = true;
            break;
          } else if (pointsEqual(wi[0], wj[1])) {
            normalizedWalls.add(Wall(wj[0].x, wj[0].y, wi[1].x, wi[1].y));
            wallsToNormalize.removeAt(i);
            wallsToNormalize.removeAt(j - 1);
            mergedSomething = true;
            break;
          } else if (pointsEqual(wi[0], wj[0])) {
            normalizedWalls.add(Wall(wi[1].x, wi[1].y, wj[1].x, wj[1].y));
            wallsToNormalize.removeAt(i);
            wallsToNormalize.removeAt(j - 1);
            mergedSomething = true;
            break;
          } else if (pointsEqual(wi[1], wj[1])) {
            normalizedWalls.add(Wall(wi[0].x, wi[0].y, wj[0].x, wj[0].y));
            wallsToNormalize.removeAt(i);
            wallsToNormalize.removeAt(j - 1);
            mergedSomething = true;
            break;
          }
        }

        if (mergedSomething) break;
      }
    }

    return normalizedWalls + wallsToNormalize;
  }

  factory MapModel.fromJson(Map<String, dynamic> json) {
    final features = (json['features'] as List<dynamic>)
        .map((e) => Feature.fromJson(e as Map<String, dynamic>))
        .toList();

    final translatedFeatures = _translateFeatures(features);

    final walls = _normalizeWalls(_getWalls(translatedFeatures));
    final beacons = _getBeacons(translatedFeatures);
    final doors = _getDoors(translatedFeatures);

    final bounds = _getBounds(walls);
    final navGraph = NavigationGraph.build(walls, doors);

    return MapModel(
      type: json['type'] as String,
      properties: json['properties'] as Map<String, dynamic>,
      features: translatedFeatures,
      walls: walls,
      beacons: beacons,
      bounds: bounds,
      doors: doors,
      navGraph: navGraph,
    );
  }
}

class Feature {
  final String type;
  final Map<String, dynamic> properties;
  final Geometry geometry;

  Feature({
    required this.type,
    required this.properties,
    required this.geometry,
  });

  factory Feature.fromJson(Map<String, dynamic> json) {
    return Feature(
      type: json['type'] as String,
      properties: json['properties'] as Map<String, dynamic>,
      geometry: Geometry.fromJson(json['geometry'] as Map<String, dynamic>),
    );
  }
}

class Geometry {
  final String type;
  final dynamic coordinates;

  Geometry({
    required this.type,
    required this.coordinates,
  });

  factory Geometry.fromJson(Map<String, dynamic> json) {
    return Geometry(
      type: json['type'] as String,
      coordinates: json['coordinates'],
    );
  }
}
