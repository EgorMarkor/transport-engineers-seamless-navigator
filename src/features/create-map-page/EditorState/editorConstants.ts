import {EditorDataType, FloorType, NewObjectsType, ToolType, Types} from "./types";

export const EMPTY_FLOOR: FloorType = {
  objects: {
    [Types.WALLS]: [],
    [Types.BEACONS]: [],
    [Types.DOORS]: [],
    [Types.STAIRS_UP]: [],
    [Types.STAIRS_DOWN]: [],
  },
};

export const EMPTY_NEW_OBJECTS: NewObjectsType = {
  newWall: null,
  newStairs: null,
};

export const EMPTY_EDITOR_DATA: EditorDataType = {
  constants: {
    CANVAS_WIDTH: window.innerWidth * 0.7,
    CANVAS_HEIGHT: window.innerHeight * 0.905,
    INITIAL_GRID_SIZE: window.innerWidth * 0.03,
    WHEEL_SCALE_RATIO: 1.1,
  },
  floors: {},
  currentState: {
    floor: "1",
    tool: Types.SELECT as ToolType,
    selectedObject: null,
    floorsToForceShow: [],
    input: {
      cursorPosition: null,
      cursorPositionSnapped: null,
      isPanning: false,
      closestWallPoint: {
        worldCoords: null,
        screenCoords: null,
      },
    },
    newObjects: EMPTY_NEW_OBJECTS,
    geometry: {
      offset: {x: 0, y: 0},
      scale: 1,
      scaledGridSize: window.innerWidth * 0.03,
    },
    settings: {
      gridSnappingEnabled: true,
      showingObjectsBeneathEnabled: true,
    },
  },
  undoStack: [],
  redoStack: [],
  eventListeners: {
    onClick: [],
  },
};

export const COLORS = Object.freeze({
  [Types.BACKGROUND]: "rgb(47, 48, 45)",
  [Types.GRID]: "rgb(0, 77, 55)",
  [Types.WALLS]: "rgb(255, 120, 39)",
  [Types.BEACONS]: "rgb(79, 90, 255)",
  [Types.STAIRS_UP]: {
    bounds: "rgb(255, 235, 60)",
    direction: "rgb(0, 200, 0)",
  },
  [Types.STAIRS_DOWN]: {
    bounds: "rgb(240, 195, 0)",
    direction: "rgb(255, 50, 50)",
  },
});
