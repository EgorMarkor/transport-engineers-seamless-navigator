import {EditorDataProvider} from "shared/hooks/useEditorData";
import NoZoomWarning from "./NoZoomWarning";
import Toolbar from "./Toolbar";
import EditorCanvas from "./EditorCanvas";

const CreateMapPage = () => {
  return (
    <div className="flex flex-row justify-between">
      <NoZoomWarning/>
      <EditorDataProvider>
        <Toolbar/>
        <EditorCanvas/>
      </EditorDataProvider>
    </div>
  );
};

export default CreateMapPage;
