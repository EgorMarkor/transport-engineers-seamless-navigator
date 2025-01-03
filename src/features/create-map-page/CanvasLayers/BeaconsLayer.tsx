import {useEditorState} from "shared/hooks/useEditorState";
import {KonvaEventObject} from "konva/lib/Node";
import {Circle, Layer} from "react-konva";
import {Axis, Types} from "../EditorState/types";
import {COLORS} from "../EditorState/editorConstants";
import {changeCursor, selectObject} from "../utils";
import {useEffect} from "react";

const BeaconsLayer = () => {
  const {editorState, setEditorState} = useEditorState();

  const onClick = (event: KonvaEventObject<MouseEvent>) => setEditorState(prevState => {
    const newState = prevState.copy();

    const cursorPosition = newState.getSnappedCursorPosition();

    if (newState.getCurrentTool() !== Types.BEACONS || event.evt.button !== 0 || !cursorPosition) {
      return newState;
    }

    const newBeacon = newState.screenToWorldCoords(cursorPosition);

    const isOccupied = newState
      .getObjectsOnCurrentFloor(Types.BEACONS)
      .some(beacon => beacon.x === newBeacon.x && beacon.y === newBeacon.y);

    if (!isOccupied) {
      newState.addNewObject(newBeacon, Types.BEACONS);
    }

    return newState;
  });

  useEffect(() => setEditorState(prevState => {
    const newState = prevState.copy();
    newState.addOnClickListener(onClick);
    return newState;
  }), []);

  const tool = editorState.getCurrentTool();
  const scale = editorState.getScale();
  const cursorPosition = editorState.getSnappedCursorPosition();
  const beacons = editorState.getObjectsOnCurrentFloor(Types.BEACONS);

  const beaconsBeneath = editorState.getSettings().showingObjectsBeneathEnabled
    ? editorState.getObjectsOnFloorBeneath(Types.BEACONS)
    : [];
  const forcedBeacons = editorState
    .getFloorsToForceShow()
    .flatMap(floorNumber => editorState.getObjectsOnFloor(floorNumber, Types.BEACONS));

  return (
    <Layer>
      {tool === Types.BEACONS && cursorPosition && (
        <Circle
          x={cursorPosition.x}
          y={cursorPosition.y}
          radius={10}
          fill={COLORS[Types.BEACONS]}
        />
      )}
      {beacons.map((beacon, index) => (
        <Circle
          key={`beacon-${index}`}
          fill={COLORS[Types.BEACONS]}
          radius={scale * 5}
          hitStrokeWidth={20}
          x={editorState.worldToScreenCoord(beacon.x, Axis.X)}
          y={editorState.worldToScreenCoord(beacon.y, Axis.Y)}
          onMouseEnter={event => changeCursor("pointer", tool, event)}
          onMouseLeave={event => changeCursor("default", tool, event)}
          onClick={event => selectObject(Types.BEACONS, index, event, setEditorState)}
        />
      ))}
      {[...beaconsBeneath, ...forcedBeacons].map((beacon, index) => (
        <Circle
          key={`secondaryBeacon-${index}`}
          fill={COLORS[Types.BEACONS]}
          radius={scale * 5}
          opacity={0.3}
          x={editorState.worldToScreenCoord(beacon.x, Axis.X)}
          y={editorState.worldToScreenCoord(beacon.y, Axis.Y)}
        />
      ))}
    </Layer>
  );
};

export default BeaconsLayer;