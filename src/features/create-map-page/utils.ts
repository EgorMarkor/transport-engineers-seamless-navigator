import React from "react";
import {FloorsType, ObjectType, Point, Property, ToolType, Types, WallType} from "./EditorState/types";
import EditorState from "./EditorState/editorState";
import {KonvaEventObject} from "konva/lib/Node";
import {cloneDeep} from "lodash";

export const findClosestWallPoint = (walls: WallType[], point: Point, distanceThreshold: number): Point | null => {
  const findDotProjectionOnWall = (wall: WallType): Point => {
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

export const getFloorIndexByOffset = (floors: FloorsType, currentFloor: string, offset: number): string | null => {
  const sortedFloorNumbers = [...new Set([
    ...Object.keys(floors),
    currentFloor,
  ])].map(parseFloat).sort();

  const currentFloorIndex = sortedFloorNumbers.indexOf(parseFloat(currentFloor));
  const desiredFloorIndex = currentFloorIndex + offset;

  if (currentFloorIndex === -1 || desiredFloorIndex < 0 || desiredFloorIndex >= sortedFloorNumbers.length) {
    return null;
  }

  return sortedFloorNumbers[desiredFloorIndex].toString();
};

// From chatgpt with love ❤
export const doWallsIntersect = (wall1: WallType, wall2: WallType): boolean => {
  const p1 = {x: wall1.x1, y: wall1.y1};
  const p2 = {x: wall1.x2, y: wall1.y2};
  const q1 = {x: wall2.x1, y: wall2.y1};
  const q2 = {x: wall2.x2, y: wall2.y2};

  const orientation = (p: Point, q: Point, r: Point): number => {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0;
    return val > 0 ? 1 : 2;
  };

  const onSegment = (p: Point, q: Point, r: Point) => {
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

export const selectObject = (
  objectType: ObjectType,
  index: number,
  event: KonvaEventObject<MouseEvent>,
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>,
) => setEditorState(prevState => {
  const newState = prevState.copy();

  if (newState.getCurrentTool() === Types.SELECT && event.evt.button === 0) {
    newState.setSelectedObject({type: objectType, index: index});
  }

  return newState;
});

export const changeCursor = (
  cursorType: "pointer" | "default",
  tool: ToolType,
  event: KonvaEventObject<MouseEvent>,
) => {
  if (tool !== Types.SELECT) {
    return;
  }

  const stage = event.target.getStage();
  if (stage) {
    stage.container().style.cursor = cursorType;
  }
};

export const changeCoord = (
  coord: Property,
  objectType: ObjectType,
  event: React.FocusEvent<HTMLInputElement>,
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>,
) => setEditorState(prevState => {
  const newState = prevState.copy();

  const newCoord = parseFloat(event.target.value);
  const selectedObjectIndex = newState.getSelectedObject()?.index;

  if (isNaN(newCoord) || selectedObjectIndex === null) {
    return newState;
  }

  newState.getUndoStack().push(cloneDeep(newState.getFloors()));
  newState.setRedoStack([]);

  const objects = newState.getCurrentFloor().objects;
  const updatedObjectsArray = objects[objectType].map((obj, index) =>
    index === selectedObjectIndex
      ? {...obj, [coord]: newCoord}
      : obj
  );

  newState.setCurrentFloor({
    objects: {
      ...objects,
      [objectType]: updatedObjectsArray,
    }
  });

  return newState;
});

export const flattenCoords = (coords: { [x: string]: number; }) => {
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
