import {Image, Layer} from "react-konva";
import {useEffect, useState} from "react";
import doorSvgPath from "./door.svg";
import {useEditorState} from "shared/hooks/useEditorState";
import {Axis, Types} from "../EditorState/types";
import {KonvaEventObject} from "konva/lib/Node";
import {changeCursor, selectObject} from "../utils";

const DoorsLayer = () => {
  const {editorState, setEditorState} = useEditorState();

  const onClick = (event: KonvaEventObject<MouseEvent>) => setEditorState(prevState => {
    const newState = prevState.copy();

    const closestWallPoint = newState.getClosestWallPoint().worldCoords;

    if (newState.getCurrentTool() !== Types.DOORS || event.evt.button !== 0 || closestWallPoint === null) {
      return newState;
    }

    const doors = newState.getObjectsOnCurrentFloor(Types.DOORS);
    const newDoor = closestWallPoint;

    const isOccupied = doors.some(door => door.x === newDoor.x && door.y === newDoor.y);

    if (!isOccupied) {
      newState.addNewObject(newDoor, Types.DOORS);
    }

    return newState;
  });

  useEffect(() => setEditorState(prevState => {
    const newState = prevState.copy();
    newState.addOnClickListener(onClick);
    return newState;
  }), []);

  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = doorSvgPath;
    img.onload = () => setImage(img);
  }, []);

  const tool = editorState.getCurrentTool();
  const cursorPosition = editorState.getCurrentInput().cursorPosition;
  const closestWallPoint = editorState.getClosestWallPoint().screenCoords;
  const {INITIAL_GRID_SIZE} = editorState.getConstants();
  const doors = editorState.getObjectsOnCurrentFloor(Types.DOORS);

  const doorsBeneath = editorState.getSettings().showingObjectsBeneathEnabled
    ? editorState.getObjectsOnFloorBeneath(Types.DOORS)
    : [];
  const forcedDoors = editorState
    .getFloorsToForceShow()
    .flatMap(floorNumber => editorState.getObjectsOnFloor(floorNumber, Types.DOORS));

  return (
    <Layer>
      {tool === Types.DOORS && cursorPosition && image && (
        <Image
          image={image}
          width={INITIAL_GRID_SIZE}
          height={INITIAL_GRID_SIZE}
          offsetX={INITIAL_GRID_SIZE * 0.5}
          offsetY={INITIAL_GRID_SIZE * 0.5}
          x={closestWallPoint?.x || cursorPosition.x}
          y={closestWallPoint?.y || cursorPosition.y}
        />
      )}
      {image && doors.map((door, index) => (
        <Image
          key={`door-${index}`}
          image={image}
          width={INITIAL_GRID_SIZE}
          height={INITIAL_GRID_SIZE}
          offsetX={INITIAL_GRID_SIZE * 0.5}
          offsetY={INITIAL_GRID_SIZE * 0.5}
          x={editorState.worldToScreenCoord(door.x, Axis.X)}
          y={editorState.worldToScreenCoord(door.y, Axis.Y)}
          onClick={event => selectObject(Types.DOORS, index, event, setEditorState)}
          onMouseEnter={event => changeCursor("pointer", tool, event)}
          onMouseLeave={event => changeCursor("default", tool, event)}
        />
      ))}
      {image && [...doorsBeneath, ...forcedDoors].map((door, index) => (
        <Image
          key={`secondaryDoor-${index}`}
          image={image}
          opacity={0.3}
          width={INITIAL_GRID_SIZE}
          height={INITIAL_GRID_SIZE}
          offsetX={INITIAL_GRID_SIZE * 0.5}
          offsetY={INITIAL_GRID_SIZE * 0.5}
          x={editorState.worldToScreenCoord(door.x, Axis.X)}
          y={editorState.worldToScreenCoord(door.y, Axis.Y)}
        />
      ))}
    </Layer>
  );
};

export default DoorsLayer;
