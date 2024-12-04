import {useEffect} from "react";
import {Circle, Layer} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";
import {Types} from "../editorConstants";
import {canvasToWorldCoords, changeCursor, createNewObject, getFloorBeneath, selectObject} from "../editorUtils";

const BeaconsLayer = () => {
  const {editorData, setEditorData} = useEditorData();

  const onClick = event => setEditorData(prev => {
    const newEditorData = {...prev};

    if (newEditorData.currentState.tool !== Types.BEACONS || event.evt.button !== 0) {
      return newEditorData;
    }

    const {floor, geometry, input, settings} = newEditorData.currentState;
    const {scaledGridSize, offset} = geometry;
    const beacons = newEditorData.floors[floor]?.objects?.beacons || [];
    const cursorPosition = settings.gridSnappingEnabled ?
      input.cursorPositionSnapped :
      input.closestWallPoint.screenCoords || input.cursorPosition;

    const {x: newX, y: newY} = canvasToWorldCoords(cursorPosition, scaledGridSize, offset);
    const isOccupied = beacons.some(beacon => beacon.x === newX && beacon.y === newY);

    if (!isOccupied) {
      const newBeacon = {x: newX, y: newY};
      createNewObject(newEditorData, newBeacon, Types.BEACONS);
    }

    return newEditorData;
  });

  useEffect(() => setEditorData(prev => {
    const newEditorData = {...prev};
    newEditorData.eventListeners.onClick.push(onClick);
    return newEditorData;
  }), []);

  const {tool, floor, input, geometry, settings} = editorData.currentState;
  const {scaledGridSize, offset, scale} = geometry;
  const {gridSnappingEnabled, showingObjectsBeneathEnabled} = settings;
  const beacons = editorData.floors[floor]?.objects?.beacons || [];
  const beaconsBeneath = getFloorBeneath(editorData.floors, floor)?.objects?.beacons || [];
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
          fill="rgb(79, 90, 255)"
        />
      )}
      {beacons.map((beacon, index) => (
        <Circle
          key={`beacon-${index}`}
          x={beacon.x * scaledGridSize + offset.x}
          y={-beacon.y * scaledGridSize + offset.y}
          radius={5 * scale}
          fill="rgb(79, 90, 255)"
          onClick={event => selectObject(Types.BEACONS, index, tool, event, setEditorData)}
          onMouseEnter={event => changeCursor("pointer", tool, event)}
          onMouseLeave={event => changeCursor("default", tool, event)}
          hitStrokeWidth={20}
        />
      ))}
      {showingObjectsBeneathEnabled && beaconsBeneath.map((beacon, index) => (
        <Circle
          key={`beacon-beneath-${index}`}
          x={beacon.x * scaledGridSize + offset.x}
          y={-beacon.y * scaledGridSize + offset.y}
          radius={5 * scale}
          fill="rgb(79, 90, 255)"
          opacity={0.3}
        />
      ))}
    </Layer>
  );
};

export default BeaconsLayer;
