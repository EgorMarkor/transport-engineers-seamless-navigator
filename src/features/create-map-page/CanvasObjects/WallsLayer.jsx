import {useEffect} from "react";
import {Circle, Layer, Line} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";
import {COLORS, Types} from "../editorConstants";
import {
  canvasToWorldCoords,
  changeCursor,
  createNewObject,
  doWallsIntersect,
  getFloorByOffset,
  selectObject
} from "../editorUtils";

const WallsLayer = () => {
  const {editorData, setEditorData} = useEditorData();

  const onClick = event => setEditorData(prev => {
    const newEditorData = {...prev};

    if (newEditorData.currentState.tool !== Types.WALLS || event.evt.button !== 0) {
      return newEditorData;
    }

    const {floor: floorNumber, input, geometry, newObjects, settings} = newEditorData.currentState;
    const {scaledGridSize, offset} = geometry;
    const floor = newEditorData.floors[floorNumber];
    const walls = floor?.objects[Types.WALLS] || [];
    const cursorPosition = settings.gridSnappingEnabled ?
      input.cursorPositionSnapped :
      input.closestWallPoint.screenCoords || input.cursorPosition;

    const {x: newX, y: newY} = canvasToWorldCoords(cursorPosition, scaledGridSize, offset);
    const {newWall} = newObjects;

    if (!newWall) {
      newEditorData.currentState.newObjects.newWall = {x1: newX, y1: newY};
      return newEditorData;
    }

    const potentialWall = {x1: newWall.x1, y1: newWall.y1, x2: newX, y2: newY};
    const isOccupied = walls.some(wall => doWallsIntersect(wall, potentialWall))

    if (!isOccupied) {
      createNewObject(newEditorData, potentialWall, Types.WALLS);
    }

    return newEditorData;
  });

  useEffect(() => setEditorData(prev => {
    const newEditorData = {...prev};
    newEditorData.eventListeners.onClick.push(onClick);
    return newEditorData;
  }), []);

  const {floors} = editorData;
  const {tool, floor, input, geometry, newObjects, settings, floorsToForceShow} = editorData.currentState;
  const {scaledGridSize, offset} = geometry;
  const {gridSnappingEnabled, showingObjectsBeneathEnabled} = settings;
  const newWall = newObjects.newWall;
  const walls = floors[floor]?.objects[Types.WALLS] || [];
  const wallsBeneath = getFloorByOffset(editorData.floors, floor, -1)?.objects[Types.WALLS] || [];
  const cursorPosition = gridSnappingEnabled ?
    input.cursorPositionSnapped :
    input.closestWallPoint.screenCoords || input.cursorPosition;

  return (
    <Layer>
      {tool === Types.WALLS && cursorPosition && (
        <Circle
          x={cursorPosition.x}
          y={cursorPosition.y}
          radius={10}
          fill={COLORS[Types.WALLS]}
        />
      )}
      {tool === Types.WALLS && cursorPosition && newWall !== null && (
        <Line
          points={[
            newWall.x1 * scaledGridSize + offset.x,
            -newWall.y1 * scaledGridSize + offset.y,
            cursorPosition.x,
            cursorPosition.y,
          ]}
          stroke={COLORS[Types.WALLS]}
          strokeWidth={3}
        />
      )}
      {walls.map((wall, index) => (
        <Line
          key={`wall-${index}`}
          points={[
            wall.x1 * scaledGridSize + offset.x,
            -wall.y1 * scaledGridSize + offset.y,
            wall.x2 * scaledGridSize + offset.x,
            -wall.y2 * scaledGridSize + offset.y,
          ]}
          stroke={COLORS[Types.WALLS]}
          strokeWidth={3 * geometry.scale}
          onClick={event => selectObject(Types.WALLS, index, tool, event, setEditorData)}
          onMouseEnter={event => changeCursor("pointer", tool, event)}
          onMouseLeave={event => changeCursor("default", tool, event)}
          hitStrokeWidth={20}
        />
      ))}
      {showingObjectsBeneathEnabled && wallsBeneath.map((wall, index) => (
        <Line
          key={`wall-beneath-${index}`}
          points={[
            wall.x1 * scaledGridSize + offset.x,
            -wall.y1 * scaledGridSize + offset.y,
            wall.x2 * scaledGridSize + offset.x,
            -wall.y2 * scaledGridSize + offset.y,
          ]}
          stroke={COLORS[Types.WALLS]}
          opacity={0.3}
          strokeWidth={3 * geometry.scale}
        />
      ))}
      {floorsToForceShow.map(floorNumber => floors[floorNumber]?.objects[Types.WALLS].map((wall, index) => (
        <Line
          key={`forced-wall-${floorNumber}-${index}`}
          points={[
            wall.x1 * scaledGridSize + offset.x,
            -wall.y1 * scaledGridSize + offset.y,
            wall.x2 * scaledGridSize + offset.x,
            -wall.y2 * scaledGridSize + offset.y,
          ]}
          stroke={COLORS[Types.WALLS]}
          opacity={0.3}
          strokeWidth={3 * geometry.scale}
        />
      )))}
    </Layer>
  );
};

export default WallsLayer;