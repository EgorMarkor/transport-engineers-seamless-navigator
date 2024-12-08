import {useEffect, useState} from "react";
import {Image, Layer} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";
import {Types} from "../editorConstants";
import {changeCursor, createNewObject, getFloorByOffset, selectObject} from "../editorUtils";
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

    const floor = newEditorData.currentState.floor;
    const doors = newEditorData.floors[floor]?.objects[Types.DOORS] || [];

    const {x: newX, y: newY} = closestWallPoint;
    const isOccupied = doors.some(door => door.x === newX && door.y === newY);

    if (!isOccupied) {
      const newDoor = {x: newX, y: newY};
      createNewObject(newEditorData, newDoor, Types.DOORS);
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
  const {tool, floor, geometry, input, settings, floorsToForceShow} = editorData.currentState;
  const {floors} = editorData;
  const {offset, scaledGridSize} = geometry;
  const {showingObjectsBeneathEnabled} = settings;
  const doors = editorData.floors[floor]?.objects[Types.DOORS] || [];
  const doorsBeneath = getFloorByOffset(editorData.floors, floor, -1)?.objects[Types.DOORS] || [];
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
      {doors.map((door, index) => (
        <Image
          key={`door-${index}`}
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
      {showingObjectsBeneathEnabled && doorsBeneath.map((door, index) => (
        <Image
          key={`door-beneath-${index}`}
          image={image}
          opacity={0.3}
          x={door.x * scaledGridSize + offset.x}
          y={-door.y * scaledGridSize + offset.y}
          width={INITIAL_GRID_SIZE}
          height={INITIAL_GRID_SIZE}
          offsetX={INITIAL_GRID_SIZE / 2}
          offsetY={INITIAL_GRID_SIZE / 2}
        />
      ))}
      {floorsToForceShow.map(floorNumber => floors[floorNumber]?.objects[Types.DOORS].map((door, index) => (
        <Image
          key={`forced-door-${floorNumber}-${index}`}
          image={image}
          opacity={0.3}
          x={door.x * scaledGridSize + offset.x}
          y={-door.y * scaledGridSize + offset.y}
          width={INITIAL_GRID_SIZE}
          height={INITIAL_GRID_SIZE}
          offsetX={INITIAL_GRID_SIZE / 2}
          offsetY={INITIAL_GRID_SIZE / 2}
        />
      )))}
    </Layer>
  )
};

export default DoorsLayer;
