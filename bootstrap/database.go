package bootstrap

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
	"time"
)

func NewMongoDatabase(env *Env) *mongo.Client {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(env.DBConnectionTimeout)*time.Second)
	defer cancel()

	dbHost := env.DBHost
	dbPort := env.DBPort
	dbUser := env.DBUser
	dbPass := env.DBPass

	mongodbURI := fmt.Sprintf("mongodb://%s:%s@%s:%s", dbUser, dbPass, dbHost, dbPort)

	if dbUser == "" || dbPass == "" {
		mongodbURI = fmt.Sprintf("mongodb://%s:%s", dbHost, dbPort)
	}

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongodbURI))
	if err != nil {
		log.Fatal("Failed to connect to db: ", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to ping db: ", err)
	}

	log.Println("DB is running on ", mongodbURI)

	return client
}

func CloseMongoDBConnection(client mongo.Client) {
	err := client.Disconnect(context.TODO())
	if err != nil {
		log.Fatal("Failed to disconnect from db: ", err)
	}

	log.Println("Connection to db closed successfully")
}
