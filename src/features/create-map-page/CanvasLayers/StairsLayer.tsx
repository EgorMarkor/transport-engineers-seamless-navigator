import {useEditorState} from "shared/hooks/useEditorState";
import {Arrow, Circle, Layer, Line} from "react-konva";
import {StairsType, Types} from "../EditorState/types";
import {changeCursor, flattenCoords, getFloorIndexByOffset, selectObject} from "../utils";
import {COLORS} from "../EditorState/editorConstants";
import {KonvaEventObject} from "konva/lib/Node";
import {useEffect} from "react";

const StairsLayer = () => {
  const {editorState, setEditorState} = useEditorState();

  const onClick = (event: KonvaEventObject<MouseEvent>) => setEditorState(prevState => {
    const newState = prevState.copy();

    const cursorPosition = editorState.getSnappedCursorPosition();

    const tool = editorState.getCurrentTool();

    if (![Types.STAIRS_UP, Types.STAIRS_DOWN].includes(tool)
      || event.evt.button !== 0 || !cursorPosition) {
      return newState;
    }
    const newPoint = newState.screenToWorldCoords(cursorPosition);
    const newStairs = newState.getNewStairs();

    if (!newStairs?.bounds) {
      newState.setNewStairs({bounds: null, direction: null, endFloor: null, startFloor: null, type: null});

      newState.setNewStairsBounds({x1: newPoint.x, y1: newPoint.y});
      newState.setNewStairsType(tool as Types.STAIRS_UP | Types.STAIRS_DOWN);
      return newState;
    }

    for (let i = 1; i <= 4; i++) {
      // @ts-ignore
      if (newStairs.bounds[`x${i}`] && newStairs.bounds[`y${i}`]) {
        continue;
      }

      newState.setNewStairsBoundsPoint(i, newPoint);
      return newState;
    }

    if (!newStairs.direction) {
      newState.setNewStairsDirection({x1: newPoint.x, y1: newPoint.y});
      return newState;
    }

    const currentFloor = newState.getCurrentFloorNumber();
    const floorOffset = newStairs.type === Types.STAIRS_UP ? 1 : -1;

    const potentialStairs = {
      type: newStairs.type,
      startFloor: currentFloor,
      endFloor: getFloorIndexByOffset(
        newState.getFloors(),
        currentFloor,
        floorOffset,
      ) || (parseFloat(currentFloor) + floorOffset).toString(),
      bounds: newStairs.bounds,
      direction: {...newStairs.direction, x2: newPoint.x, y2: newPoint.y},
    }

    newState.addNewObject(potentialStairs as StairsType, newStairs.type as Types.STAIRS_UP | Types.STAIRS_DOWN);

    return newState;
  });

  useEffect(() => setEditorState(prevState => {
    const newState = prevState.copy();
    newState.addOnClickListener(onClick);
    return newState;
  }), []);

  const tool = editorState.getCurrentTool();
  const cursorPosition = editorState.getSnappedCursorPosition();

  const newStairs = editorState.getNewStairs();

  let newStairsBounds: number[] = [];
  if (newStairs?.bounds) {
    newStairsBounds = editorState.flatWorldToScreenCoords(
      flattenCoords(newStairs.bounds as { [x: string]: number; }),
    );

    if (newStairsBounds.length === 8) {
      newStairsBounds.push(...newStairsBounds.slice(0, 2));
    } else if (cursorPosition) {
      newStairsBounds.push(cursorPosition?.x, cursorPosition?.y);
    }
  }

  const stairsUp = editorState.getObjectsOnCurrentFloor(Types.STAIRS_UP);
  const stairsDown = editorState.getObjectsOnCurrentFloor(Types.STAIRS_DOWN);

  return (
    <Layer>
      {[Types.STAIRS_UP, Types.STAIRS_DOWN].includes(tool) && cursorPosition && (
        <Circle
          x={cursorPosition.x}
          y={cursorPosition.y}
          radius={10}
          fill={
            newStairsBounds.length < 10
              ? COLORS[tool as Types.STAIRS_UP | Types.STAIRS_DOWN].bounds
              : COLORS[tool as Types.STAIRS_UP | Types.STAIRS_DOWN].direction
          }
        />
      )}
      {[Types.STAIRS_UP, Types.STAIRS_DOWN].includes(tool) && cursorPosition && newStairs && <>
        {newStairs.bounds && (
          <Line
            key="new-stairs-bounds"
            points={newStairsBounds}
            stroke={COLORS[tool as Types.STAIRS_UP | Types.STAIRS_DOWN].bounds}
            strokeWidth={3}
          />
        )}
        {newStairs.direction?.x1 && newStairs.direction?.y1 && (
          <Arrow
            key="new-stairs-direction"
            stroke={COLORS[tool as Types.STAIRS_UP | Types.STAIRS_DOWN].direction}
            strokeWidth={3}
            points={[
              ...editorState.flatWorldToScreenCoords([newStairs.direction.x1, newStairs.direction.y1]),
              cursorPosition.x,
              cursorPosition.y,
            ]}
          />
        )}
      </>}
      {[...stairsUp, ...stairsDown].map((stairs, index) => <>
        <Line
          key={`${stairs.type}-${index}-bounds`}
          stroke={COLORS[stairs.type].bounds}
          strokeWidth={3}
          closed={true}
          points={editorState.flatWorldToScreenCoords(flattenCoords(
            stairs.bounds as unknown as { [x: string]: number; },
          ))}
        />
        <Arrow
          key={`${stairs.type}-${index}-direction`}
          stroke={COLORS[stairs.type].direction}
          fill={COLORS[stairs.type].direction}
          strokeWidth={3}
          hitStrokeWidth={editorState.getScale() * 30}
          pointerWidth={15}
          pointerLength={15}
          points={editorState.flatWorldToScreenCoords(flattenCoords(
            stairs.direction as unknown as { [x: string]: number; },
          ))}
          onClick={event => selectObject(
            stairs.type,
            stairs.type === Types.STAIRS_UP ? index : index - stairsUp.length,
            event,
            setEditorState
          )}
          onMouseEnter={event => changeCursor("pointer", tool, event)}
          onMouseLeave={event => changeCursor("default", tool, event)}
        />
      </>)}
    </Layer>
  );
};

export default StairsLayer;