import {EMPTY_EDITOR_DATA, EMPTY_FLOOR, EMPTY_NEW_OBJECTS} from "./editorConstants";
import {
  Axis,
  ClosestWallPointType,
  CurrentSettingsType,
  EditorDataType,
  FloorsType,
  FloorType,
  NewObjectsType,
  Object,
  ObjectsType,
  ObjectType,
  PartialStairs,
  PartialWall,
  Point,
  SelectedObjectType,
  StairsBoundsType,
  StairsDirectionType,
  ToolType,
  Types
} from "./types";
import {cloneDeep} from "lodash";
import {KonvaEventObject} from "konva/lib/Node";
import {getFloorIndexByOffset} from "../utils";

export default class EditorState {
  data: EditorDataType;

  constructor(data?: EditorDataType) {
    this.data = data ?? EMPTY_EDITOR_DATA;
  }

  copy(): EditorState {
    return new EditorState(this.data);
  }

  getCanvasWidth = () => this.data.constants.CANVAS_WIDTH;
  getCanvasHeight = () => this.data.constants.CANVAS_HEIGHT;
  getConstants = () => this.data.constants;
  getCurrentState = () => this.data.currentState;
  getSettings = () => this.data.currentState.settings;
  getCurrentInput = () => this.data.currentState.input;
  getCurrentGeometry = () => this.data.currentState.geometry;
  getCurrentTool = () => this.data.currentState.tool;
  getOnClickListeners = () => this.data.eventListeners.onClick;
  getCurrentFloorNumber = () => this.data.currentState.floor;
  getCurrentFloor = () => this.data.floors[this.getCurrentFloorNumber()];
  getFloors = () => this.data.floors;
  getFloorsToForceShow = () => this.data.currentState.floorsToForceShow;
  getOffset = () => this.data.currentState.geometry.offset;
  getScale = () => this.data.currentState.geometry.scale;
  getScaledGridSize = () => this.data.currentState.geometry.scaledGridSize;
  getUndoStack = () => this.data.undoStack;
  getRedoStack = () => this.data.redoStack;
  getNewWall = () => this.data.currentState.newObjects.newWall;
  getNewStairs = () => this.data.currentState.newObjects.newStairs;
  getClosestWallPoint = () => this.data.currentState.input.closestWallPoint;
  getSelectedObject = () => this.data.currentState.selectedObject;

  getFloor(floorNumber: string): FloorType | undefined {
    return this.data.floors[floorNumber];
  }

  getSnappedCursorPosition() {
    if (this.getSettings().gridSnappingEnabled) {
      return this.getCurrentInput().cursorPositionSnapped;
    }

    return this.getCurrentInput().closestWallPoint.screenCoords || this.getCurrentInput().cursorPosition;
  }

  getObjectsOnCurrentFloor<T extends ObjectType>(objectType: T): ObjectsType[T] {
    return this.getCurrentFloor()?.objects[objectType] as ObjectsType[T] || [];
  }

  getObjectsOnFloorBeneath<T extends ObjectType>(objectType: T): ObjectsType[T] {
    const floorIndex = getFloorIndexByOffset(this.getFloors(), this.getCurrentFloorNumber(), -1);

    if (!floorIndex) {
      return [];
    }

    return this.getObjectsOnFloor(floorIndex, objectType);
  }

  getObjectsOnFloor<T extends ObjectType>(floorNumber: string, objectType: T): ObjectsType[T] {
    return this.getFloor(floorNumber)?.objects[objectType] as ObjectsType[T] || [];
  }

  isPanning = () => this.data.currentState.input.isPanning;

  setIsPanning(isPanning: boolean) {
    this.data.currentState.input.isPanning = isPanning;
  }

  setCursorPosition(position: Point | null) {
    this.data.currentState.input.cursorPosition = position;
  }

  setCursorPositionSnapped(position: Point | null) {
    this.data.currentState.input.cursorPositionSnapped = position;
  };

  setOffset(offset: Point) {
    this.data.currentState.geometry.offset = offset;
  }

  setScale(scale: number) {
    this.data.currentState.geometry.scale = scale;
  }

  setScaledGridSize(scaledGridSize: number) {
    this.data.currentState.geometry.scaledGridSize = scaledGridSize;
  }

  setClosestWallPoint(points: ClosestWallPointType) {
    this.data.currentState.input.closestWallPoint = points;
  }

  setBluetoothID(beaconIndex: number, newID: string) {
    this.getCurrentFloor().objects[Types.BEACONS][beaconIndex].ID = newID;
  }

  clearSelection() {
    this.data.currentState.selectedObject = null;
  }

