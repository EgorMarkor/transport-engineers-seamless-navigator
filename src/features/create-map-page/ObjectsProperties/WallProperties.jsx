import {useEditorData} from "shared/hooks/useEditorData";

const WallProperties = () => {
  const {editorData, setEditorData} = useEditorData();
  const selectedObject = editorData.currentState.selectedObject;
  const wall = editorData.objects.walls[selectedObject.index];

  const changeCoord = (coord, event) => setEditorData(prev => {
    const newEditorData = {...prev};
    const newCoord = event.target.value;

    if (isNaN(newCoord)) {
      return newEditorData;
    }

    const selectedWallIndex = newEditorData.currentState.selectedObject.index;

    if (coord === "x1") {
      newEditorData.objects.walls[selectedWallIndex].x1 = newCoord;
    } else if (coord === "y1") {
      newEditorData.objects.walls[selectedWallIndex].y1 = newCoord;
    } else if (coord === "x2") {
      newEditorData.objects.walls[selectedWallIndex].x2 = newCoord;
    } else if (coord === "y2") {
      newEditorData.objects.walls[selectedWallIndex].y2 = newCoord;
    }

    return newEditorData;
  });

  return <>
    <div className="flex justify-center w-full">
      <p>Стена</p>
    </div>

    <p className="mb-4 mt-6">Координаты</p>
    <div className="flex flex-col w-full">
      <div className="flex flex-col w-full">
        <p className="my-2">Начало</p>

        <div className="flex flex-row">
          <div className="flex flex-row mr-2 w-1/2">
            <p className="mr-2">x: </p>
            <input
              type="number"
              defaultValue={wall.x1}
              onBlur={event => changeCoord("x1", event)}
              className="w-2/3 outline-none bg-inherit border-b-2"
            />
          </div>
          <div className="flex flex-row w-1/2">
            <p className="mr-2">y: </p>
            <input
              type="number"
              defaultValue={wall.y1}
              onBlur={event => changeCoord("y1", event)}
              className="w-2/3 outline-none bg-inherit border-b-2"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <p className="mb-2 mt-3">Конец</p>

        <div className="flex flex-row">
          <div className="flex flex-row mr-2 w-1/2">
            <p className="mr-2">x: </p>
            <input
              type="number"
              defaultValue={wall.x2}
              onBlur={event => changeCoord("x2", event)}
              className="w-2/3 outline-none bg-inherit border-b-2"
            />
          </div>
          <div className="flex flex-row w-1/2">
            <p className="mr-2">y: </p>
            <input
              type="number"
              defaultValue={wall.y2}
              onBlur={event => changeCoord("y2", event)}
              className="w-2/3 outline-none bg-inherit border-b-2"
            />
          </div>
        </div>
      </div>
    </div>
  </>;
};

export default WallProperties;
