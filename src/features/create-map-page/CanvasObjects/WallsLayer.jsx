import {useEffect, useRef, useState} from "react";
import {Circle, Layer, Line} from "react-konva";
import {useEditorData} from "shared/hooks/useEditorData";

const WallsLayer = () => {
  const {editorData, setEditorData} = useEditorData();
  const {tool, cursorPosition, cursorPositionSnapped} = editorData.currentState;

  const [newWall, setNewWall] = useState(null);
  const newWallRef = useRef(null);
  newWallRef.current = newWall;

  const onClicked = event => {
    if (editorData.currentState.tool !== "wall") {
      return;
    }

    if (newWallRef.current === null) {
      setNewWall({
        x1: editorData.currentState.cursorPositionSnapped.x,
        y1: editorData.currentState.cursorPositionSnapped.y
      });
    } else {
      const x1 = newWallRef.current.x1;
      const y1 = newWallRef.current.y1;

      setEditorData(prev => {
        const newEditorData = {...prev};

        newEditorData.objects.walls.push({
          x1: x1,
          y1: y1,
          x2: editorData.currentState.cursorPositionSnapped.x,
          y2: editorData.currentState.cursorPositionSnapped.y,
        });

        return newEditorData;
      });
      setNewWall(null);
    }
  };

  useEffect(() => {
    setEditorData(prev => {
      const newEditorData = {...prev};

      newEditorData.eventListeners.onClick = [...newEditorData.eventListeners.onClick, onClicked];

      return newEditorData;
    });
  }, []);

  return (
    <Layer>
      {tool === "wall" && cursorPosition && (
        <Circle
          x={cursorPositionSnapped.x}
          y={cursorPositionSnapped.y}
          radius={10}
          fill="#FF7827"
        />
      )}
      {tool === "wall" && cursorPosition && newWall !== null && (
        <Line
          key={`wall-${0}`}
          points={[newWall.x1, newWall.y1, cursorPositionSnapped.x, cursorPositionSnapped.y]}
          stroke="#FF7827"
          strokeWidth={3}
        />
      )}
      {editorData.objects.walls.map((wall, index) => (
        <Line
          key={`wall-${index}`}
          points={[wall.x1, wall.y1, wall.x2, wall.y2]}
          stroke="#FF7827"
          strokeWidth={3}
        />
      ))}
    </Layer>
  );
};

export default WallsLayer;