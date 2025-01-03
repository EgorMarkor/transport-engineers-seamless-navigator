import {useEffect} from "react";
import {Circle, Layer, Line} from "react-konva";
import {KonvaEventObject} from "konva/lib/Node";
import {useEditorState} from "shared/hooks/useEditorState";
import {Types, WallType} from "../EditorState/types";
import {COLORS} from "../EditorState/editorConstants";
import {changeCursor, doWallsIntersect, selectObject} from "../utils";

const WallsLayer = () => {
  const {editorState, setEditorState} = useEditorState();

  const onClick = (event: KonvaEventObject<MouseEvent>) => setEditorState(prevState => {
    const newState = prevState.copy();

    const cursorPosition = newState.getSnappedCursorPosition();

    if (newState.getCurrentTool() !== Types.WALLS || event.evt.button !== 0 || !cursorPosition) {
      return newState;
    }

    const newPoint = newState.screenToWorldCoords(cursorPosition);

    const newWall = newState.getNewWall();

    if (!newWall) {
      newState.setNewWall({x1: newPoint.x, y1: newPoint.y});
      return newState;
    }

    const potentialWall = {...newWall, x2: newPoint.x, y2: newPoint.y} as WallType;
    const isOccupied = newState.getObjectsOnCurrentFloor(Types.WALLS)
      .some(wall => doWallsIntersect(wall, potentialWall));

    if (!isOccupied) {
      newState.addNewObject(potentialWall, Types.WALLS);
    }

    return newState;
  });

  useEffect(() => setEditorState(prevState => {
    const newState = prevState.copy();
    newState.addOnClickListener(onClick);
    return newState;
  }), []);

  const tool = editorState.getCurrentTool();
  const cursorPosition = editorState.getSnappedCursorPosition();
  const scale = editorState.getScale();
  const newWall = editorState.getNewWall();
  const walls = editorState.getObjectsOnCurrentFloor(Types.WALLS);

  const wallsBeneath = editorState.getSettings().showingObjectsBeneathEnabled
    ? editorState.getObjectsOnFloorBeneath(Types.WALLS)
    : [];
  const forcedWalls = editorState
    .getFloorsToForceShow()
    .flatMap(floorNumber => editorState.getObjectsOnFloor(floorNumber, Types.WALLS));

  return (
    <Layer>
      {tool === Types.WALLS && cursorPosition && (
        <Circle
          x={cursorPosition.x}
          y={cursorPosition.y}
          radius={10}
          fill={COLORS[Types.WALLS]}
        />
      )}
      {tool === Types.WALLS && cursorPosition && newWall?.x1 && newWall?.y1 && (
        <Line
          stroke={COLORS[Types.WALLS]}
          strokeWidth={3}
          points={[
            ...editorState.flatWorldToScreenCoords([newWall.x1, newWall.y1]),
            cursorPosition.x,
            cursorPosition.y,
          ]}
        />
      )}
      {walls.map((wall, index) => (
        <Line
          key={`wall-${index}`}
          stroke={COLORS[Types.WALLS]}
          strokeWidth={scale * 3}
          hitStrokeWidth={20}
          points={editorState.flatWorldToScreenCoords([wall.x1, wall.y1, wall.x2, wall.y2])}
          onClick={event => selectObject(Types.WALLS, index, event, setEditorState)}
          onMouseEnter={event => changeCursor("pointer", tool, event)}
          onMouseLeave={event => changeCursor("default", tool, event)}
        />
      ))}
      {[...wallsBeneath, ...forcedWalls].map((wall, index) => (
        <Line
          key={`secondaryWall-${index}`}
          stroke={COLORS[Types.WALLS]}
          opacity={0.3}
          strokeWidth={scale * 3}
          points={editorState.flatWorldToScreenCoords([wall.x1, wall.y1, wall.x2, wall.y2])}
        />
      ))}
    </Layer>
  );
};

export default WallsLayer;
