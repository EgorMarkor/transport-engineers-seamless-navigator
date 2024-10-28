package route

import (
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/api/middleware"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/bootstrap"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"time"
)

func Setup(env *bootstrap.Env, timeout time.Duration, db *mongo.Database, gin *gin.Engine) {
	publicGroup := gin.Group("")

	NewSignupRouter(env, timeout, db, publicGroup)
	NewLoginRouter(env, timeout, db, publicGroup)
	NewRefreshTokenRouter(env, timeout, db, publicGroup)

	privateGroup := gin.Group("")
	privateGroup.Use(middleware.JwtAuthMiddleware(env.AccessTokenSecret))

	NewMapRouter(env, timeout, db, publicGroup, privateGroup)
	NewProfileRouter(env, timeout, db, privateGroup)
}
