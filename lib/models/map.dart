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
  final List<PointOfInterest> pointsOfInterest;
  final List<Stairs> stairs;

  late List<LineSegment> bounds;
  late NavigationGraph navGraph;

  MapModel({
    required this.type,
    required this.properties,
    required this.features,
    required this.walls,
    required this.beacons,
    required this.pointsOfInterest,
    required this.doors,
    required this.stairs,
    required this.bounds,
    required this.navGraph,
  });

  static List<Feature> _translateFeatures(List<Feature> features) {
    double minX = double.infinity;
    double minY = double.infinity;

    // First pass: determine minX and minY
    for (final feature in features) {
      final geometry = feature.geometry;
      // For points and lines
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
      } else if (feature.properties['objectType'] == 'stairsUp' &&
          geometry.bounds != null &&
          geometry.direction != null) {
        // Check all coordinates in bounds and direction
        final List<dynamic> boundsCoords = geometry.bounds!.coordinates;
        final List<dynamic> directionCoords = geometry.direction!.coordinates;
        for (final coords in boundsCoords + directionCoords) {
          final x = (coords[0] as num).toDouble();
          final y = (coords[1] as num).toDouble();
          if (x < minX) minX = x;
          if (y < minY) minY = y;
        }
      }
    }

    // Second pass: translate each feature
    return features.map((feature) {
      final geometry = feature.geometry;
      // Points
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
      }
      // LineStrings
      else if (geometry.type == 'LineString') {
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
      // Stairs: translate both bounds and direction coordinates.
      else if (feature.properties['objectType'] == 'stairsUp' &&
          geometry.bounds != null &&
          geometry.direction != null) {
        final boundsCoords =
            (geometry.bounds!.coordinates as List<dynamic>).map((coords) {
          final x = (coords[0] as num).toDouble() - minX;
          final y = (coords[1] as num).toDouble() - minY;
          return [x, y];
        }).toList();

        final directionCoords =
            (geometry.direction!.coordinates as List<dynamic>).map((coords) {
          final x = (coords[0] as num).toDouble() - minX;
          final y = (coords[1] as num).toDouble() - minY;
          return [x, y];
        }).toList();

        final translatedBounds = Geometry(
          type: geometry.bounds!.type,
          coordinates: boundsCoords,
        );

        final translatedDirection = Geometry(
          type: geometry.direction!.type,
          coordinates: directionCoords,
        );

        final translatedGeometry = Geometry(
          type: 'stairs',
          coordinates: null,
          bounds: translatedBounds,
          direction: translatedDirection,
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
      final floor = double.parse(feature.properties["floor"] as String);
      return Wall(startX, startY, endX, endY, floor);
    }).toList();
  }

  static List<Stairs> _getStairs(List<Feature> features) {
    return features
        .where((feature) =>
            feature.properties["objectType"] == "stairsDown" ||
            feature.properties["objectType"] == "stairsUp")
        .map((feature) {
      final List<vm.Vector2> bounds =
          (feature.geometry.bounds!.coordinates as List)
              .map<vm.Vector2>((coord) => vm.Vector2(
                  (coord[0] as num).toDouble(), (coord[1] as num).toDouble()))
              .toList();

      final List<vm.Vector2> direction =
          (feature.geometry.direction!.coordinates as List)
              .map<vm.Vector2>((coord) => vm.Vector2(
                  (coord[0] as num).toDouble(), (coord[1] as num).toDouble()))
              .toList();

      final startFloor =
          double.parse(feature.properties["startFloor"] as String);
      final endFloor = double.parse(feature.properties["endFloor"] as String);
      final isUp = feature.properties["objectType"] == "stairsUp";

      return Stairs(bounds, direction, startFloor, endFloor, isUp);
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
      final floor = double.parse(feature.properties["floor"] as String);
      return Beacon(name, x, y, floor);
    }).toList();
  }

  static List<Door> _getDoors(List<Feature> features) {
    return features
        .where((feature) => feature.properties['objectType'] == 'door')
        .map((feature) {
      final coordinates = feature.geometry.coordinates as List<dynamic>;
      final x = (coordinates[0] as num).toDouble();
      final y = (coordinates[1] as num).toDouble();
      final floor = double.parse(feature.properties["floor"] as String);
      return Door(x, y, floor);
    }).toList();
  }

  static List<PointOfInterest> _getPointsOfInterest(List<Feature> features) {
    return features
        .where((feature) =>
            feature.properties['objectType'] == 'pointOfInterest' &&
            feature.properties.containsKey('description'))
        .map((feature) {
      final description = feature.properties['description'] as String;
      final coordinates = feature.geometry.coordinates as List<dynamic>;
      final x = (coordinates[0] as num).toDouble();
      final y = (coordinates[1] as num).toDouble();
      final floor = double.parse(feature.properties["floor"] as String);
      return PointOfInterest(x, y, description, floor);
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
    if (wall1.floor != wall2.floor) return false;
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
            normalizedWalls.add(Wall(
                wi[0].x, wi[0].y, wj[1].x, wj[1].y, wallsToNormalize[i].floor));
            wallsToNormalize.removeAt(i);
            wallsToNormalize.removeAt(j - 1);
            mergedSomething = true;
            break;
          } else if (pointsEqual(wi[0], wj[1])) {
            normalizedWalls.add(Wall(
                wj[0].x, wj[0].y, wi[1].x, wi[1].y, wallsToNormalize[i].floor));
            wallsToNormalize.removeAt(i);
            wallsToNormalize.removeAt(j - 1);
            mergedSomething = true;
            break;
          } else if (pointsEqual(wi[0], wj[0])) {
            normalizedWalls.add(Wall(
                wi[1].x, wi[1].y, wj[1].x, wj[1].y, wallsToNormalize[i].floor));
            wallsToNormalize.removeAt(i);
            wallsToNormalize.removeAt(j - 1);
            mergedSomething = true;
            break;
          } else if (pointsEqual(wi[1], wj[1])) {
            normalizedWalls.add(Wall(
                wi[0].x, wi[0].y, wj[0].x, wj[0].y, wallsToNormalize[i].floor));
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
    final pointsOfInterest = _getPointsOfInterest(translatedFeatures);
    final stairs = _getStairs(translatedFeatures);

    final bounds = _getBounds(walls);
    final navGraph = NavigationGraph.build(walls, doors, stairs, pointsOfInterest);
    ;

    return MapModel(
      type: json['type'] as String,
      properties: json['properties'] as Map<String, dynamic>,
      features: translatedFeatures,
      walls: walls,
      beacons: beacons,
      bounds: bounds,
      doors: doors,
      stairs: stairs,
      pointsOfInterest: pointsOfInterest,
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
  final Geometry? bounds;
  final Geometry? direction;

  Geometry({
    required this.type,
    required this.coordinates,
    this.bounds,
    this.direction,
  });

  factory Geometry.fromJson(Map<String, dynamic> json) {
    // If this is a stairs geometry, parse its extra fields.
    if (json.containsKey('bounds') && json.containsKey('direction')) {
      return Geometry(
        type: 'stairs', // you might want to distinguish stairs here
        coordinates: null,
        bounds: Geometry.fromJson(json['bounds'] as Map<String, dynamic>),
        direction: Geometry.fromJson(json['direction'] as Map<String, dynamic>),
      );
    }
    return Geometry(
      type: json['type'] as String,
      coordinates: json['coordinates'],
    );
  }
}
