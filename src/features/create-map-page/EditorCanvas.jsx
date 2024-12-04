import {useEffect} from "react";
import {Stage} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";
import {EMPTY_EDITOR_DATA} from "./editorConstants";
import {canvasToWorldCoords, findClosestWallPoint} from "./editorUtils";
import BackgroundLayer from "./CanvasObjects/BackgroundLayer";
import WallsLayer from "./CanvasObjects/WallsLayer";
import BeaconsLayer from "./CanvasObjects/BeaconsLayer";
import DoorsLayer from "./CanvasObjects/DoorsLayer";

const EditorCanvas = () => {
  const {editorData, setEditorData} = useEditorData();

  useEffect(() => setEditorData(EMPTY_EDITOR_DATA), []);

  const onMouseMove = event => setEditorData(prev => {
    const newEditorData = {...prev};

    const {cursorPosition: prevCursorPosition, isPanning} = newEditorData.currentState.input;
    const {scaledGridSize, scale} = newEditorData.currentState.geometry;
    const walls = newEditorData.floors[newEditorData.currentState.floor]?.objects?.walls || [];

    const cursorPosition = event.target.getStage().getPointerPosition();
    newEditorData.currentState.input.cursorPosition = cursorPosition;

    if (isPanning) {
      const offset = newEditorData.currentState.geometry.offset;

      const dx = cursorPosition.x - prevCursorPosition.x;
      const dy = cursorPosition.y - prevCursorPosition.y;

      newEditorData.currentState.geometry.offset = {x: offset.x + dx, y: offset.y + dy};
    }

    const offset = newEditorData.currentState.geometry.offset;
    const snappedX = Math.round((cursorPosition.x - offset.x) / scaledGridSize) * scaledGridSize + offset.x;
    const snappedY = Math.round((cursorPosition.y - offset.y) / scaledGridSize) * scaledGridSize + offset.y;
    newEditorData.currentState.input.cursorPositionSnapped = {x: snappedX, y: snappedY};

    const closestWall = findClosestWallPoint(
      walls,
      canvasToWorldCoords(cursorPosition, scaledGridSize, offset),
      0.7 / scale,
    );
    newEditorData.currentState.input.closestWallPoint.worldCoords = closestWall;
    newEditorData.currentState.input.closestWallPoint.screenCoords = closestWall ? {
      x: closestWall.x * scaledGridSize + offset.x,
      y: -closestWall.y * scaledGridSize + offset.y,
    } : null;

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

  const undo = () => setEditorData(prev => {
    const newEditorData = {...prev};

    if (prev.undoStack.length === 0) {
      return newEditorData;
    }

    newEditorData.redoStack.push(newEditorData.floors);
    newEditorData.floors = newEditorData.undoStack.pop();

    return newEditorData;
  });

  const redo = () => setEditorData(prev => {
    const newEditorData = {...prev};

    if (prev.redoStack.length === 0) {
      return newEditorData;
    }

    newEditorData.undoStack.push(newEditorData.floors);
    newEditorData.floors = newEditorData.redoStack.pop();

    return newEditorData;
  });

  useEffect(() => {
    const handleKeyDown = event => {
      if (!event.ctrlKey || !['z', 'y'].includes(event.key)) {
        return;
      }

      setEditorData(prev => {
        const newEditorData = {...prev};
        newEditorData.currentState.selectedObject = null;
        return newEditorData;
      });

      if (event.key === 'z') {
        undo();
      } else if (event.key === 'y') {
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      <BeaconsLayer/>
      <DoorsLayer/>
    </Stage>
  );
};

export default EditorCanvas;
