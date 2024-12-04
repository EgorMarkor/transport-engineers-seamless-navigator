import {useEffect} from "react";
import {Circle, Layer, Line} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";
import {Types} from "../editorConstants";
import {
  canvasToWorldCoords,
  changeCursor,
  createNewObject,
  doWallsIntersect,
  getFloorBeneath,
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
    const walls = floor?.objects?.walls || [];
    const cursorPosition = settings.gridSnappingEnabled ?
      input.cursorPositionSnapped :
      input.closestWallPoint.screenCoords || input.cursorPosition;

    const {x: newX, y: newY} = canvasToWorldCoords(cursorPosition, scaledGridSize, offset);
    const newWall = newObjects.newWall;

    if (!newWall) {
      newEditorData.currentState.newObjects.newWall = {x1: newX, y1: newY};
      return newEditorData;
    }

    const potentialWall = {x1: newWall.x1, y1: newWall.y1, x2: newX, y2: newY};
    const isOccupied = walls.some(wall => doWallsIntersect(wall, potentialWall))

    if (!isOccupied) {
      createNewObject(newEditorData, potentialWall, Types.WALLS);
      newEditorData.currentState.newObjects.newWall = null;
    }

    return newEditorData;
  });

  useEffect(() => setEditorData(prev => {
    const newEditorData = {...prev};
    newEditorData.eventListeners.onClick.push(onClick);
    return newEditorData;
  }), []);

  const {tool, floor, input, geometry, newObjects, settings} = editorData.currentState;
  const {scaledGridSize, offset} = geometry;
  const {gridSnappingEnabled, showingObjectsBeneathEnabled} = settings;
  const newWall = newObjects.newWall;
  const walls = editorData.floors[floor]?.objects?.walls || [];
  const wallsBeneath = getFloorBeneath(editorData.floors, floor)?.objects?.walls || [];
  const cursorPosition = gridSnappingEnabled ?
    input.cursorPositionSnapped :
    input.closestWallPoint.screenCoords || input.cursorPosition;

  return (
    <Layer>
      {tool === Types.WALLS && input.cursorPosition && (
        <Circle
          x={cursorPosition.x}
          y={cursorPosition.y}
          radius={10}
          fill="rgb(255, 120, 39)"
        />
      )}
      {tool === Types.WALLS && input.cursorPosition && newWall !== null && (
        <Line
          key={`wall-${0}`}
          points={[
            newWall.x1 * scaledGridSize + offset.x,
            -newWall.y1 * scaledGridSize + offset.y,
            cursorPosition.x,
            cursorPosition.y,
          ]}
          stroke="rgb(255, 120, 39)"
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
          stroke="rgb(255, 120, 39)"
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
          stroke="rgb(255, 120, 39)"
          opacity={0.3}
          strokeWidth={3 * geometry.scale}
        />
      ))}
    </Layer>
  );
};

export default WallsLayer;