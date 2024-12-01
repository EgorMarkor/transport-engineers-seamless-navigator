import {Layer, Line, Rect} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";

const BackgroundLayer = () => {
  const {editorData, setEditorData} = useEditorData();

  const {CANVAS_HEIGHT, CANVAS_WIDTH} = editorData.constants;
  const {offset, scaledGridSize} = editorData.currentState.geometry;

  const lines = [];

  for (let y = offset.y % scaledGridSize; y <= CANVAS_HEIGHT; y += scaledGridSize) {
    lines.push(
      <Line
        key={`horizontal-${y}`}
        points={[0, y, CANVAS_WIDTH, y]}
        stroke="#004D37"
        strokeWidth={2}
      />
    );
  }

  for (let x = offset.x % scaledGridSize; x <= CANVAS_WIDTH; x += scaledGridSize) {
    lines.push(
      <Line
        key={`vertical-${x}`}
        points={[x, 0, x, CANVAS_HEIGHT]}
        stroke="#004D37"
        strokeWidth={2}
      />
    );
  }

  const onClick = event => setEditorData(prev => {
    const newEditorData = {...prev};
    if (newEditorData.currentState.tool === "select" && event.evt.button === 0) {
      newEditorData.currentState.selectedObject = null;
    }
    return newEditorData;
  });

  return (
    <Layer onClick={onClick}>
      <Rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#2F302D"/>
      {lines}
    </Layer>
  );
};

export default BackgroundLayer;
