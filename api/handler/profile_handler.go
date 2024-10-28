package handler

import (
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/service"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

type ProfileHandler struct {
	ProfileService *service.ProfileService
}

func (ph *ProfileHandler) Fetch(c *gin.Context) {
	userID := c.GetString("x-user-id")

	profile, err := ph.ProfileService.GetProfileByID(c, userID)
	if err != nil {
		log.Printf("Failed to get profile: %s\n", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get profile"})
		return
	}

	c.JSON(http.StatusOK, profile)
}
