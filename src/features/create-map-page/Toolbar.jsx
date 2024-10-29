import Api from "api";
import {useEditorData} from "shared/hooks/useEditorData";
import generateGeoJSON from "./CanvasObjects/generateGeoJSON";
import {useNavigate} from "react-router-dom";

const Toolbar = () => {
  const {editorData, setEditorData} = useEditorData();
  const navgiate = useNavigate();

  const changeTool = tool => setEditorData(prev => {
    const newEditorData = {...prev};

    newEditorData.currentState.tool = tool;

    return newEditorData;
  });

  const saveMap = event => {
    event.preventDefault();

    const mapJSON = generateGeoJSON(editorData.objects, editorData.constants.GRID_SIZE);

    Api.post("/map", mapJSON)
      .then(response => navgiate("/success"))
      .catch(error => console.error(error));
  };

  return (
    <div className="flex flex-col items-start w-[20vw] h-[90.5vh] ml-4">
      <p>Создать новый объект</p>

      <div className="ml-4">
        <p onClick={() => changeTool("wall")}>Стена</p>
      </div>

      <button
        onClick={saveMap}
        className="mt-[75vh] self-center px-3 py-2 rounded dark:bg-dark-secondary"
      >
        Сохранить →
      </button>
    </div>
  );
};

export default Toolbar;
