package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

const UserCollection = "users"

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty"`
	Username     string             `bson:"username"`
	Email        string             `bson:"email"`
	Password     string             `bson:"password"`
	CreationTime time.Time          `bson:"creation_time"`
}
