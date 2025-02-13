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
	var requestedMap models.GeoJSON

	bleKey := fmt.Sprintf("ble:%s", ID)
	mapKey, err := repo.redis.Get(ctx, bleKey).Result()
	if err == nil {
		mapData, err := repo.redis.Get(ctx, mapKey).Bytes()
		if err == nil {
			err = json.Unmarshal(mapData, &requestedMap)
			if err == nil {
				return requestedMap, nil
			}
		}
	}

	collection := repo.database.Collection(repo.collection)
	err = collection.FindOne(ctx, bson.M{
		"features": bson.M{
			"$elemMatch": bson.M{
				"properties.bluetoothID": ID,
			},
		},
	}).Decode(&requestedMap)
	if err != nil {
		return requestedMap, err
	}

	cacheExpiry := time.Duration(repo.cacheExpiry) * time.Minute
	mapKey = fmt.Sprintf("map:%s", requestedMap.ID.Hex())
	marshaledData, err := json.Marshal(requestedMap)
	if err != nil {
		return requestedMap, nil
	}

	pipe := repo.redis.Pipeline()

	err = pipe.Set(ctx, mapKey, marshaledData, cacheExpiry).Err()
	if err != nil {
		log.Printf("Failed to cache map in redis: %s\n", err.Error())
		return requestedMap, nil
	}

	for _, feature := range requestedMap.Features {
		bluetoothID, ok := feature.Properties["bluetoothID"].(string)
		if ok {
			bleKey := fmt.Sprintf("ble:%s", bluetoothID)
			err = pipe.Set(ctx, bleKey, mapKey, cacheExpiry).Err()
			if err != nil {
				log.Printf("Failed to cache ble in redis: %s\n", err.Error())
			}
		}
	}
	_, _ = pipe.Exec(ctx)

	return requestedMap, err
}

func (repo *MapRepository) DeleteMapByBluetoothID(ctx context.Context, ID string) error {
	var deletedMap models.GeoJSON

	collection := repo.database.Collection(repo.collection)

	err := collection.FindOneAndDelete(ctx, bson.M{
		"features": bson.M{
			"$elemMatch": bson.M{
				"properties.bluetoothID": ID,
			},
		},
	}).Decode(&deletedMap)
	if err != nil {
		return err
	}

	mapKey := fmt.Sprintf("map:%s", deletedMap.ID.Hex())

	if err := repo.redis.Del(ctx, mapKey).Err(); err != nil {
		log.Printf("Failed to delete map key from Redis: %v", err)
	}

	for _, feature := range deletedMap.Features {
		if bluetoothID, ok := feature.Properties["bluetoothID"].(string); ok {
			bleKey := fmt.Sprintf("ble:%s", bluetoothID)
			if err := repo.redis.Del(ctx, bleKey).Err(); err != nil {
				log.Printf("Failed to delete BLE key from Redis: %v", err)
			}
		}
	}

	return nil
}
