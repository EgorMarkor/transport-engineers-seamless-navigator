import {Circle, Layer} from "react-konva";
import {useEditorState} from "shared/hooks/useEditorState";
import {Axis, Types} from "../EditorState/types";
import {COLORS} from "../EditorState/editorConstants";
import {changeCursor, selectObject} from "../utils";
import {useEffect} from "react";
import {KonvaEventObject} from "konva/lib/Node";

const PointsOfInterestLayer = () => {
  const {editorState, setEditorState} = useEditorState();

  const onClick = (event: KonvaEventObject<MouseEvent>) => setEditorState(prevState => {
    const newState = prevState.copy();

    const cursorPosition = newState.getSnappedCursorPosition();

    if (newState.getCurrentTool() !== Types.POINTS_OF_INTEREST || event.evt.button !== 0 || !cursorPosition) {
      return newState;
    }

    const newBeacon = newState.screenToWorldCoords(cursorPosition);

    const isOccupied = newState
      .getObjectsOnCurrentFloor(Types.POINTS_OF_INTEREST)
      .some(pof => pof.x === newBeacon.x && pof.y === newBeacon.y);

    if (!isOccupied) {
      newState.addNewObject(newBeacon, Types.POINTS_OF_INTEREST);
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
  const pointsOfInterest = editorState.getObjectsOnCurrentFloor(Types.POINTS_OF_INTEREST);

  return (
    <Layer>
      {tool === Types.POINTS_OF_INTEREST && cursorPosition && (
        <Circle
          x={cursorPosition.x}
          y={cursorPosition.y}
          radius={10}
          fill={COLORS[Types.POINTS_OF_INTEREST]}
        />
      )}
      {pointsOfInterest.map((pof, index) => (
        <Circle
          key={`pof-${index}`}
          fill={COLORS[Types.POINTS_OF_INTEREST]}
          radius={scale * 5}
          hitStrokeWidth={20}
          x={editorState.worldToScreenCoord(pof.x, Axis.X)}
          y={editorState.worldToScreenCoord(pof.y, Axis.Y)}
          onMouseEnter={event => changeCursor("pointer", tool, event)}
          onMouseLeave={event => changeCursor("default", tool, event)}
          onClick={event => selectObject(Types.POINTS_OF_INTEREST, index, event, setEditorState)}
        />
      ))}
    </Layer>
  );
};

export default PointsOfInterestLayer;
