import {EditorDataProvider} from "shared/hooks/useEditorData";
import NoZoomWarning from "./NoZoomWarning";
import Toolbar from "./Toolbar";
import EditorCanvas from "./EditorCanvas";
import PropertiesList from "./PropertiesList";

const CreateMapPage = () => {
  return (
    <div className="flex flex-row justify-between">
      <NoZoomWarning/>
      <EditorDataProvider>
        <Toolbar/>
        <EditorCanvas/>
        <PropertiesList/>
      </EditorDataProvider>
    </div>
  );
};

export default CreateMapPage;
