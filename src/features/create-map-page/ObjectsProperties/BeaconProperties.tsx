import {useEditorState} from "shared/hooks/useEditorState";
import {changeCoord} from "../utils";
import {Property, Types} from "../EditorState/types";
import {useRef} from "react";

const BeaconProperties = () => {
  const {editorState, setEditorState} = useEditorState();
  const selectedObject = editorState.getSelectedObject();

  const idInputRef = useRef<HTMLInputElement | null>(null);

  if (!selectedObject) {
    return <></>;
  }

  const changeBluetoothId = () => setEditorState(prevState => {
    const newState = prevState.copy();

    const selectedBeaconIndex = newState.getSelectedObject()?.index;

    if (selectedBeaconIndex === undefined || !idInputRef.current?.value) {
      return newState;
    }

    newState.setBluetoothID(selectedBeaconIndex, idInputRef.current?.value);

    return newState;
  });

  const beacon = editorState.getCurrentFloor().objects[Types.BEACONS][selectedObject.index];

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
          defaultValue={beacon.x}
          onBlur={event => changeCoord(Property.x, Types.BEACONS, event, setEditorState)}
          className="w-2/3 outline-none bg-inherit border-b-2"
        />
      </div>
      <div className="flex flex-row w-1/2">
        <p className="mr-2">y: </p>
        <input
          type="number"
          defaultValue={beacon.y}
          onBlur={event => changeCoord(Property.y, Types.BEACONS, event, setEditorState)}
          className="w-2/3 outline-none bg-inherit border-b-2"
        />
      </div>
    </div>
    <div className="flex flex-row w-full">
      <p className="mr-2">Bluetooth ID:</p>
      <input
        ref={idInputRef}
        defaultValue={beacon.ID}
        onBlur={changeBluetoothId}
        className="w-2/3 outline-none bg-inherit border-b-2"
      />
    </div>
  </>;
};

export default BeaconProperties;
