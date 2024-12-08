import {cloneDeep} from "lodash";
import {EMPTY_FLOOR, EMPTY_NEW_OBJECTS} from "./editorConstants";

export const changeCursor = (cursorType, tool, event) => {
  if (tool === "select") {
    event.target.getStage().container().style.cursor = cursorType;
  }
};

export const selectObject = (objectType, index, tool, event, setEditorData) => setEditorData(prev => {
  const newEditorData = {...prev};
  if (tool === "select" && event.evt.button === 0) {
    newEditorData.currentState.selectedObject = {
      type: objectType,
      index: index,
    };
  }
  return newEditorData;
});

export const canvasToWorldCoords = (coords, scaledGridSize, offset) => {
  // Функция нужна чтобы убрать jsовский прикол 0.1 + 0.2 === 0.300000000004
  const fixPrecisionError = number => {
    const epsilon = 0.001;

    const nearestInt = Math.round(number)
    if (Math.abs(number - nearestInt) < epsilon) {
      return nearestInt;
    }

    return number;
  };

  const worldX = fixPrecisionError((coords?.x - offset.x) / scaledGridSize);
  const worldY = fixPrecisionError(-(coords?.y - offset.y) / scaledGridSize);

  return {x: worldX, y: worldY};
};

// From chatgpt with love ❤
export const doWallsIntersect = (wall1, wall2) => {
  const p1 = {x: wall1.x1, y: wall1.y1};
  const p2 = {x: wall1.x2, y: wall1.y2};
  const q1 = {x: wall2.x1, y: wall2.y1};
  const q2 = {x: wall2.x2, y: wall2.y2};

  const orientation = (p, q, r) => {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0;
    return val > 0 ? 1 : 2;
  };

  const onSegment = (p, q, r) => {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
  };

  const o1 = orientation(p1, p2, q1);
  const o2 = orientation(p1, p2, q2);
  const o3 = orientation(q1, q2, p1);
  const o4 = orientation(q1, q2, p2);

  if (o1 === 0 && o2 === 0 && o3 === 0 && o4 === 0) {
    const wall1ContainsWall2 = onSegment(p1, q1, p2) && onSegment(p1, q2, p2);
    const wall2ContainsWall1 = onSegment(q1, p1, q2) && onSegment(q1, p2, q2);
    return wall1ContainsWall2 || wall2ContainsWall1;
  }

  return false;
};

export const findClosestWallPoint = (walls, point, distanceThreshold) => {
  const findDotProjectionOnWall = wall => {
    // Находение проекции точки на линию используя dot product
    // A---D-------------B
    //     C

    // Нахождение координат нужных векторов
    const ABx = wall.x2 - wall.x1;
    const ABy = wall.y2 - wall.y1;
    const ACx = point.x - wall.x1;
    const ACy = point.y - wall.y1;

    // Нахождение координат точки D
    const coefficient = (ABx * ACx + ABy * ACy) / (ABx * ABx + ABy * ABy);
    let Dx = wall.x1 + ABx * coefficient;
    let Dy = wall.y1 + ABy * coefficient;

    // Нахождение координат A и B для проверки того, что D принадлежит AB
    const Ax = Math.min(wall.x1, wall.x2);
    const Ay = Math.min(wall.y1, wall.y2);
    const Bx = Math.max(wall.x1, wall.x2);
    const By = Math.max(wall.y1, wall.y2);

    const withinX = (Dx >= Ax && Dx <= Bx);
    const withinY = (Dy >= Ay && Dy <= By);

    if (!withinX || !withinY) {
      // Оставляем точку D на краю линии, если она выходит за AB
      const distance1 = Math.sqrt(
        Math.pow(Ax - Dx, 2) + Math.pow(Ay - Dy, 2)
      );
      const distance2 = Math.sqrt(
        Math.pow(Bx - Dx, 2) + Math.pow(By - Dy, 2)
      );

      if (distance1 < distance2) {
        return {x: Ax, y: Ay};
      } else {
        return {x: Bx, y: By};
      }
    }

    return {x: Dx, y: Dy};
  };

  let closestPoint = null;
  let minimalDistance = Infinity;

  walls.forEach(wall => {
    const projectedPoint = findDotProjectionOnWall(wall);

    const distance = Math.sqrt(
      Math.pow(projectedPoint.x - point.x, 2) + Math.pow(projectedPoint.y - point.y, 2)
    );

    if (distance < minimalDistance && distance < distanceThreshold) {
      minimalDistance = distance;
      closestPoint = projectedPoint;
    }
  });

  return closestPoint;
}

export const changeCoord = (coord, objectsGroup, event, setEditorData) => setEditorData(prev => {
  const newEditorData = {...prev};
  const newCoord = parseFloat(event.target.value);

  if (isNaN(newCoord)) {
    return newEditorData;
  }

  newEditorData.undoStack.push(JSON.parse(JSON.stringify(newEditorData.floors)));
  newEditorData.redoStack = [];

  const floor = newEditorData.currentState.floor;
  const selectedWallIndex = newEditorData.currentState.selectedObject.index;
  newEditorData.floors[floor].objects[objectsGroup][selectedWallIndex][coord] = newCoord;

  return newEditorData;
});

export const createNewObject = (newEditorData, newObject, objectType) => {
  newEditorData.undoStack.push(cloneDeep(newEditorData.floors));
  newEditorData.redoStack = [];

  const floorNumber = newEditorData.currentState.floor;

  if (!newEditorData.floors[floorNumber]) {
    newEditorData.floors[floorNumber] = cloneDeep(EMPTY_FLOOR);
  }

  const objects = newEditorData.floors[floorNumber].objects[objectType];

  newEditorData.currentState.selectedObject = {
    type: objectType,
    index: objects.length,
  };

  newEditorData.floors[floorNumber].objects[objectType].push(newObject);
  newEditorData.currentState.newObjects = cloneDeep(EMPTY_NEW_OBJECTS);
};

export const getFloorIndexByOffset = (floors, currentFloor, offset) => {
  const sortedFloorNumbers = [...new Set([
    ...Object.keys(floors),
    currentFloor.toString(),
  ])].map(parseFloat).sort();

  const currentFloorIndex = sortedFloorNumbers.indexOf(currentFloor);
  const desiredFloorIndex = currentFloorIndex + offset;

  if (currentFloorIndex === -1 || desiredFloorIndex < 0 || desiredFloorIndex >= sortedFloorNumbers.length) {
    return null;
  }

  return sortedFloorNumbers[desiredFloorIndex];
};

export const getFloorByOffset = (floors, currentFloor, offset) => {
  const desiredFloorIndex = getFloorIndexByOffset(floors, currentFloor, offset);
  return floors[desiredFloorIndex];
}

export const flattenCoords = coords => {
  if (!coords) {
    return [];
  }

  const result = [];

  for (let i = 1; true; i++) {
    const x = coords[`x${i}`];
    const y = coords[`y${i}`];

    if (!x || !y) {
      break;
    }

    result.push(x, y);
  }

  return result;
};

export const flatWorldToCanvasCoords = (coords, scaledGridSize, offset) => {
  if (!coords) {
    return [];
  }

  return coords.map((coord, index) => {
    const coordOffset = index % 2 === 0 ? offset.x : offset.y;
    const axisDirection = index % 2 === 0 ? 1 : -1;

    return axisDirection * coord * scaledGridSize + coordOffset;
  });
};