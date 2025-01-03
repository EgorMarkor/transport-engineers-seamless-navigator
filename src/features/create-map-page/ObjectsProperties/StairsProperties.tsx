import {useEditorState} from "shared/hooks/useEditorState";
import {StairsType, Types} from "../EditorState/types";

const StairsProperties = () => {
  const {editorState} = useEditorState();
  const selectedObject = editorState.getSelectedObject();

  if (!selectedObject) {
    return <></>;
  }

  const stairs = editorState.getCurrentFloor().objects[selectedObject.type][selectedObject.index] as StairsType;

  return <>
    <div className="flex justify-center w-full">
      <p>Лестница {stairs.type === Types.STAIRS_UP ? "вверх" : "вниз"}</p>
    </div>
  </>;
};

export default StairsProperties;
