import {FloorsType, Types} from "./EditorState/types";

interface GeoJSON {
  type: "FeatureCollection";
  features: Feature[];
}

interface Feature {
  type: "Feature";
  properties: Record<string, any>;
  geometry: Geometry;
}

type Geometry =
  | {
  type: "LineString";
  coordinates: [number, number][];
}
  | {
  type: "Point";
  coordinates: [number, number];
}
  | {
  bounds: {
    type: "Polygon";
    coordinates: [number, number][];
  };
  direction: {
    type: "LineString";
    coordinates: [number, number][];
  };
};

const generateGeoJSON = (floors: FloorsType): GeoJSON => {
  const output: GeoJSON = {
    "type": "FeatureCollection",
    "features": [],
  };

  Object.keys(floors).forEach(floorNumber => {
    const objects = floors[floorNumber].objects;

    objects[Types.WALLS].forEach(wall => output.features.push({
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

    objects[Types.BEACONS].forEach(beacon => output.features.push({
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

    objects[Types.DOORS].forEach(door => output.features.push({
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

    [...objects[Types.STAIRS_UP], ...objects[Types.STAIRS_DOWN]].forEach(stairs => output.features.push({
      "type": "Feature",
      "properties": {
        "objectType": stairs.type,
        "startFloor": stairs.startFloor,
        "endFloor": stairs.endFloor,
      },
      "geometry": {
        "bounds": {
          "type": "Polygon",
          "coordinates": [
            [stairs.bounds.x1, stairs.bounds.y1],
            [stairs.bounds.x2, stairs.bounds.y2],
            [stairs.bounds.x3, stairs.bounds.y3],
            [stairs.bounds.x4, stairs.bounds.y4],
          ],
        },
        "direction": {
          "type": "LineString",
          "coordinates": [
            [stairs.direction.x1, stairs.direction.y1],
            [stairs.direction.x2, stairs.direction.y2],
          ],
        },
      },
    }));
  });

  return output;
};

export default generateGeoJSON;
