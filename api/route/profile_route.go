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

func NewProfileRouter(env *bootstrap.Env, timeout time.Duration, db *mongo.Database, group *gin.RouterGroup) {
	userRepository := repository.NewUserRepository(db, models.UserCollection)
	profileHandler := &handler.ProfileHandler{
		ProfileService: service.NewProfileService(userRepository, timeout),
	}

	group.GET("/profile", profileHandler.Fetch)
}
