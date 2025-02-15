import React, {useEffect, useState} from "react";
import {useEditorState} from "shared/hooks/useEditorState";
import {Property, Types, WallType} from "../EditorState/types";
import {changeCoord} from "../utils";

const WallProperties = () => {
  const {editorState, setEditorState} = useEditorState();
  const selectedObject = editorState.getSelectedObject();

  let wall: WallType;
  if (selectedObject){
    wall = editorState.getCurrentFloor().objects[Types.WALLS][selectedObject.index];
  } else {
    wall = {x1: 0, x2: 0, y1: 0, y2: 0};
  }
  const [coordinates, setCoordinates] = useState({
    x1: wall.x1,
    y1: wall.y1,
    x2: wall.x2,
    y2: wall.y2,
  });

  useEffect(() => {
    setCoordinates({
      x1: wall.x1,
      y1: wall.y1,
      x2: wall.x2,
      y2: wall.y2,
    });
  }, [wall]);

  const handleChange = (property: Property, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCoordinates((prev) => ({...prev, [property]: value}));
    changeCoord(property, Types.WALLS, event, setEditorState);
  };

  if (!selectedObject) {
    return <></>;
  }

  return <>
    <div className="flex justify-center w-full">
      <p>Стена</p>
    </div>

    <p className="mb-4 mt-6">Координаты</p>
    <div className="flex flex-col w-full">
      <div className="flex flex-col w-full">
        <p className="my-2">Начало</p>

        <div className="flex flex-row">
          <div className="flex flex-row mr-2 w-1/2">
            <p className="mr-2">x: </p>
            <input
              type="number"
              value={coordinates.x1}
              onChange={event => handleChange(Property.x1, event)}
              className="w-2/3 outline-none bg-inherit border-b-2"
            />
          </div>
          <div className="flex flex-row w-1/2">
            <p className="mr-2">y: </p>
            <input
              type="number"
              value={coordinates.y1}
              onChange={event => handleChange(Property.y1, event)}
              className="w-2/3 outline-none bg-inherit border-b-2"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <p className="mb-2 mt-3">Конец</p>

        <div className="flex flex-row">
          <div className="flex flex-row mr-2 w-1/2">
            <p className="mr-2">x: </p>
            <input
              type="number"
              value={coordinates.x2}
              onChange={event => handleChange(Property.x2, event)}
              className="w-2/3 outline-none bg-inherit border-b-2"
            />
          </div>
          <div className="flex flex-row w-1/2">
            <p className="mr-2">y: </p>
            <input
              type="number"
              value={coordinates.y2}
              onChange={event => handleChange(Property.y2, event)}
              className="w-2/3 outline-none bg-inherit border-b-2"
            />
          </div>
        </div>
      </div>
    </div>
  </>;
};

export default WallProperties;
