import {useEditorState} from "shared/hooks/useEditorState";
import {Property, Types} from "../EditorState/types";
import {changeCoord} from "../utils";

const WallProperties = () => {
  const {editorState, setEditorState} = useEditorState();
  const selectedObject = editorState.getSelectedObject();

  if (!selectedObject) {
    return <></>;
  }

  const wall = editorState.getCurrentFloor().objects[Types.WALLS][selectedObject.index];

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
              onBlur={event => changeCoord(Property.x1, Types.WALLS, event, setEditorState)}
              className="w-2/3 outline-none bg-inherit border-b-2"
            />
          </div>
          <div className="flex flex-row w-1/2">
            <p className="mr-2">y: </p>
            <input
              type="number"
              defaultValue={wall.y1}
              onBlur={event => changeCoord(Property.y1, Types.WALLS, event, setEditorState)}
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
              onBlur={event => changeCoord(Property.x2, Types.WALLS, event, setEditorState)}
              className="w-2/3 outline-none bg-inherit border-b-2"
            />
          </div>
          <div className="flex flex-row w-1/2">
            <p className="mr-2">y: </p>
            <input
              type="number"
              defaultValue={wall.y2}
              onBlur={event => changeCoord(Property.y2, Types.WALLS, event, setEditorState)}
              className="w-2/3 outline-none bg-inherit border-b-2"
            />
          </div>
        </div>
      </div>
    </div>
  </>;
};

export default WallProperties;
