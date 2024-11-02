import {useEditorData} from "shared/hooks/useEditorData";

const BeaconProperties = () => {
  const {editorData, setEditorData} = useEditorData();
  const selectedObject = editorData.currentState.selectedObject;
  const beacon = editorData.objects.beacons[selectedObject.index];

  const changeCoord = (coord, event) => setEditorData(prev => {
    const newEditorData = {...prev};
    const newCoord = event.target.value;

    if (isNaN(newCoord)) {
      return newEditorData;
    }

    const selectedObjectIndex = newEditorData.currentState.selectedObject.index;

    if (coord === "x") {
      newEditorData.objects.beacons[selectedObjectIndex].x = newCoord;
    } else if (coord === "y") {
      newEditorData.objects.beacons[selectedObjectIndex].y = newCoord;
    }

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
          onBlur={event => changeCoord("x", event)}
          className="w-2/3 outline-none bg-inherit border-b-2"
        />
      </div>
      <div className="flex flex-row w-1/2">
        <p className="mr-2">y: </p>
        <input
          type="number"
          defaultValue={beacon.y}
          onBlur={event => changeCoord("y", event)}
          className="w-2/3 outline-none bg-inherit border-b-2"
        />
      </div>
    </div>
  </>;
};

export default BeaconProperties;
