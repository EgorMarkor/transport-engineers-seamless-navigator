package handler

import (
	"errors"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/bootstrap"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/service"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"log"
	"net/http"
)

type MapByAddressHandler struct {
	MapService *service.MapService
	Env        *bootstrap.Env
}

func (mh *MapByAddressHandler) Fetch(c *gin.Context) {
	address := c.Param("address")

	result, err := mh.MapService.GetMapByAddress(c, address)
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
