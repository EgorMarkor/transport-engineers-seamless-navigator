import React, {createContext, useContext, useState} from "react";
import EditorState from "features/create-map-page/EditorState/editorState";

export interface EditorContextType {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>
}

const EditorContext = createContext<EditorContextType | null>(null);

export const useEditorState = () => {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error("useEditorState must be used within an EditorStateProvider");
  }

  return context;
}

interface EditorStateProviderProps {
  children: React.ReactNode;
}

export const EditorStateProvider = ({children}: EditorStateProviderProps) => {
  const [editorState, setEditorState] = useState<EditorState>(new EditorState());

  return (
    <EditorContext.Provider value={{editorState, setEditorState}}>
      {children}
    </EditorContext.Provider>
  );
};
