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

export const invertY = (y, canvasHeight) => canvasHeight - y;

// Функция нужна чтобы убрать знаменитый jsовский прикол (0.1 + 0.2 === 0.300000000004)
export const fixPrecisionError = number => {
  const epsilon = 0.001;
  const nearestInt = Math.round(number)

  if (Math.abs(number - nearestInt) < epsilon) {
    return nearestInt;
  }

  return number;
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


