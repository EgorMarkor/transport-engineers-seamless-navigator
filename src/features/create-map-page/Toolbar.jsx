import {useRef} from "react";
import {useNavigate} from "react-router-dom";
import Api from "api";
import {useEditorData} from "shared/hooks/useEditorData";
import generateGeoJSON from "./generateGeoJSON";

const Toolbar = () => {
  const {editorData, setEditorData} = useEditorData();
  const navigate = useNavigate();
  const bluetoothIdInputRef = useRef(null);

  const saveMap = event => {
    event.preventDefault();

    if (!bluetoothIdInputRef.current.value) {
      return;
    }

    const mapJSON = generateGeoJSON(editorData.objects, bluetoothIdInputRef.current.value);

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
    <div className="flex flex-col items-start justify-between w-[15vw] h-[90.5vh] mx-4">
      <div>
        <p onClick={() => changeTool("select")}>Режим выделения</p>

        <p className="mt-10">Создать новый объект</p>
        <div className="ml-4">
          <p onClick={() => changeTool("wall")}>Стена</p>
          <p onClick={() => changeTool("beacon")}>Bluetooth - маячок</p>
          <p onClick={() => changeTool("door")}>Дверь</p>
        </div>
      </div>

      <div className="flex flex-col w-full mb-4">
        <input
          ref={bluetoothIdInputRef}
          name="bluetoothID"
          placeholder="ID bluetooth-маячков"
          className="my-6 outline-none bg-inherit border-b-2 py-2 dark:placeholder:text-dark-text-primary"
        />

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
