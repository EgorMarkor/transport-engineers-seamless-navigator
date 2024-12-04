export const Types = Object.freeze({
  SELECT: "select",
  WALLS: "walls",
  BEACONS: "beacons",
  DOORS: "doors",
});

export const EMPTY_FLOOR = {
  objects: {
    walls: [],
    beacons: [],
    doors: [],
  },
};

export const EMPTY_EDITOR_DATA = {
  constants: {
    CANVAS_WIDTH: window.innerWidth * 0.7,
    CANVAS_HEIGHT: window.innerHeight * 0.905,
    INITIAL_GRID_SIZE: window.innerWidth * 0.03,
    WHEEL_SCALE_RATIO: 1.1,
  },
  floors: {},
  currentState: {
    floor: 1,
    tool: Types.SELECT,
    settings: {
      gridSnappingEnabled: true,
      showingObjectsBeneathEnabled: true,
    },
    input: {
      cursorPosition: null,
      cursorPositionSnapped: null,
      isPanning: false,
      closestWallPoint: {
        worldCoords: null,
        screenCoords: null,
      },
    },
    geometry: {
      offset: {x: 0, y: 0},
      scale: 1,
      scaledGridSize: window.innerWidth * 0.03,
    },
    newObjects: {
      newWall: null,
      newDoor: null,
    },
    selectedObject: null,
  },
  undoStack: [],
  redoStack: [],
  eventListeners: {
    onClick: [],
  },
};
