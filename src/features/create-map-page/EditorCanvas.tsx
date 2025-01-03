import {Stage} from "react-konva";
import {useEditorState} from "shared/hooks/useEditorState";
import BackgroundLayer from "./CanvasLayers/BackgroundLayer";
import {KonvaEventObject} from "konva/lib/Node";
import {Types} from "./EditorState/types";
import {findClosestWallPoint} from "./utils";
import {useEffect} from "react";
import WallsLayer from "./CanvasLayers/WallsLayer";
import BeaconsLayer from "./CanvasLayers/BeaconsLayer";
import DoorsLayer from "./CanvasLayers/DoorsLayer";
import StairsLayer from "./CanvasLayers/StairsLayer";

const EditorCanvas = () => {
  const {editorState, setEditorState} = useEditorState();

  const onMouseMove = (event: KonvaEventObject<MouseEvent>) => setEditorState(prevState => {
    const newState = prevState.copy();

    const {cursorPosition: prevCursorPosition} = prevState.getCurrentInput();
    const {scaledGridSize, scale} = prevState.getCurrentGeometry();

    const cursorPosition = event.target.getStage()?.getPointerPosition() ?? null;
    newState.setCursorPosition(cursorPosition);

    if (!cursorPosition || !prevCursorPosition) {
      return newState;
    }

    if (prevState.isPanning()) {
      const prevOffset = prevState.getOffset();

      const dx = cursorPosition.x - prevCursorPosition.x;
      const dy = cursorPosition.y - prevCursorPosition.y;

      newState.setOffset({x: prevOffset.x + dx, y: prevOffset.y + dy});
    }

    const offset = newState.getOffset();
    const snappedX = Math.round((cursorPosition.x - offset.x) / scaledGridSize) * scaledGridSize + offset.x;
    const snappedY = Math.round((cursorPosition.y - offset.y) / scaledGridSize) * scaledGridSize + offset.y;
    newState.setCursorPositionSnapped({x: snappedX, y: snappedY});

    const closestWall = findClosestWallPoint(
      prevState.getObjectsOnCurrentFloor(Types.WALLS),
      newState.screenToWorldCoords(cursorPosition),
      0.7 / scale,
    );
    newState.setClosestWallPoint({
      worldCoords: closestWall,
      screenCoords: closestWall ? newState.worldToScreenCoords(closestWall) : null,
    });

    return newState;
  });

  const onMouseDown = (event: KonvaEventObject<MouseEvent>) => setEditorState(prevState => {
    const newState = prevState.copy();
    if (event.evt.button === 1) {
      newState.setIsPanning(true);
    }
    return newState;
  });

  const onMouseUp = (event: KonvaEventObject<MouseEvent>) => setEditorState(prevState => {
    const newState = prevState.copy();
    if (event.evt.button === 1) {
      newState.setIsPanning(false);
    }
    return newState;
  });

  const onWheel = (event: KonvaEventObject<WheelEvent>) => setEditorState(prevState => {
    const newState = prevState.copy();

    const oldScale = prevState.getScale();
    const {WHEEL_SCALE_RATIO, INITIAL_GRID_SIZE} = prevState.getConstants();

    const newScale = event.evt.deltaY > 0 ?
      oldScale / WHEEL_SCALE_RATIO :
      oldScale * WHEEL_SCALE_RATIO;
    const newClampedScale = Math.max(0.25, Math.min(3, newScale));

    newState.setScale(newClampedScale);
    newState.setScaledGridSize(INITIAL_GRID_SIZE * newClampedScale);

    return newState;
  });

  const undo = () => setEditorState(prevState => {
    const newState = prevState.copy();

    const undoStack = prevState.getUndoStack();

    if (undoStack.length === 0) {
      return newState;
    }

    newState.getRedoStack().push(prevState.getFloors());

    const prevFloors = undoStack.pop();

    if (prevFloors) {
      newState.setFloors(prevFloors);
    }

    return newState;
  });

  const redo = () => setEditorState(prevState => {
    const newState = prevState.copy();

    const redoStack = prevState.getRedoStack();

    if (redoStack.length === 0) {
      return newState;
    }

    newState.getUndoStack().push(newState.getFloors());

    const prevFloors = redoStack.pop();

    if (prevFloors) {
      newState.setFloors(prevFloors);
    }

    return newState;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey || !['z', 'y'].includes(event.key)) {
        return;
      }

      setEditorState(prevState => {
        const newState = prevState.copy();
        newState.clearSelection();
        return newState;
      });

      if (event.key === 'z') {
        undo();
      } else if (event.key === 'y') {
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!editorState) {
    return <></>;
  }

  return (
    <Stage
      width={editorState.getCanvasWidth()}
      height={editorState.getCanvasHeight()}
      onContextMenu={event => event.evt.preventDefault()}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
      onClick={event => editorState.getOnClickListeners().forEach(callback => callback(event))}
    >
      <BackgroundLayer/>
      <WallsLayer/>
      <BeaconsLayer/>
      <DoorsLayer/>
      <StairsLayer/>
    </Stage>
  );
};

export default EditorCanvas;
