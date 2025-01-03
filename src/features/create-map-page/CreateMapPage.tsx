import {EditorStateProvider} from "shared/hooks/useEditorState";
import NoZoomWarning from "./NoZoomWarning/NoZoomWarning";
import Toolbar from "./Toolbar";
import EditorCanvas from "./EditorCanvas";
import PropertiesList from "./PropertiesList";

const CreateMapPage = () => {
  return (
    <div className="flex flex-row justify-between">
      <NoZoomWarning/>
      <EditorStateProvider>
        <Toolbar/>
        <EditorCanvas/>
        <PropertiesList/>
      </EditorStateProvider>
    </div>
  );
};

export default CreateMapPage;
