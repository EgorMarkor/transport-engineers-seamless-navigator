import {useEditorState} from "shared/hooks/useEditorState";
import {Property, Types} from "./EditorState/types";
import WallProperties from "./ObjectsProperties/WallProperties";
import BeaconProperties from "./ObjectsProperties/BeaconProperties";
import DoorProperties from "./ObjectsProperties/DoorProperties";
import StairsProperties from "./ObjectsProperties/StairsProperties";
import PointOfInterestProperties from "./ObjectsProperties/PointOfInterestProperties";
import React, {useRef} from "react";

const PropertiesList = () => {
  const {editorState, setEditorState} = useEditorState();
  const selectedObjectType = editorState.getSelectedObject()?.type;

  const globalFields =  editorState.getGlobalFields();

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

  const handleAddress = (newAddress: string) => setEditorState(prevState => {
    const newState = prevState.copy();
    newState.data.globalFields.address = newAddress;
    return newState;
  });

  const handleAzimuth = (newAzimuth: number) => setEditorState(prevState => {
    const newState = prevState.copy();
    newState.data.globalFields.azimuth = parseInt(azimuthInputRef.current?.value || "0");
    return newState;
  });

  const azimuthInputRef = useRef<HTMLInputElement | null>(null);

  if (!selectedObjectType) {
    return (
      <div className="flex flex-col items-start w-[15vw] h-[80vh] ml-4">
        <div className="flex flex-row w-1/2">
          <p className="mr-2">Адрес</p>
          <input
            defaultValue={globalFields.address}
            onChange={event => handleAddress(event.target.value)}
            className="w-2/3 outline-none bg-inherit border-b-2"
          />
        </div>
        <div className="flex flex-row w-1/2">
          <p className="mr-2">Азимут</p>
          <input
            type="number"
            ref={azimuthInputRef}
            value={globalFields.azimuth}
            onChange={event => handleAzimuth(parseInt(event.target.value))}
            className="w-2/3 outline-none bg-inherit border-b-2"
          />
        </div>
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
        {selectedObjectType === Types.POINTS_OF_INTEREST && <PointOfInterestProperties/>}
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
