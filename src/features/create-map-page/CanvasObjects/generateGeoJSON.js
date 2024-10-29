const generateGeoJSON = (objects, gridSize) => {
  const output = {
    "type": "FeatureCollection",
    "features": [],
  };

  objects.walls.forEach(wall => {
    const wallObject = {
      "type": "Feature",
      "properties": {
        "objectType": "wall",
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [wall.x1 / gridSize, wall.y1 / gridSize],
          [wall.x2 / gridSize, wall.y2 / gridSize],
        ],
      },
    };

    output.features.push(wallObject);
  });

  return output;
};

export default generateGeoJSON;
