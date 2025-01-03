import React from "react";
import {useNavigate} from "react-router-dom";
import Api from "api";
import {useEditorState} from "shared/hooks/useEditorState";
import generateGeoJSON from "./generateGeoJSON";
import {SettingKey, ToolType, Types} from "./EditorState/types";
import {cloneDeep} from "lodash";
import {EMPTY_NEW_OBJECTS} from "./EditorState/editorConstants";
import {getFloorIndexByOffset} from "./utils";

const Toolbar = () => {
  const {editorState, setEditorState} = useEditorState();
  const navigate = useNavigate();

  const saveMap = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const mapJSON = generateGeoJSON(editorState.getFloors());

    Api.post("/map", mapJSON)
      .then(_ => navigate("/success"))
      .catch(error => console.error(error));
  };

  const toggleSetting = (setting: SettingKey) => setEditorState(prevState => {
    const newState = prevState.copy();

    const newSettings = prevState.getSettings();
    newSettings[setting] = !newSettings[setting];
    newState.setSettings(newSettings)

    return prevState;
  });

  const changeFloor = (event: React.FocusEvent<HTMLInputElement>) => setEditorState(prevState => {
    const newState = prevState.copy();

    newState.setCurrentFloorNumber(event.target.value);
    newState.clearSelection();

    return newState;
  });

  const changeTool = (tool: ToolType) => setEditorState(prevState => {
    const newState = prevState.copy();

    newState.setTool(tool);
    newState.setNewObjects(cloneDeep(EMPTY_NEW_OBJECTS));
    newState.setFloorsToForceShow([]);

    if ([Types.STAIRS_UP, Types.STAIRS_DOWN].includes(tool)) {
      const floorToForceShow = getFloorIndexByOffset(
        prevState.getFloors(),
        prevState.getCurrentFloorNumber(),
        tool === Types.STAIRS_UP ? 1 : -1,
      );

      if (floorToForceShow) {
        newState.getFloorsToForceShow().push(floorToForceShow);
      }
    }

    return newState;
  });

  const settings = editorState.getSettings();

  return (
    <div className="flex flex-col items-start justify-between w-[15vw] h-[90.5vh] mx-4">
      <div>
        <div className="flex flex-row justify-between">
          <p>Привязка к сетке</p>
          <input
            type="radio"
            onClick={() => toggleSetting(SettingKey.GridSnappingEnabled)}
            checked={settings.gridSnappingEnabled}
          />
        </div>

        <div className="flex flex-row justify-between">
          <p>Показывать объекты на этаже ниже</p>
          <input
            type="radio"
            onClick={() => toggleSetting(SettingKey.ShowingObjectsBeneathEnabled)}
            checked={settings.showingObjectsBeneathEnabled}
          />
        </div>

        <div className="flex flex-row justify-between mt-3">
          <p>Этаж</p>
          <input
            type="number"
            step="0.5"
            defaultValue={1}
            onBlur={event => changeFloor(event)}
            className="w-1/6 outline-none bg-inherit border-b-2 text-center"
          />
        </div>

        <p onClick={() => changeTool(Types.SELECT)} className="mt-5">Режим выделения</p>

        <p className="mt-10">Создать новый объект</p>
        <div className="ml-4">
          <div>
            <p onClick={() => changeTool(Types.WALLS)}>Стена</p>
            <p onClick={() => changeTool(Types.BEACONS)}>Bluetooth - маячок</p>
            <p onClick={() => changeTool(Types.DOORS)}>Дверь</p>
          </div>
          <div className="mt-2">
            <p onClick={() => changeTool(Types.STAIRS_UP)}>Лестница вверх</p>
            <p onClick={() => changeTool(Types.STAIRS_DOWN)}>Лестница вниз</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full mb-4">
        <button
          onClick={saveMap}
          className="self-center px-3 py-2 rounded dark:bg-dark-secondary"
        >
          Сохранить →
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
