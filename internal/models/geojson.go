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
	CreatorID string `bson:"creatorID" json:"-"`
}

type Feature struct {
	Type       string                 `bson:"type" json:"type" binding:"required"`
	Properties map[string]interface{} `bson:"properties" json:"properties" binding:"required"`
	Geometry   map[string]interface{} `bson:"geometry" json:"geometry" binding:"required"`
}
