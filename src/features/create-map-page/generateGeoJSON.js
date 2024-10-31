const generateGeoJSON = (objects, scaledGridSize) => {
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
          [wall.x1 / scaledGridSize, wall.y1 / scaledGridSize],
          [wall.x2 / scaledGridSize, wall.y2 / scaledGridSize],
        ],
      },
    };

    output.features.push(wallObject);
  });

  return output;
};

export default generateGeoJSON;
