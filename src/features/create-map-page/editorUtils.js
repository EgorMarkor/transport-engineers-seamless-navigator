export const snapToGrid = (x, y, gridSize) => {
  const snappedX = Math.round(x / gridSize) * gridSize;
  const snappedY = Math.round(y / gridSize) * gridSize;

  return {x: snappedX, y: snappedY};
};
