import {PointOfInterestType, Property, Types} from "../EditorState/types";
import React, {useEffect, useRef, useState} from "react";
import {changeCoord} from "../utils";
import {useEditorState} from "shared/hooks/useEditorState";

const PointOfInterestProperties = () => {
  const {editorState, setEditorState} = useEditorState();
  const selectedObject = editorState.getSelectedObject();

  const descriptionInputRef = useRef<HTMLInputElement | null>(null);

  const changeDescription = () => setEditorState(prevState => {
    const newState = prevState.copy();

    const selectedPofIndex = newState.getSelectedObject()?.index;

    if (selectedPofIndex === undefined || !descriptionInputRef.current?.value) {
      return newState;
    }

    newState.setPointOfInterestDescription(selectedPofIndex, descriptionInputRef.current?.value);

    return newState;
  });

  const selectedObjectType = editorState.getSelectedObject()?.type;

  let pof: PointOfInterestType;
  if (selectedObject && selectedObjectType === Types.POINTS_OF_INTEREST) {
    pof = editorState.getCurrentFloor().objects[Types.POINTS_OF_INTEREST][selectedObject.index];
  } else {
    pof = {description: "", x: 0, y: 0};
  }

  const [pofProperties, setPofProperties] = useState({
    x: pof.x,
    y: pof.y,
  });

  useEffect(() => {
    setPofProperties({
      x: pof.x,
      y: pof.y
    });
  }, []);

  const handleChange = (property: Property, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPofProperties((prev) => ({...prev, [property]: value}));
    changeCoord(property, Types.BEACONS, event, setEditorState);
  };

  return <>
    <div className="flex justify-center w-full">
      <p>Точка интереса</p>
    </div>

    <p className="mb-4 mt-6">Координаты</p>
    <div className="flex flex-row w-full">
      <div className="flex flex-row mr-2 w-1/2">
        <p className="mr-2">x: </p>
        <input
          type="number"
          value={pofProperties.x}
          onChange={event => handleChange(Property.x, event)}
          className="w-2/3 outline-none bg-inherit border-b-2"
        />
      </div>
      <div className="flex flex-row w-1/2">
        <p className="mr-2">y: </p>
        <input
          type="number"
          value={pofProperties.y}
          onChange={event => handleChange(Property.y, event)}
          className="w-2/3 outline-none bg-inherit border-b-2"
        />
      </div>
    </div>
    <div className="flex flex-row w-full mt-2">
      <p className="mr-2">Описание</p>
      <input
        ref={descriptionInputRef}
        value={pof.description}
        onChange={changeDescription}
        className="w-2/3 outline-none bg-inherit border-b-2"
      />
    </div>
  </>;
};

export default PointOfInterestProperties;
