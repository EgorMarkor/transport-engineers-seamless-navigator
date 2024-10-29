import {useEffect} from "react";
import {Stage} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";
import BackgroundLayer from "./CanvasObjects/BackgroundLayer";
import WallsLayer from "./CanvasObjects/WallsLayer";
import {snapToGrid} from "./editorUtils";

const EditorCanvas = () => {
  const {editorData, setEditorData} = useEditorData();

  useEffect(() => {  // TODO: добавить массив предыдущих действий чтобы работал ctrl + Z
    setEditorData({
      constants: {
        CANVAS_WIDTH: window.innerWidth * 0.8,
        CANVAS_HEIGHT: window.innerHeight * 0.905,
        GRID_SIZE: window.innerWidth * 0.05,
        WHEEL_SCALE_RATIO: 1.1,
      },
      currentState: {
        cursorPosition: null,
        cursorPositionSnapped: null,
        tool: null,
      },
      eventListeners: {
        onClick: [],
      },
      objects: {
        walls: [],
      },
    });
  }, []);

  const onMouseMove = event => {
    const mousePosition = event.target.getStage().getPointerPosition();

    const position = {x: mousePosition.x, y: mousePosition.y};
    const snappedPosition = snapToGrid(position.x, position.y, editorData.constants.GRID_SIZE);

    setEditorData(prev => {
      const newEditorData = {...prev};

      newEditorData.currentState.cursorPosition = position;
      newEditorData.currentState.cursorPositionSnapped = snappedPosition;

      return newEditorData;
    });
  };

  if (!editorData) {
    return <></>;
  }

  return (
    <Stage
      width={editorData.constants.CANVAS_WIDTH}
      height={editorData.constants.CANVAS_HEIGHT}
      onMouseMove={onMouseMove}
      onClick={event => editorData.eventListeners.onClick.forEach(callback => callback(event))}
    >
      <BackgroundLayer/>
      <WallsLayer/>
    </Stage>
  );
};

export default EditorCanvas;
