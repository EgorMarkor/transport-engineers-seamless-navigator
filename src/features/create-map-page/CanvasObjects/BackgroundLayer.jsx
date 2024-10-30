import {Layer, Line, Rect} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";

const BackgroundLayer = () => {
  const {editorData} = useEditorData();
  const {CANVAS_HEIGHT, CANVAS_WIDTH, GRID_SIZE} = editorData.constants;
  const {offset, scale} = editorData.currentState.geometry;
  const SCALED_GRID_SIZE = GRID_SIZE * scale;

  const lines = [];

  // Horizontal lines
  for (let y = offset.y % SCALED_GRID_SIZE; y <= CANVAS_HEIGHT; y += SCALED_GRID_SIZE) {
    lines.push(
      <Line
        key={`horizontal-${y}`}
        points={[0, y, CANVAS_WIDTH, y]}
        stroke="#004D37"
        strokeWidth={2}
      />
    );
  }

  // Vertical lines
  for (let x = offset.x % SCALED_GRID_SIZE; x <= CANVAS_WIDTH; x += SCALED_GRID_SIZE) {
    lines.push(
      <Line
        key={`vertical-${x}`}
        points={[x, 0, x, CANVAS_HEIGHT]}
        stroke="#004D37"
        strokeWidth={2}
      />
    );
  }

  return (
    <Layer>
      <Rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#2F302D"/>
      {lines}
    </Layer>
  );
};

export default BackgroundLayer;
