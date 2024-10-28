package repository

import (
	"context"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type MapRepository struct {
	database   *mongo.Database
	collection string
}

func NewMapRepository(db *mongo.Database, collection string) *MapRepository {
	return &MapRepository{
		database:   db,
		collection: collection,
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

func (repo *MapRepository) GetMap(ctx context.Context) (models.GeoJSON, error) {
	collection := repo.database.Collection(repo.collection)
	var result models.GeoJSON
	err := collection.FindOne(ctx, bson.D{}).Decode(&result)
	return result, err
}
