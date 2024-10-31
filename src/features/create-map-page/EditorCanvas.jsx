import {useEffect} from "react";
import {Stage} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";
import BackgroundLayer from "./CanvasObjects/BackgroundLayer";
import WallsLayer from "./CanvasObjects/WallsLayer";

const EditorCanvas = () => {
  const {editorData, setEditorData} = useEditorData();

  useEffect(() => {  // TODO: добавить массив предыдущих действий чтобы работал ctrl + Z
    setEditorData({
      constants: {
        CANVAS_WIDTH: window.innerWidth * 0.8,
        CANVAS_HEIGHT: window.innerHeight * 0.905,
        INITIAL_GRID_SIZE: window.innerWidth * 0.05,
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
          scaledGridSize: window.innerWidth * 0.05,
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

    const {cursorPosition: prevCursorPosition, isPanning} = newEditorData.currentState.input;
    const {offset, scaledGridSize} = newEditorData.currentState.geometry;

    const cursorPosition = event.target.getStage().getPointerPosition();

    if (isPanning) {
      const dx = cursorPosition.x - prevCursorPosition.x;
      const dy = cursorPosition.y - prevCursorPosition.y;

      newEditorData.currentState.geometry.offset = {
        x: offset.x + dx,
        y: offset.y + dy,
      };
    }

    const snappedX = Math.round((cursorPosition.x - offset.x) / scaledGridSize) * scaledGridSize;
    const snappedY = Math.round((cursorPosition.y - offset.y) / scaledGridSize) * scaledGridSize;
    const snappedPosition = {x: snappedX, y: snappedY};

    newEditorData.currentState.input.cursorPosition = cursorPosition;
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

    const oldScale = newEditorData.currentState.geometry.scale;
    const WHEEL_SCALE_RATIO = newEditorData.constants.WHEEL_SCALE_RATIO;
    const INITIAL_GRID_SIZE = newEditorData.constants.INITIAL_GRID_SIZE;

    const newScale = event.evt.deltaY > 0 ?
      oldScale / WHEEL_SCALE_RATIO :
      oldScale * WHEEL_SCALE_RATIO;
    const newClampedScale = Math.max(0.25, Math.min(3, newScale));

    newEditorData.currentState.geometry.scale = newClampedScale;
    newEditorData.currentState.geometry.scaledGridSize = INITIAL_GRID_SIZE * newClampedScale;

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
