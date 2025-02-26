class Beacon {
  final String name;
  final double x;
  final double y;
  final double floor;

  const Beacon(this.name, this.x, this.y, this.floor);
}

class Wall {
  final double startX;
  final double startY;
  final double endX;
  final double endY;
  final double floor;

  const Wall(this.startX, this.startY, this.endX, this.endY, this.floor);
}

class Door {
  final double x;
  final double y;
  final double floor;

  const Door(this.x, this.y, this.floor);
}

class PointOfInterest {
  final double x;
  final double y;
  final String description;
  final double floor;

  const PointOfInterest(this.x, this.y, this.description, this.floor);
}
