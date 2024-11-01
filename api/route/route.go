package route

import (
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/api/middleware"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/bootstrap"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
	"time"
)

func Setup(env *bootstrap.Env, timeout time.Duration, db *mongo.Database, redis *redis.Client, gin *gin.Engine) {
	publicGroup := gin.Group("")

	NewSignupRouter(env, timeout, db, publicGroup)
	NewLoginRouter(env, timeout, db, publicGroup)
	NewRefreshTokenRouter(env, timeout, db, publicGroup)

	privateGroup := gin.Group("")
	privateGroup.Use(middleware.JwtAuthMiddleware(env.AccessTokenSecret))

	NewMapRouter(env, timeout, db, redis, publicGroup, privateGroup)
	NewProfileRouter(env, timeout, db, privateGroup)
}
