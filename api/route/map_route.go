package route

import (
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/api/handler"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/bootstrap"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/models"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/repository"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/service"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"time"
)

func NewMapRouter(
	env *bootstrap.Env,
	timeout time.Duration,
	db *mongo.Database,
	publicGroup *gin.RouterGroup,
	privateGroup *gin.RouterGroup,
) {
	mapRepository := repository.NewMapRepository(db, models.MapCollection)
	mapHandler := &handler.MapHandler{
		Env:        env,
		MapService: service.NewMapService(mapRepository, timeout),
	}

	publicGroup.GET("/map", mapHandler.Fetch)
	privateGroup.POST("/map", mapHandler.Create)
}
