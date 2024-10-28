package repository

import (
	"context"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserRepository struct {
	database   *mongo.Database
	collection string
}

func NewUserRepository(db *mongo.Database, collection string) *UserRepository {
	return &UserRepository{
		database:   db,
		collection: collection,
	}
}

func (repo *UserRepository) Create(ctx context.Context, user models.User) error {
	collection := repo.database.Collection(repo.collection)

	indexModel := mongo.IndexModel{
		Keys:    bson.D{{"email", 1}},
		Options: options.Index().SetUnique(true),
	}

	_, err := collection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		return err
	}

	_, err = collection.InsertOne(ctx, user)
	if err != nil {
		return err
	}

	return nil
}

func (repo *UserRepository) GetUserByEmail(ctx context.Context, email string) (models.User, error) {
	collection := repo.database.Collection(repo.collection)

	var user models.User
	err := collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)

	return user, err
}

func (repo *UserRepository) GetUserByID(ctx context.Context, ID string) (models.User, error) {
	collection := repo.database.Collection(repo.collection)

	var user models.User

	objectID, err := primitive.ObjectIDFromHex(ID)
	if err != nil {
		return user, err
	}

	err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)
	return user, err
}
