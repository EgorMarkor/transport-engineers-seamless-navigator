import {useEffect, useState} from "react";
import {Image, Layer} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";
import {Types} from "../editorConstants";
import {changeCursor, selectObject} from "../editorUtils";
import doorSvgPath from "./door.svg";

const DoorsLayer = () => {
  const {editorData, setEditorData} = useEditorData();

  const onClick = event => setEditorData(prev => {
    const newEditorData = {...prev};

    if (newEditorData.currentState.tool !== Types.DOORS || event.evt.button !== 0) {
      return newEditorData;
    }

    const closestWallPoint = newEditorData.currentState.input.closestWallPoint.worldCoords;

    if (!closestWallPoint) {
      return newEditorData;
    }

    const {x: newX, y: newY} = closestWallPoint;
    const isOccupied = newEditorData.objects.walls.some(door => door.x === newX && door.y === newY);

    if (!isOccupied) {
      newEditorData.undoStack.push(JSON.parse(JSON.stringify(newEditorData.objects)));
      newEditorData.redoStack = [];
      newEditorData.objects.doors.push({x: newX, y: newY});
      newEditorData.currentState.selectedObject = {
        type: Types.DOORS,
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

  const [image, setImage] = useState(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = doorSvgPath;
    img.onload = () => setImage(img);
  }, []);

  const INITIAL_GRID_SIZE = editorData.constants.INITIAL_GRID_SIZE;
  const {tool, geometry, input} = editorData.currentState;
  const {offset, scaledGridSize} = geometry;
  const cursorPosition = input.cursorPosition;
  const closestWallPoint = input.closestWallPoint.screenCoords;

  return (
    <Layer>
      {tool === Types.DOORS && input.cursorPosition && image && (
        <Image
          image={image}
          x={closestWallPoint?.x || cursorPosition.x}
          y={closestWallPoint?.y || cursorPosition.y}
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
          x={door.x * scaledGridSize + offset.x}
          y={-door.y * scaledGridSize + offset.y}
          width={INITIAL_GRID_SIZE}
          height={INITIAL_GRID_SIZE}
          offsetX={INITIAL_GRID_SIZE / 2}
          offsetY={INITIAL_GRID_SIZE / 2}
          onClick={event => selectObject(Types.DOORS, index, tool, event, setEditorData)}
          onMouseEnter={event => changeCursor("pointer", tool, event)}
          onMouseLeave={event => changeCursor("default", tool, event)}
        />
      ))}
    </Layer>
  )
};

export default DoorsLayer;
