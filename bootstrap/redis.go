package bootstrap

import (
	"context"
	"fmt"
	"github.com/redis/go-redis/v9"
	"log"
)

func NewRedisClient(env *Env) *redis.Client {
	redisHost := env.RedisHost
	redisPort := env.RedisPort
	redisUser := env.RedisUser
	redisPass := env.RedisPass
	redisDB := env.RedisDB

	redisURI := fmt.Sprintf("redis://%s:%s@%s:%s/%s", redisUser, redisPass, redisHost, redisPort, redisDB)

	if redisUser == "" || redisPass == "" {
		redisURI = fmt.Sprintf("redis://%s:%s/%s", redisHost, redisPort, redisDB)
	}

	options, err := redis.ParseURL(redisURI)
	if err != nil {
		log.Fatal("Failed to parse redis URI")
	}

	client := redis.NewClient(options)

	_, err = client.Ping(context.Background()).Result()
	if err != nil {
		log.Fatal("Failed to ping redis client: ", err.Error())
	}

	log.Println("Redis is running on ", redisURI)

	return client
}

func CloseRedisClient(client *redis.Client) {
	err := client.Close()
	if err != nil {
		log.Fatal("Failed to close redis connection")
	}

	log.Println("Redis client closed successfully")
}
