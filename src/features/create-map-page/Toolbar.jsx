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

    const mapJSON = generateGeoJSON(editorData.objects);

    Api.post("/map", mapJSON)
      .then(_ => navigate("/success"))
      .catch(error => console.error(error));
  };

  const changeTool = tool => setEditorData(prev => {
    const newEditorData = {...prev};
    newEditorData.currentState.tool = tool;
    return newEditorData;
  });

  const toggleGridSnapping = () => setEditorData(prev => {
    const newEditorData = {...prev};
    newEditorData.currentState.gridSnappingEnabled = !newEditorData.currentState.gridSnappingEnabled;
    return newEditorData;
  });

  return (
    <div className="flex flex-col items-start justify-between w-[15vw] h-[90.5vh] mx-4">
      <div>
        <div className="flex flex-row justify-between">
          <p>Привязка к сетке</p>
          <input
            type="radio"
            onClick={toggleGridSnapping}
            checked={editorData?.currentState.gridSnappingEnabled}
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
