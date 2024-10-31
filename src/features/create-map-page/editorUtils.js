export const snapToGrid = (x, y, scaledGridSize, offset) => {
  const snappedX = Math.round((x - offset.x) / scaledGridSize) * scaledGridSize;
  const snappedY = Math.round((y - offset.y) / scaledGridSize) * scaledGridSize;

  return {x: snappedX, y: snappedY};
};
