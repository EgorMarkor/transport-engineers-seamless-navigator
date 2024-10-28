package handler

import (
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/bootstrap"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/models"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/service"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"log"
	"net/http"
)

type MapHandler struct {
	MapService *service.MapService
	Env        *bootstrap.Env
}

func (mh *MapHandler) Fetch(c *gin.Context) {
	result, err := mh.MapService.Get(c)
	if err != nil {
		log.Printf("Failet to get map: %s\n", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to get map"})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (mh *MapHandler) Create(c *gin.Context) {
	var newMap models.GeoJSON

	err := c.ShouldBind(&newMap)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	newMap.ID = primitive.NewObjectID()

	err = mh.MapService.Create(c, newMap)
	if err != nil {
		log.Printf("Failed to create map: %s\n", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create map"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "New map created successfully"})
}
