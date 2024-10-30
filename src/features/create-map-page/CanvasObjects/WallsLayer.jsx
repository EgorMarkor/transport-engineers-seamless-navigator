import {useEffect} from "react";
import {Circle, Layer, Line} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";

const WallsLayer = () => {
  const {editorData, setEditorData} = useEditorData();
  const {tool, input, geometry, newObjects} = editorData.currentState;

  const onClicked = event => {
    if (editorData.currentState.tool !== "wall") {
      return;
    }

    if (event.evt.button !== 0) {
      return;
    }

    setEditorData(prev => {
      const newEditorData = {...prev};

      const {x, y} = newEditorData.currentState.input.cursorPositionSnapped;
      const newX = x / newEditorData.currentState.geometry.scale;
      const newY = y / newEditorData.currentState.geometry.scale;

      if (!newEditorData.currentState.newObjects.newWall) {
        newEditorData.currentState.newObjects.newWall = {
          x1: newX,
          y1: newY,
        }
      } else {
        newEditorData.objects.walls.push({
          x1: editorData.currentState.newObjects.newWall.x1,
          y1: editorData.currentState.newObjects.newWall.y1,
          x2: newX,
          y2: newY,
        });

        newEditorData.currentState.newObjects.newWall = null;
      }

      return newEditorData;
    });
  };

  useEffect(() => {
    setEditorData(prev => {
      const newEditorData = {...prev};

      newEditorData.eventListeners.onClick.push(onClicked);

      return newEditorData;
    });
  }, []);

  return (
    <Layer x={geometry.offset.x} y={geometry.offset.y}>
      {tool === "wall" && input.cursorPosition && (
        <Circle
          x={input.cursorPositionSnapped.x}
          y={input.cursorPositionSnapped.y}
          radius={10}
          fill="#FF7827"
        />
      )}
      {tool === "wall" && input.cursorPosition && newObjects.newWall !== null && (
        <Line
          key={`wall-${0}`}
          points={[
            newObjects.newWall.x1,
            newObjects.newWall.y1,
            input.cursorPositionSnapped.x / geometry.scale,
            input.cursorPositionSnapped.y / geometry.scale,
          ]}
          stroke="#FF7827"
          strokeWidth={3}
          scaleX={geometry.scale}
          scaleY={geometry.scale}
        />
      )}
      {editorData.objects.walls.map((wall, index) => (
        <Line
          key={`wall-${index}`}
          points={[wall.x1, wall.y1, wall.x2, wall.y2]}
          stroke="#FF7827"
          strokeWidth={3}
          scaleX={geometry.scale}
          scaleY={geometry.scale}
        />
      ))}
    </Layer>
  );
};

export default WallsLayer;