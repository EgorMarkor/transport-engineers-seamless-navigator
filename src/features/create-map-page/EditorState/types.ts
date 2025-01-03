import {KonvaEventObject} from "konva/lib/Node";

export const enum Types {
  SELECT = "select",
  BACKGROUND = "background",
  GRID = "grid",
  WALLS = "walls",
  BEACONS = "beacons",
  DOORS = "doors",
  STAIRS_UP = "stairsUp",
  STAIRS_DOWN = "stairsDown",
}

export const enum Axis {
  X,
  Y,
}

export const enum Property {
  x = "x",
  y = "y",
  x1 = "x1",
  y1 = "y1",
  x2 = "x2",
  y2 = "y2",
}

export interface Point {
  x: number;
  y: number;
}

export interface EditorConstantsType {
  CANVAS_WIDTH: number;
  CANVAS_HEIGHT: number;
  INITIAL_GRID_SIZE: number;
  WHEEL_SCALE_RATIO: number;
}

export interface WallType {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface BeaconType {
  x: number;
  y: number;
  ID: string;
}

export interface DoorType {
  x: number;
  y: number;
}

export interface StairsType {
  type: Types.STAIRS_UP | Types.STAIRS_DOWN;
  startFloor: string;
  endFloor: string;
  bounds: StairsBoundsType;
  direction: StairsDirectionType;
}

export interface StairsBoundsType {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  x4: number;
  y4: number;
}

export interface StairsDirectionType {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}


export interface ObjectsType {
  [Types.WALLS]: WallType[];
  [Types.BEACONS]: BeaconType[];
  [Types.DOORS]: DoorType[];
  [Types.STAIRS_UP]: StairsType[];
  [Types.STAIRS_DOWN]: StairsType[];
}

export type Object =
  WallType |
  BeaconType |
  DoorType |
  StairsType;

export type ObjectType =
  Types.WALLS |
  Types.BEACONS |
  Types.DOORS |
  Types.STAIRS_UP |
  Types.STAIRS_DOWN;

export interface FloorType {
  objects: ObjectsType;
}

export type FloorsType = Record<string, FloorType>

export type ToolType = Types.SELECT | ObjectType;

export interface ClosestWallPointType {
  worldCoords: Point | null;
  screenCoords: Point | null;
}

export interface EditorInputType {
  cursorPosition: Point | null;
  cursorPositionSnapped: Point | null;
  isPanning: boolean;
  closestWallPoint: ClosestWallPointType;
}

export interface CurrentGeometryType {
  offset: Point;
  scale: number;
  scaledGridSize: number;
}

export enum SettingKey {
  GridSnappingEnabled = "gridSnappingEnabled",
  ShowingObjectsBeneathEnabled = "showingObjectsBeneathEnabled",
}

export interface CurrentSettingsType {
  [SettingKey.GridSnappingEnabled]: boolean;
  [SettingKey.ShowingObjectsBeneathEnabled]: boolean;
}


export type PartialWall = Partial<WallType>;

export interface PartialStairs {
  type: Types.STAIRS_UP | Types.STAIRS_DOWN | null;
  startFloor: string | null;
  endFloor: string | null;
  bounds: Partial<StairsBoundsType> | null;
  direction: Partial<StairsDirectionType> | null;
}

export interface NewObjectsType {
  newWall: PartialWall | null;
  newStairs: PartialStairs | null;
}

export interface SelectedObjectType {
  type: ObjectType;
  index: number;
}

export interface CurrentEditorStateType {
  floor: string;
  tool: ToolType;
  selectedObject: SelectedObjectType | null;
  floorsToForceShow: string[];
  input: EditorInputType;
  newObjects: NewObjectsType;
  geometry: CurrentGeometryType;
  settings: CurrentSettingsType;
}

export interface EditorEventListenersType {
  onClick: ((event: KonvaEventObject<MouseEvent>) => void)[];
}

export interface EditorDataType {
  constants: EditorConstantsType;
  floors: FloorsType;
  currentState: CurrentEditorStateType;
  undoStack: FloorsType[];
  redoStack: FloorsType[];
  eventListeners: EditorEventListenersType;
}
