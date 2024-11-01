package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/models"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"log"
	"time"
)

type MapRepository struct {
	database    *mongo.Database
	redis       *redis.Client
	cacheExpiry int
	collection  string
}

func NewMapRepository(db *mongo.Database, redis *redis.Client, cacheExpiry int, collection string) *MapRepository {
	return &MapRepository{
		database:    db,
		redis:       redis,
		cacheExpiry: cacheExpiry,
		collection:  collection,
	}
}

func (repo *MapRepository) Create(ctx context.Context, newMap models.GeoJSON) error {
	collection := repo.database.Collection(repo.collection)

	indexModel := mongo.IndexModel{
		Keys: bson.D{{"location", "2d"}},
	}

	_, err := collection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		return err
	}

	_, err = collection.InsertOne(ctx, newMap)
	if err != nil {
		return err
	}

	return nil
}

func (repo *MapRepository) GetMapByBluetoothID(ctx context.Context, ID string) (models.GeoJSON, error) {
	redisKey := fmt.Sprintf("map:%s", ID)
	var result models.GeoJSON

	data, err := repo.redis.Get(ctx, redisKey).Bytes()
	if err == nil {
		err = json.Unmarshal(data, &result)
		if err == nil {
			return result, nil
		}
	}

	collection := repo.database.Collection(repo.collection)
	err = collection.FindOne(ctx, bson.M{
		"properties": bson.M{
			"bluetoothID": ID,
		},
	}).Decode(&result)
	if err != nil {
		return result, err
	}

	marshaledData, err := json.Marshal(result)
	if err == nil {
		err = repo.redis.Set(ctx, redisKey, marshaledData, time.Duration(repo.cacheExpiry)*time.Minute).Err()
		if err != nil {
			log.Printf("Failed to cache map in redis: %s\n", err.Error())
		}
	}

	return result, err
}
