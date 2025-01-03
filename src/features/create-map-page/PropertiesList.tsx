import {useEditorState} from "shared/hooks/useEditorState";
import {Types} from "./EditorState/types";
import WallProperties from "./ObjectsProperties/WallProperties";
import BeaconProperties from "./ObjectsProperties/BeaconProperties";
import DoorProperties from "./ObjectsProperties/DoorProperties";
import StairsProperties from "./ObjectsProperties/StairsProperties";

const PropertiesList = () => {
  const {editorState, setEditorState} = useEditorState();
  const selectedObjectType = editorState.getSelectedObject()?.type;

  const deleteSelectedObject = () => setEditorState(prevState => {
    const newState = prevState.copy();

    const selectedObject = newState.getSelectedObject();

    if (!selectedObject) {
      return newState;
    }

    const {type, index} = selectedObject;

    const currentFloor = newState.getCurrentFloor();
    const objects = currentFloor.objects;

    const newObjects = {
      ...objects,
      [type]: [
        ...objects[type].slice(0, index),
        ...objects[type].slice(index + 1)
      ],
    };

    newState.setCurrentFloor({
      objects: newObjects,
    });

    const isFloorEmpty = Object.values(objects).every(objects => objects.length === 0);

    if (isFloorEmpty) {
      newState.deleteCurrentFloor();
    }

    newState.clearSelection();

    return newState;
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
        {[Types.STAIRS_UP, Types.STAIRS_DOWN].includes(selectedObjectType) && <StairsProperties/>}
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
