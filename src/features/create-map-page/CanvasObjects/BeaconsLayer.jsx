import {useEffect} from "react";
import {Circle, Layer} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";
import {changeCursor, fixPrecisionError, selectObject} from "../editorUtils";

const BeaconsLayer = () => {
  const {editorData, setEditorData} = useEditorData();
  const {tool, input, geometry} = editorData.currentState;
  const scaledGridSize = geometry.scaledGridSize;

  const onClick = event => setEditorData(prev => {
    const newEditorData = {...prev};

    if (newEditorData.currentState.tool !== "beacon" || event.evt.button !== 0) {
      return newEditorData;
    }

    const scaledGridSize = newEditorData.currentState.geometry.scaledGridSize;
    const {x, y} = newEditorData.currentState.input.cursorPositionSnapped;

    const newX = fixPrecisionError(x / scaledGridSize);  // Перевод коордов в метры
    const newY = fixPrecisionError(y / scaledGridSize);

    const isOccupied = newEditorData.objects.beacons.some(beacon => beacon.x === newX && beacon.y === newY);

    if (!isOccupied) {
      newEditorData.objects.beacons.push({x: newX, y: newY});
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
      {tool === "beacon" && input.cursorPosition && (
        <Circle
          x={input.cursorPositionSnapped.x}
          y={input.cursorPositionSnapped.y}
          radius={10}
          fill="#4F5AFF"
        />
      )}
      {editorData.objects.beacons.map((beacon, index) => (
        <Circle
          key={`beacon-${index}`}
          x={beacon.x * scaledGridSize}
          y={beacon.y * scaledGridSize}
          radius={5 * geometry.scale}
          fill="#4F5AFF"
          onClick={event => selectObject("beacon", index, tool, event, setEditorData)}
          onMouseEnter={event => changeCursor("pointer", tool, event)}
          onMouseLeave={event => changeCursor("default", tool, event)}
          hitStrokeWidth={20}
        />
      ))}
    </Layer>
  );
};

export default BeaconsLayer;
