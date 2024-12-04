import {useNavigate} from "react-router-dom";
import Api from "api";
import {useEditorData} from "shared/hooks/useEditorData";
import {Types} from "./editorConstants";
import generateGeoJSON from "./generateGeoJSON";

const Toolbar = () => {
  const {editorData, setEditorData} = useEditorData();
  const navigate = useNavigate();

  const saveMap = event => {
    event.preventDefault();

    const mapJSON = generateGeoJSON(editorData.floors);

    Api.post("/map", mapJSON)
      .then(_ => navigate("/success"))
      .catch(error => console.error(error));
  };

  const toggleSetting = setting => setEditorData(prev => {
    const newEditorData = {...prev};
    newEditorData.currentState.settings[setting] = !newEditorData.currentState.settings[setting];
    return newEditorData;
  });

  const changeFloor = event => setEditorData(prev => {
    const newEditorData = {...prev};

    newEditorData.currentState.floor = parseFloat(event.target.value);
    newEditorData.currentState.selectedObject = null;

    return newEditorData;
  });

  const changeTool = tool => setEditorData(prev => {
    const newEditorData = {...prev};
    newEditorData.currentState.tool = tool;
    return newEditorData;
  });

  const settings = editorData?.currentState.settings;

  return (
    <div className="flex flex-col items-start justify-between w-[15vw] h-[90.5vh] mx-4">
      <div>
        <div className="flex flex-row justify-between">
          <p>Привязка к сетке</p>
          <input
            type="radio"
            onClick={() => toggleSetting("gridSnappingEnabled")}
            checked={settings?.gridSnappingEnabled}
          />
        </div>

        <div className="flex flex-row justify-between">
          <p>Показывать объекты на этаже ниже</p>
          <input
            type="radio"
            onClick={() => toggleSetting("showingObjectsBeneathEnabled")}
            checked={settings?.showingObjectsBeneathEnabled}
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
          <p onClick={() => changeTool(Types.WALLS)}>Стена</p>
          <p onClick={() => changeTool(Types.BEACONS)}>Bluetooth - маячок</p>
          <p onClick={() => changeTool(Types.DOORS)}>Дверь</p>
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
