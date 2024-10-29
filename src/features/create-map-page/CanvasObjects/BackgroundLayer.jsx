import {Layer, Line, Rect} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";

const BackgroundLayer = () => {
  const {editorData} = useEditorData();
  const {CANVAS_HEIGHT, CANVAS_WIDTH, GRID_SIZE} = editorData.constants;

  const lines = [];

  // Горизонтальные линии
  for (let i = 0; i < CANVAS_HEIGHT / GRID_SIZE; i++) {
    lines.push(
      <Line
        key={`horizontal-${i}`}
        points={[0, i * GRID_SIZE, CANVAS_WIDTH, i * GRID_SIZE]}
        stroke="#004D37"
        strokeWidth={2}
      />
    );
  }

  // Вертикальные линии
  for (let i = 0; i < CANVAS_WIDTH / GRID_SIZE; i++) {
    lines.push(
      <Line
        key={`vertical-${i}`}
        points={[i * GRID_SIZE, 0, i * GRID_SIZE, CANVAS_HEIGHT]}
        stroke="#004D37"
        strokeWidth={2}
      />
    );
  }

  return (
    <Layer>
      <Rect
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        fill="#2F302D"
      />
      {lines}
    </Layer>
  );
};

export default BackgroundLayer;
