import {useEffect} from "react";
import {useEditorData} from "shared/hooks/useEditorData";
import {Arrow, Circle, Layer, Line} from "react-konva";
import {COLORS, Types} from "../editorConstants";
import {
  canvasToWorldCoords,
  createNewObject,
  flattenCoords,
  flatWorldToCanvasCoords,
  getFloorIndexByOffset
} from "../editorUtils";

const StairsLayer = () => {
  const {editorData, setEditorData} = useEditorData();

  const onClick = event => setEditorData(prev => {
    const newEditorData = {...prev};

    if (![Types.STAIRS_UP, Types.STAIRS_DOWN].includes(newEditorData.currentState.tool) || event.evt.button !== 0) {
      return newEditorData;
    }

    const {floors} = newEditorData;
    const {tool, settings, input, geometry, newObjects, floor: currentFloor} = newEditorData.currentState;
    const {scaledGridSize, offset} = geometry;
    const cursorPosition = settings.gridSnappingEnabled ?
      input.cursorPositionSnapped :
      input.closestWallPoint.screenCoords || input.cursorPosition;

    const {x: newX, y: newY} = canvasToWorldCoords(cursorPosition, scaledGridSize, offset);
    const {newStairs} = newObjects;

    if (!newStairs.bounds) {
      newEditorData.currentState.newObjects.newStairs.bounds = {x1: newX, y1: newY};
      newEditorData.currentState.newObjects.newStairs.type = tool;
      return newEditorData;
    }

    for (let i = 1; i <= 4; i++) {
      if (newStairs.bounds[`x${i}`] && newStairs.bounds[`y${i}`]) {
        continue;
      }

      newEditorData.currentState.newObjects.newStairs.bounds[`x${i}`] = newX;
      newEditorData.currentState.newObjects.newStairs.bounds[`y${i}`] = newY;
      return newEditorData;
    }

    if (!newStairs.direction) {
      newEditorData.currentState.newObjects.newStairs.direction = {x1: newX, y1: newY};
      return newEditorData;
    }

    const potentialStairs = {
      type: newStairs.type,
      startFloor: currentFloor,
      endFloor: getFloorIndexByOffset(
        floors,
        currentFloor,
        newStairs.type === Types.STAIRS_UP ? 1 : -1,
      ),
      bounds: newStairs.bounds,
      direction: {...newStairs.direction, x2: newX, y2: newY},
    };

    const isValid = true; // TODO сделать проверку на то что лестница не пересекается ни с чем и этаж сверху существует

    if (isValid) {
      createNewObject(newEditorData, potentialStairs, newStairs.type);
    }

    return newEditorData;
  });

  useEffect(() => setEditorData(prev => {
    const newEditorData = {...prev};
    newEditorData.eventListeners.onClick.push(onClick);
    return newEditorData;
  }), []);

  const {floors} = editorData;
  const {tool, floor: currentFloor, input, geometry, settings, newObjects} = editorData.currentState;
  const {gridSnappingEnabled} = settings;
  const {scaledGridSize, offset} = geometry;
  const {newStairs} = newObjects;
  const stairsUp = floors[currentFloor]?.objects[Types.STAIRS_UP] || [];
  const stairsDown = floors[currentFloor]?.objects[Types.STAIRS_DOWN] || [];
  const cursorPosition = gridSnappingEnabled ?
    input.cursorPositionSnapped :
    input.closestWallPoint.screenCoords || input.cursorPosition;

  const newStairsBounds = flatWorldToCanvasCoords(
    flattenCoords(newStairs.bounds),
    scaledGridSize,
    offset,
  );
  if (newStairsBounds.length === 8) {
    newStairsBounds.push(...newStairsBounds.slice(0, 2));
  } else {
    newStairsBounds.push(cursorPosition?.x, cursorPosition?.y)
  }

  return (
    <Layer>
      {[Types.STAIRS_UP, Types.STAIRS_DOWN].includes(tool) && cursorPosition && (
        <Circle
          x={cursorPosition.x}
          y={cursorPosition.y}
          radius={10}
          fill={newStairsBounds.length < 10 ? COLORS[tool].bounds : COLORS[tool].direction}
        />
      )}
      {[Types.STAIRS_UP, Types.STAIRS_DOWN].includes(tool) && cursorPosition && newStairs && <>
        {newStairs.bounds && (
          <Line
            key="new-stairs-bounds"
            points={newStairsBounds}
            stroke={COLORS[tool].bounds}
            strokeWidth={3}
          />
        )}
        {newStairs.direction && (
          <Arrow
            key="new-stairs-direction"
            points={[
              newStairs.direction.x1 * scaledGridSize + offset.x,
              -newStairs.direction.y1 * scaledGridSize + offset.y,
              cursorPosition.x,
              cursorPosition.y,
            ]}
            stroke={COLORS[tool].direction}
            strokeWidth={3}
          />
        )}
      </>}
      {[...stairsUp, ...stairsDown].map((stairs, index) => <>
        <Line
          key={`${stairs.type}-${index}-bounds`}
          points={flatWorldToCanvasCoords(
            flattenCoords(stairs.bounds),
            scaledGridSize,
            offset,
          )}
          stroke={COLORS[stairs.type].bounds}
          strokeWidth={3}
          closed={true}
        />
        <Arrow
          key={`${stairs.type}-${index}-direction`}
          points={flatWorldToCanvasCoords(
            flattenCoords(stairs.direction),
            scaledGridSize,
            offset,
          )}
          stroke={COLORS[stairs.type].direction}
          fill={COLORS[stairs.type].direction}
          strokeWidth={3}
          pointerWidth={15}
          pointerLength={15}
        />
      </>)}
    </Layer>
  );
};

export default StairsLayer;
