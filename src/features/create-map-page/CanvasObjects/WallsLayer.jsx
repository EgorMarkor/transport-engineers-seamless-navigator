import {useEffect} from "react";
import {Circle, Layer, Line} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";
import {changeCursor, doWallsIntersect, fixPrecisionError, selectObject} from "../editorUtils";

const WallsLayer = () => {
  const {editorData, setEditorData} = useEditorData();
  const {tool, input, geometry, newObjects} = editorData.currentState;
  const scaledGridSize = geometry.scaledGridSize;
  const newWall = newObjects.newWall;

  const onClick = event => setEditorData(prev => {
    const newEditorData = {...prev};

    if (newEditorData.currentState.tool !== "wall" || event.evt.button !== 0) {
      return newEditorData;
    }

    const scaledGridSize = newEditorData.currentState.geometry.scaledGridSize;
    const {x, y} = newEditorData.currentState.input.cursorPositionSnapped;

    const newX = fixPrecisionError(x / scaledGridSize);  // Перевод коордов в метры
    const newY = fixPrecisionError(-y / scaledGridSize);

    const newWall = newEditorData.currentState.newObjects.newWall;

    if (!newWall) {
      newEditorData.currentState.newObjects.newWall = {x1: newX, y1: newY};
      return newEditorData;
    }

    const potentialWall = {x1: newWall.x1, y1: newWall.y1, x2: newX, y2: newY};

    if (!newEditorData.objects.walls.some(wall => doWallsIntersect(wall, potentialWall))) {
      newEditorData.objects.walls.push(potentialWall);
      newEditorData.currentState.newObjects.newWall = null;
      newEditorData.currentState.selectedObject = {
        type: "wall",
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

  return (
    <Layer x={geometry.offset.x} y={geometry.offset.y}>
      {tool === "wall" && input.cursorPosition && (
        <Circle
          x={input.cursorPositionSnapped.x}
          y={input.cursorPositionSnapped.y}
          radius={10}
          fill="#FF7827"
        />
      )}
      {tool === "wall" && input.cursorPosition && newWall !== null && (
        <Line
          key={`wall-${0}`}
          points={[
            newWall.x1 * scaledGridSize / geometry.scale,
            -newWall.y1 * scaledGridSize / geometry.scale,
            input.cursorPositionSnapped.x / geometry.scale,
            input.cursorPositionSnapped.y / geometry.scale,
          ]}
          stroke="#FF7827"
          strokeWidth={3}
          scaleX={geometry.scale}
          scaleY={geometry.scale}
        />
      )}
      {editorData.objects.walls.map((wall, index) => (
        <Line
          key={`wall-${index}`}
          points={[
            wall.x1 * scaledGridSize, -wall.y1 * scaledGridSize,
            wall.x2 * scaledGridSize, -wall.y2 * scaledGridSize,
          ]}
          stroke="#FF7827"
          strokeWidth={3 * geometry.scale}
          onClick={event => selectObject("wall", index, tool, event, setEditorData)}
          onMouseEnter={event => changeCursor("pointer", tool, event)}
          onMouseLeave={event => changeCursor("default", tool, event)}
          hitStrokeWidth={20}
        />
      ))}
    </Layer>
  );
};

export default WallsLayer;