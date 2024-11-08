const generateGeoJSON = (objects) => {
  const output = {
    "type": "FeatureCollection",
    "features": [],
  };

  objects.walls.forEach(wall => output.features.push({
    "type": "Feature",
    "properties": {
      "objectType": "wall",
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
    },
    "geometry": {
      "type": "Point",
      "coordinates": [door.x, door.y],
    },
  }));

  return output;
};

export default generateGeoJSON;
