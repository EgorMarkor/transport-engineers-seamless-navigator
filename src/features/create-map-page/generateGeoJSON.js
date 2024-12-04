const generateGeoJSON = floors => {
  const output = {
    "type": "FeatureCollection",
    "features": [],
  };

  Object.entries(floors).forEach(([floorNumber, floor]) => {
    const objects = floor.objects;

    objects.walls.forEach(wall => output.features.push({
      "type": "Feature",
      "properties": {
        "objectType": "wall",
        "floor": floorNumber,
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [wall.x1, wall.y1],
          [wall.x2, wall.y2],
        ],
      },
    }));

    objects.beacons.forEach(beacon => output.features.push({
      "type": "Feature",
      "properties": {
        "objectType": "beacon",
        "floor": floorNumber,
        "bluetoothID": beacon.ID,
      },
      "geometry": {
        "type": "Point",
        "coordinates": [beacon.x, beacon.y],
      },
    }));

    objects.doors.forEach(door => output.features.push({
      "type": "Feature",
      "properties": {
        "objectType": "door",
        "floor": floorNumber,
      },
      "geometry": {
        "type": "Point",
        "coordinates": [door.x, door.y],
      },
    }));
  });

  return output;
};

export default generateGeoJSON;
