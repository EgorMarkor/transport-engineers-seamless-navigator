export const snapToGrid = (x, y, gridSize, offset) => {
  const snappedX = Math.round((x - offset.x) / gridSize) * gridSize;
  const snappedY = Math.round((y - offset.y) / gridSize) * gridSize;

  return {x: snappedX, y: snappedY};
};
