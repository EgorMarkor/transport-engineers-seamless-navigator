import {useEditorState} from "shared/hooks/useEditorState";
import {useEffect, useRef, useState} from "react";
import {BeaconType, DoorType, Types} from "../EditorState/types";

const DoorProperties = () => {
  const {editorState, setEditorState} = useEditorState();
  const selectedObject = editorState.getSelectedObject();

  const isOuterInputRef = useRef<HTMLInputElement | null>(null);

  const changeDoorIsOuter = () => setEditorState(prevState => {
    const newState = prevState.copy();

    const selectedBeaconIndex = newState.getSelectedObject()?.index;

    if (selectedBeaconIndex === undefined || !isOuterInputRef.current?.value) {
      return newState;
    }

    newState.setDoorIsOuter(selectedBeaconIndex, isOuterInputRef.current?.checked);

    return newState;
  });

  const selectedObjectType = selectedObject?.type;

  let door: DoorType;
  if (selectedObject && selectedObjectType === Types.DOORS) {
    door = editorState.getCurrentFloor().objects[Types.DOORS][selectedObject.index];
  } else {
    door = {isOuter: false, x: 0, y: 0};
  }

  return <>
    <div className="flex justify-center w-full">
      <p>Дверь</p>
    </div>

    <div className="flex flex-row w-full">
      <p className="mr-2">Эта дверь входная?</p>
      <input
        ref={isOuterInputRef}
        checked={door?.isOuter}
        onChange={changeDoorIsOuter}
        type="checkbox"
        className="w-2/3 outline-none bg-inherit border-b-2"
      />
    </div>
  </>;
};

export default DoorProperties;
