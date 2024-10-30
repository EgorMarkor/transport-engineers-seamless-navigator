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
        tool: null,
        input: {
          cursorPosition: null,
          cursorPositionSnapped: null,
          isPanning: false,
        },
        geometry: {
          offset: {x: 0, y: 0},
          scale: 1,
        },
        newObjects: {
          newWall: null,
        },
      },
      eventListeners: {
        onClick: [],
      },
      objects: {
        walls: [],
      },
    });
  }, []);

  const onMouseMove = event => setEditorData(prev => {
    const newEditorData = {...prev};

    const mousePosition = event.target.getStage().getPointerPosition();
    const position = {x: mousePosition.x, y: mousePosition.y};

    if (newEditorData.currentState.input.isPanning) {
      const dx = position.x - prev.currentState.input.cursorPosition.x;
      const dy = position.y - prev.currentState.input.cursorPosition.y;

      newEditorData.currentState.geometry.offset = {
        x: prev.currentState.geometry.offset.x + dx,
        y: prev.currentState.geometry.offset.y + dy,
      };
    }

    const snappedPosition = snapToGrid(
      position.x, position.y,
      newEditorData.constants.GRID_SIZE,
      newEditorData.currentState.geometry.offset,
      newEditorData.currentState.geometry.scale,
    );

    newEditorData.currentState.input.cursorPosition = position;
    newEditorData.currentState.input.cursorPositionSnapped = snappedPosition;

    return newEditorData;
  });

  const onMouseDown = event => setEditorData(prev => {
    const newEditorData = {...prev};
    if (event.evt.button === 1) {
      newEditorData.currentState.input.isPanning = true;
    }
    return newEditorData;
  });

  const onMouseUp = event => setEditorData(prev => {
    const newEditorData = {...prev};
    if (event.evt.button === 1) {
      newEditorData.currentState.input.isPanning = false;
    }
    return newEditorData;
  });

  const onWheel = event => setEditorData(prev => {
    const newEditorData = {...prev};
    const oldScale = prev.currentState.geometry.scale;
    const WHEEL_SCALE_RATIO = prev.constants.WHEEL_SCALE_RATIO;

    let newScale;
    if (event.evt.deltaY > 0) {
      newScale = oldScale / WHEEL_SCALE_RATIO;
    } else {
      newScale = oldScale * WHEEL_SCALE_RATIO;
    }

    newEditorData.currentState.geometry.scale = Math.max(0.5, Math.min(3, newScale));

    return newEditorData;
  });

  if (!editorData) {
    return <></>;
  }

  return (
    <Stage
      width={editorData.constants.CANVAS_WIDTH}
      height={editorData.constants.CANVAS_HEIGHT}
      onContextMenu={event => event.evt.preventDefault()}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
      onClick={event => editorData.eventListeners.onClick.forEach(callback => callback(event))}
    >
      <BackgroundLayer/>
      <WallsLayer/>
    </Stage>
  );
};

export default EditorCanvas;
