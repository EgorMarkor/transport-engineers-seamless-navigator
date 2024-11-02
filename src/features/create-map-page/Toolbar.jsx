import {useNavigate} from "react-router-dom";
import Api from "api";
import {useEditorData} from "shared/hooks/useEditorData";
import generateGeoJSON from "./generateGeoJSON";

const Toolbar = () => {
  const {editorData, setEditorData} = useEditorData();
  const navigate = useNavigate();

  const saveMap = event => {
    event.preventDefault();

    const mapJSON = generateGeoJSON(editorData.objects);

    Api.post("/map", mapJSON)
      .then(response => navigate("/success"))
      .catch(error => console.error(error));
  };

  const changeTool = tool => setEditorData(prev => {
    const newEditorData = {...prev};
    newEditorData.currentState.tool = tool;
    return newEditorData;
  });

  return (
    <div className="flex flex-col items-start w-[15vw] h-[90.5vh] ml-4">
      <p onClick={() => changeTool("select")}>Режим выделения</p>

      <p className="mt-10">Создать новый объект</p>
      <div className="ml-4">
        <p onClick={() => changeTool("wall")}>Стена</p>
        <p onClick={() => changeTool("beacon")}>Bluetooth - маячок</p>
      </div>

      <button
        onClick={saveMap}
        className="mt-[68.5vh] self-center px-3 py-2 rounded dark:bg-dark-secondary"
      >
        Сохранить →
      </button>
    </div>
  );
};

export default Toolbar;
