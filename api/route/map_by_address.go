package route

import (
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/api/handler"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/bootstrap"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/models"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/repository"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
	"time"
)

func NewMapByAddressRouter(
	env *bootstrap.Env,
	timeout time.Duration,
	db *mongo.Database,
	redis *redis.Client,
	group *gin.RouterGroup,
) {
	mapRepository := repository.NewMapRepository(db, redis, env.CacheExpiryMinutes, models.MapCollection)
	mapByAddressHandler := &handler.MapByAddressHandler{
		Env:        env,
		MapService: service.NewMapService(mapRepository, timeout),
	}

	group.GET("/map/address/:address", mapByAddressHandler.Fetch)
}
