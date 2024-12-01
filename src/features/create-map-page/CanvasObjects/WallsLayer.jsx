import {useEffect} from "react";
import {Circle, Layer, Line} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";
import {Types} from "../editorConstants";
import {canvasToWorldCoords, changeCursor, doWallsIntersect, selectObject} from "../editorUtils";

const WallsLayer = () => {
  const {editorData, setEditorData} = useEditorData();

  const onClick = event => setEditorData(prev => {
    const newEditorData = {...prev};

    if (newEditorData.currentState.tool !== Types.WALLS || event.evt.button !== 0) {
      return newEditorData;
    }

    const {input, geometry, newObjects, gridSnappingEnabled} = newEditorData.currentState;
    const {scaledGridSize, offset} = geometry;
    const walls = newEditorData.objects.walls;
    const cursorPosition = gridSnappingEnabled ?
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
      newEditorData.undoStack.push(JSON.parse(JSON.stringify(newEditorData.objects)));
      newEditorData.redoStack = [];
      newEditorData.objects.walls.push(potentialWall);
      newEditorData.currentState.newObjects.newWall = null;
      newEditorData.currentState.selectedObject = {
        type: Types.WALLS,
        index: newEditorData.objects.walls.length - 1,
      };
    }

    return newEditorData;
  });

  useEffect(() => setEditorData(prev => {
    const newEditorData = {...prev};
    newEditorData.eventListeners.onClick.push(onClick);
    return newEditorData;
  }), []);

  const {tool, input, geometry, newObjects, gridSnappingEnabled} = editorData.currentState;
  const walls = editorData.objects.walls;
  const {scaledGridSize, offset} = geometry;
  const newWall = newObjects.newWall;
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
          fill="#FF7827"
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
          stroke="#FF7827"
          strokeWidth={3 * geometry.scale}
          onClick={event => selectObject(Types.WALLS, index, tool, event, setEditorData)}
          onMouseEnter={event => changeCursor("pointer", tool, event)}
          onMouseLeave={event => changeCursor("default", tool, event)}
          hitStrokeWidth={20}
        />
      ))}
      {tool === Types.WALLS && input.cursorPosition && newWall !== null && (
        <Line
          key={`wall-${0}`}
          points={[
            newWall.x1 * scaledGridSize + offset.x,
            -newWall.y1 * scaledGridSize + offset.y,
            cursorPosition.x,
            cursorPosition.y,
          ]}
          stroke="#FF7827"
          strokeWidth={3}
        />
      )}
    </Layer>
  );
};

export default WallsLayer;