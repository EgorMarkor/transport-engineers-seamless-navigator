import {useEffect} from "react";
import {Circle, Layer} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";
import {Types} from "../editorConstants";
import {canvasToWorldCoords, changeCursor, selectObject} from "../editorUtils";

const BeaconsLayer = () => {
  const {editorData, setEditorData} = useEditorData();

  const onClick = event => setEditorData(prev => {
    const newEditorData = {...prev};

    if (newEditorData.currentState.tool !== Types.BEACONS || event.evt.button !== 0) {
      return newEditorData;
    }

    const {geometry, input, gridSnappingEnabled} = newEditorData.currentState;
    const {scaledGridSize, offset} = geometry;
    const beacons = newEditorData.objects.beacons;
    const cursorPosition = gridSnappingEnabled ?
      input.cursorPositionSnapped :
      input.closestWallPoint.screenCoords || input.cursorPosition;

    const {x: newX, y: newY} = canvasToWorldCoords(cursorPosition, scaledGridSize, offset);
    const isOccupied = beacons.some(beacon => beacon.x === newX && beacon.y === newY);

    if (!isOccupied) {
      newEditorData.undoStack.push(JSON.parse(JSON.stringify(newEditorData.objects)));
      newEditorData.redoStack = [];
      newEditorData.objects.beacons.push({x: newX, y: newY});
      newEditorData.currentState.selectedObject = {
        type: Types.BEACONS,
        index: beacons.length - 1,
        ID: "",
      };
    }

    return newEditorData;
  });

  useEffect(() => setEditorData(prev => {
    const newEditorData = {...prev};
    newEditorData.eventListeners.onClick.push(onClick);
    return newEditorData;
  }), []);

  const {tool, input, geometry, gridSnappingEnabled} = editorData.currentState;
  const {scaledGridSize, offset, scale} = geometry;
  const cursorPosition = gridSnappingEnabled ?
    input.cursorPositionSnapped :
    input.closestWallPoint.screenCoords || input.cursorPosition;

  return (
    <Layer>
      {tool === Types.BEACONS && input.cursorPosition && (
        <Circle
          x={cursorPosition.x}
          y={cursorPosition.y}
          radius={10}
          fill="#4F5AFF"
        />
      )}
      {editorData.objects.beacons.map((beacon, index) => (
        <Circle
          key={`beacon-${index}`}
          x={beacon.x * scaledGridSize + offset.x}
          y={-beacon.y * scaledGridSize + offset.y}
          radius={5 * scale}
          fill="#4F5AFF"
          onClick={event => selectObject(Types.BEACONS, index, tool, event, setEditorData)}
          onMouseEnter={event => changeCursor("pointer", tool, event)}
          onMouseLeave={event => changeCursor("default", tool, event)}
          hitStrokeWidth={20}
        />
      ))}
    </Layer>
  );
};

export default BeaconsLayer;
