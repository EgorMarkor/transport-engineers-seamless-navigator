const generateGeoJSON = objects => {
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
    },
    "geometry": {
      "type": "Point",
      "coordinates": [beacon.x, beacon.y],
    },
  }));

  return output;
};

export default generateGeoJSON;
