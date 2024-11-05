import {useEffect, useState} from "react";
import {Image, Layer} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";
import {changeCursor, findClosestWallPoint, fixPrecisionError, selectObject} from "../editorUtils";
import doorSvgPath from "./door.svg";

const DoorsLevel = () => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = doorSvgPath;
    img.onload = () => setImage(img);
  }, []);

  const {editorData, setEditorData} = useEditorData();
  const {tool, geometry, input} = editorData.currentState;
  const {offset, scaledGridSize} = geometry;
  const INITIAL_GRID_SIZE = editorData.constants.INITIAL_GRID_SIZE;

  const cursorPositionWithoutOffset = {
    x: input.cursorPosition?.x - offset.x,
    y: input.cursorPosition?.y - offset.y,
  };

  const closestWallPoint = findClosestWallPoint(
    editorData.objects.walls.map(wall => {
      const newWall = {...wall};
      newWall.x1 = wall.x1 * scaledGridSize;
      newWall.y1 = -wall.y1 * scaledGridSize;
      newWall.x2 = wall.x2 * scaledGridSize;
      newWall.y2 = -wall.y2 * scaledGridSize;
      return newWall;
    }),
    cursorPositionWithoutOffset,
    INITIAL_GRID_SIZE * 0.7,
  );

  useEffect(() => setEditorData(prev => {
    const newEditorData = {...prev};
    newEditorData.currentState.newObjects.newDoor = closestWallPoint;
    return newEditorData;
  }), [editorData.currentState.input.cursorPosition]);

  const onClick = event => setEditorData(prev => {
    const newEditorData = {...prev};

    if (newEditorData.currentState.tool !== "door" || event.evt.button !== 0) {
      return newEditorData;
    }

    const scaledGridSize = newEditorData.currentState.geometry.scaledGridSize;
    const {x, y} = newEditorData.currentState.newObjects.newDoor;

    const newX = fixPrecisionError(x / scaledGridSize);  // Перевод коордов в метры
    const newY = fixPrecisionError(-y / scaledGridSize);

    const isOccupied = newEditorData.objects.walls.some(door => door.x === newX && door.y === newY);

    if (!isOccupied) {
      newEditorData.objects.doors.push({x: newX, y: newY});
      newEditorData.currentState.selectedObject = {
        type: "door",
        index: newEditorData.objects.beacons.length - 1,
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
    <Layer x={offset.x} y={offset.y}>
      {tool === "door" && input.cursorPosition && image && (
        <Image
          image={image}
          x={closestWallPoint?.x || cursorPositionWithoutOffset.x}
          y={closestWallPoint?.y || cursorPositionWithoutOffset.y}
          width={INITIAL_GRID_SIZE}
          height={INITIAL_GRID_SIZE}
          offsetX={INITIAL_GRID_SIZE / 2}
          offsetY={INITIAL_GRID_SIZE / 2}
        />
      )}
      {editorData.objects.doors.map((door, index) => (
        <Image
          key={`door ${index}`}
          image={image}
          x={door.x * scaledGridSize}
          y={-door.y * scaledGridSize}
          width={INITIAL_GRID_SIZE}
          height={INITIAL_GRID_SIZE}
          offsetX={INITIAL_GRID_SIZE / 2}
          offsetY={INITIAL_GRID_SIZE / 2}
          onClick={event => selectObject("door", index, tool, event, setEditorData)}
          onMouseEnter={event => changeCursor("pointer", tool, event)}
          onMouseLeave={event => changeCursor("default", tool, event)}
        />
      ))}
    </Layer>
  )
};

export default DoorsLevel;
