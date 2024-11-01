package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const MapCollection = "maps"

type GeoJSON struct {
	ID         primitive.ObjectID   `bson:"_id" json:"-"`
	Type       string               `bson:"type" json:"type" binding:"required"`
	Properties FeatureSetProperties `bson:"properties" json:"properties" binding:"required"`
	Features   []Feature            `bson:"features" json:"features" binding:"required,dive"`
}

type FeatureSetProperties struct {
	CreatorID   string `bson:"creatorID" json:"-"`
	BluetoothID string `bson:"bluetoothID" json:"bluetoothID" binding:"required"`
}

type Feature struct {
	Type       string                 `bson:"type" json:"type" binding:"required"`
	Properties map[string]interface{} `bson:"properties" json:"properties" binding:"required"`
	Geometry   Geometry               `bson:"geometry" json:"geometry" binding:"required"`
}

type Geometry struct {
	Type        string      `bson:"type" json:"type" binding:"required"`
	Coordinates interface{} `bson:"coordinates" json:"coordinates" binding:"required"`
}
