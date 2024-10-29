import {createContext, useContext, useState} from "react";

const EditorContext = createContext(null);

export const useEditorData = () => useContext(EditorContext);

export const EditorDataProvider = ({children}) => {
  const [editorData, setEditorData] = useState(null);

  return (
    <EditorContext.Provider value={{editorData, setEditorData}}>
      {children}
    </EditorContext.Provider>
  );
};
