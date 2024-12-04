import {useEditorData} from "shared/hooks/useEditorData";
import {useRef} from "react";
import {changeCoord} from "../editorUtils";
import {Types} from "../editorConstants";

const BeaconProperties = () => {
  const {editorData, setEditorData} = useEditorData();

  const {floor, selectedObject} = editorData.currentState;
  const beacon = editorData.floors[floor].objects.beacons[selectedObject.index];

  const idInputRef = useRef(null);

  const changeBluetoothId = () => setEditorData(prev => {
    const newEditorData = {...prev};

    const floor = newEditorData.currentState.floor;
    const selectedObjectIndex = newEditorData.currentState.selectedObject.index;
    newEditorData.floors[floor].objects.beacons[selectedObjectIndex].ID = idInputRef.current.value;

    return newEditorData;
  });

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
          onBlur={event => changeCoord("x", Types.BEACONS, event, setEditorData)}
          className="w-2/3 outline-none bg-inherit border-b-2"
        />
      </div>
      <div className="flex flex-row w-1/2">
        <p className="mr-2">y: </p>
        <input
          type="number"
          defaultValue={beacon.y}
          onBlur={event => changeCoord("y", Types.BEACONS, event, setEditorData)}
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
