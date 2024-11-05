import {useEditorData} from "shared/hooks/useEditorData";
import WallProperties from "./ObjectsProperties/WallProperties";
import BeaconProperties from "./ObjectsProperties/BeaconProperties";
import DoorProperties from "./ObjectsProperties/DoorProperties";

const PropertiesList = () => {
  const {editorData, setEditorData} = useEditorData();
  const selectedObjectType = editorData?.currentState.selectedObject?.type;

  const deleteSelectedObject = () => setEditorData(prev => {
    const newEditorData = {...prev};
    const {type, index} = newEditorData.currentState.selectedObject;

    const objects = newEditorData.objects[`${type}s`];
    newEditorData.objects[`${type}s`] = [
      ...objects.slice(0, index),
      ...objects.slice(index + 1),
    ];

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
        {selectedObjectType === "wall" && <WallProperties/>}
        {selectedObjectType === "beacon" && <BeaconProperties/>}
        {selectedObjectType === "door" && <DoorProperties/>}
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
