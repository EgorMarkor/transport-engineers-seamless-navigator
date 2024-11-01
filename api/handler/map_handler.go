package handler

import (
	"errors"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/bootstrap"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/domain"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/models"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/service"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"log"
	"net/http"
)

type MapHandler struct {
	MapService *service.MapService
	Env        *bootstrap.Env
}

func (mh *MapHandler) Create(c *gin.Context) {
	var newMap models.GeoJSON

	err := c.ShouldBind(&newMap)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	newMap.ID = primitive.NewObjectID()
	newMap.Properties.CreatorID = c.GetString("x-user-id")

	err = mh.MapService.Create(c, newMap)
	if err != nil {
		if errors.Is(err, domain.ErrMapAlreadyExist) {
			c.JSON(http.StatusConflict, gin.H{"message": "Map with this bluetooth id already exists"})
			return
		}

		log.Printf("Failed to create map: %s\n", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create map"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "New map created successfully"})
}

func (mh *MapHandler) Fetch(c *gin.Context) {
	bluetoothID := c.Param("bluetoothID")

	result, err := mh.MapService.GetMapByBluetoothID(c, bluetoothID)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			c.JSON(http.StatusNotFound, gin.H{"message": "Map doesn't exist"})
			return
		}

		log.Printf("Failed to get map: %s\n", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to get map"})
		return
	}

	c.JSON(http.StatusOK, result)
}
