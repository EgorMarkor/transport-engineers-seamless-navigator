import {Layer, Line, Rect} from "react-konva";
import {KonvaEventObject} from "konva/lib/Node";
import {useEditorState} from "shared/hooks/useEditorState";
import {COLORS} from "../EditorState/editorConstants";
import {Types} from "../EditorState/types";

const BackgroundLayer = () => {
  const {editorState, setEditorState} = useEditorState();

  const {CANVAS_HEIGHT, CANVAS_WIDTH} = editorState.getConstants();
  const {offset, scaledGridSize} = editorState.getCurrentGeometry();

  const lines = [];

  for (let y = offset.y % scaledGridSize; y <= CANVAS_HEIGHT; y += scaledGridSize) {
    lines.push(
      <Line
        key={`horizontal-${y}`}
        points={[0, y, CANVAS_WIDTH, y]}
        stroke={COLORS[Types.GRID]}
        strokeWidth={2}
      />
    );
  }

  for (let x = offset.x % scaledGridSize; x <= CANVAS_WIDTH; x += scaledGridSize) {
    lines.push(
      <Line
        key={`vertical-${x}`}
        points={[x, 0, x, CANVAS_HEIGHT]}
        stroke={COLORS[Types.GRID]}
        strokeWidth={2}
      />
    );
  }

  const onClick = (event: KonvaEventObject<PointerEvent>) => setEditorState(prevState => {
    const newState = prevState.copy();
    if (prevState.getCurrentTool() === "select" && event.evt.button === 0) {
      newState.clearSelection();
    }
    return newState;
  });

  return (
    <Layer onClick={onClick}>
      <Rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill={COLORS[Types.BACKGROUND]}/>
      {lines}
    </Layer>
  );
};

export default BackgroundLayer;
