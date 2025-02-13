class Beacon {
  final String name;
  final double x;
  final double y;

  const Beacon(this.name, this.x, this.y);
}

class Wall {
  final double startX;
  final double startY;
  final double endX;
  final double endY;

  const Wall(this.startX, this.startY, this.endX, this.endY);
}

class Door {
  final double x;
  final double y;

  const Door(this.x, this.y);
}
