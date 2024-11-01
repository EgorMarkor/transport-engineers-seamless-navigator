package main

import (
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/api/middleware"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/api/route"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/bootstrap"
	"github.com/gin-gonic/gin"
	"log"
	"time"
)

func main() {
	app := bootstrap.App()

	env := app.Env

	db := app.Mongo.Database(env.DBName)
	defer app.CloseDBConnection()

	redis := app.Redis
	defer app.CloseRedisClient()

	timeout := time.Duration(env.ContextTimeout) * time.Second

	ginInstance := gin.Default()
	ginInstance.Use(middleware.CORSMiddleware())

	route.Setup(env, timeout, db, redis, ginInstance)

	err := ginInstance.Run(env.ServerAddress)
	if err != nil {
		log.Fatal("Failed to run the server: ", err)
	}
}