  setFloors(floors: FloorsType) {
    this.data.floors = floors;
  }

  setSettings(settings: CurrentSettingsType) {
    this.data.currentState.settings = settings;
  }

  setTool(tool: ToolType) {
    this.data.currentState.tool = tool;
  }

  setNewObjects(newObjects: NewObjectsType) {
    this.data.currentState.newObjects = newObjects;
  }

  setNewWall(newWall: PartialWall | null) {
    this.data.currentState.newObjects.newWall = newWall;
  }

  setNewStairs(newStairs: PartialStairs) {
    this.data.currentState.newObjects.newStairs = newStairs;
  }

  setNewStairsBounds(newStairsBounds: Partial<StairsBoundsType>) {
    if (this.data.currentState.newObjects.newStairs) {
      this.data.currentState.newObjects.newStairs.bounds = newStairsBounds;
    }
  }

  setNewStairsType(newStairsType: Types.STAIRS_UP | Types.STAIRS_DOWN) {
    if (this.data.currentState.newObjects.newStairs) {
      this.data.currentState.newObjects.newStairs.type = newStairsType;
    }
  }

  setNewStairsBoundsPoint(pointIndex: number, newPoint: Point) {
    if (this.data.currentState.newObjects.newStairs) {
      // @ts-ignore
      this.data.currentState.newObjects.newStairs.bounds[`x${pointIndex}`] = newPoint.x;
      // @ts-ignore
      this.data.currentState.newObjects.newStairs.bounds[`y${pointIndex}`] = newPoint.y;
    }
  }

  setNewStairsDirection(newDirection: Partial<StairsDirectionType>) {
    if (this.data.currentState.newObjects.newStairs) {
      this.data.currentState.newObjects.newStairs.direction = newDirection;
    }
  }

  setFloorsToForceShow(floors: string[]) {
    this.data.currentState.floorsToForceShow = floors;
  }

  setCurrentFloorNumber(floor: string) {
    this.data.currentState.floor = floor;
  }

  setRedoStack(stack: FloorsType[]) {
    this.data.redoStack = stack;
  }

  setCurrentFloor(floor: FloorType) {
    this.data.floors[this.getCurrentFloorNumber()] = floor;
  }

  setSelectedObject(object: SelectedObjectType) {
    this.data.currentState.selectedObject = object;
  }

  addOnClickListener(eventListener: ((event: KonvaEventObject<MouseEvent>) => void)) {
    this.data.eventListeners.onClick.push(eventListener);
  }

  deleteCurrentFloor() {
    delete this.data.floors[this.getCurrentFloorNumber()];
  }

  addNewObject(newObject: Object, objectType: ObjectType) {
    this.getUndoStack().push(cloneDeep(this.getFloors()));
    this.setRedoStack([]);

    if (!this.getCurrentFloor()) {
      this.setCurrentFloor(cloneDeep(EMPTY_FLOOR));
    }

    const objects = this.getObjectsOnCurrentFloor(objectType) as ObjectsType[typeof objectType][number][];

    this.setSelectedObject({
      type: objectType,
      index: objects.length,
    });

    objects.push(newObject);

    this.setNewObjects(cloneDeep(EMPTY_NEW_OBJECTS));
  }

  worldToScreenCoords(coords: Point): Point {
    const screenX = this.worldToScreenCoord(coords.x, Axis.X);
    const screenY = this.worldToScreenCoord(coords.y, Axis.Y);

    return {x: screenX, y: screenY};
  }

  worldToScreenCoord(coord: number, axis: Axis): number {
    const {scaledGridSize, offset} = this.getCurrentGeometry();

    return axis === Axis.X
      ? coord * scaledGridSize + offset.x
      : -coord * scaledGridSize + offset.y;
  }

  flatWorldToScreenCoords(coords: number[]): number[] {
    if (!coords) {
      return [];
    }

    return coords.map((coord, index) => {
      const axis = index % 2 === 0 ? Axis.X : Axis.Y;
      return this.worldToScreenCoord(coord, axis);
    });
  }

  screenToWorldCoords(coords: Point): Point {
    const fixPrecisionError = (number: number): number => {
      const epsilon = 0.001;

      const nearestInt = Math.round(number)
      if (Math.abs(number - nearestInt) < epsilon) {
        return nearestInt;
      }

      return number;
    };

    const {offset, scaledGridSize} = this.getCurrentGeometry();

    const worldX = fixPrecisionError((coords.x - offset.x) / scaledGridSize);
    const worldY = fixPrecisionError(-(coords.y - offset.y) / scaledGridSize);

    return {x: worldX, y: worldY};
  }
}