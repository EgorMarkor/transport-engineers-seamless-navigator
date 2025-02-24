import {useEditorState} from "shared/hooks/useEditorState";
import {changeCoord} from "../utils";
import {BeaconType, Property, Types} from "../EditorState/types";
import React, {useEffect, useRef, useState} from "react";

const BeaconProperties = () => {
  const {editorState, setEditorState} = useEditorState();
  const selectedObject = editorState.getSelectedObject();

  const idInputRef = useRef<HTMLInputElement | null>(null);

  const changeBluetoothId = () => setEditorState(prevState => {
    const newState = prevState.copy();

    const selectedBeaconIndex = newState.getSelectedObject()?.index;

    if (selectedBeaconIndex === undefined || !idInputRef.current?.value) {
      return newState;
    }

    newState.setBluetoothID(selectedBeaconIndex, idInputRef.current?.value);

    return newState;
  });

  const selectedObjectType = selectedObject?.type;

  let beacon: BeaconType;
  if (selectedObject && selectedObjectType === Types.BEACONS) {
    beacon = editorState.getCurrentFloor().objects[Types.BEACONS][selectedObject.index];
  } else {
    beacon = {ID: "", x: 0, y: 0};
  }

  const [beaconProperties, setBeaconProperties] = useState({
    x: beacon.x,
    y: beacon.y,
  });

  useEffect(() => {
    setBeaconProperties({
      x: beacon.x,
      y: beacon.y
    });
  }, []);

  const handleChange = (property: Property, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setBeaconProperties((prev) => ({...prev, [property]: value}));
    changeCoord(property, Types.BEACONS, event, setEditorState);
  };

  if (selectedObjectType !== Types.BEACONS) {
    return <></>;
  }

  return <>
    <div className="flex justify-center w-full">
      <p>Bluetooth - маячок</p>
    </div>

    <p className="mb-4 mt-6">Координаты</p>
    <div className="flex flex-row w-full">
      <div className="flex flex-row mr-2 w-1/2">
        <p className="mr-2">x: </p>
        <input
          type="number"
          value={beaconProperties.x}
          onChange={event => handleChange(Property.x, event)}
          className="w-2/3 outline-none bg-inherit border-b-2"
        />
      </div>
      <div className="flex flex-row w-1/2">
        <p className="mr-2">y: </p>
        <input
          type="number"
          value={beaconProperties.y}
          onChange={event => handleChange(Property.y, event)}
          className="w-2/3 outline-none bg-inherit border-b-2"
        />
      </div>
    </div>
    <div className="flex flex-row w-full">
      <p className="mr-2">Bluetooth ID:</p>
      <input
        ref={idInputRef}
        value={beacon?.ID}
        onChange={changeBluetoothId}
        className="w-2/3 outline-none bg-inherit border-b-2"
      />
    </div>
  </>;
};

export default BeaconProperties;
