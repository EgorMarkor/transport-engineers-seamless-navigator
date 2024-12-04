import {useEditorData} from "shared/hooks/useEditorData";
import {Types} from "./editorConstants";
import WallProperties from "./ObjectsProperties/WallProperties";
import BeaconProperties from "./ObjectsProperties/BeaconProperties";
import DoorProperties from "./ObjectsProperties/DoorProperties";

const PropertiesList = () => {
  const {editorData, setEditorData} = useEditorData();
  const selectedObjectType = editorData?.currentState.selectedObject?.type;

  const deleteSelectedObject = () => setEditorData(prev => {
    const newEditorData = {...prev};
    const {type, index} = newEditorData.currentState.selectedObject;
    const floorNumber = newEditorData.currentState.floor;

    const objects = newEditorData.floors[floorNumber].objects[type];
    newEditorData.floors[floorNumber].objects[type] = [
      ...objects.slice(0, index),
      ...objects.slice(index + 1),
    ];


    const isFloorEmpty = Object.values(newEditorData.floors[floorNumber].objects).every(
      objectsArray => objectsArray.length === 0
    );

    if (isFloorEmpty) {
      delete newEditorData.floors[floorNumber];
    }

    newEditorData.currentState.selectedObject = null;

    return newEditorData;
  });

  if (!selectedObjectType) {
    return (
      <div className="flex flex-col items-start w-[15vw] h-[90.5vh] ml-4">
        <p className="self-center text-center">Выберите объект для редактирования его свойств</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-between w-[15vw] h-[90.5vh] ml-4">
      <div className="w-full">
        {selectedObjectType === Types.WALLS && <WallProperties/>}
        {selectedObjectType === Types.BEACONS && <BeaconProperties/>}
        {selectedObjectType === Types.DOORS && <DoorProperties/>}
      </div>

      <button
        onClick={deleteSelectedObject}
        className="self-center mb-[3.5vh] px-3 py-2 rounded dark:bg-red-700"
      >
        Удалить
      </button>
    </div>
  );
};

export default PropertiesList;
