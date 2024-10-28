package handler

import (
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/bootstrap"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/domain"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/service"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

type RefreshTokenHandler struct {
	RefreshTokenService *service.RefreshTokenService
	Env                 *bootstrap.Env
}

func (rth *RefreshTokenHandler) RefreshToken(c *gin.Context) {
	var request domain.RefreshTokenRequest

	err := c.ShouldBind(&request)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ID, err := rth.RefreshTokenService.ExtractIDFromToken(request.RefreshToken, rth.Env.RefreshTokenSecret)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	user, err := rth.RefreshTokenService.GetUserByID(c, ID)
	if err != nil {
		log.Printf("Failed to get user by id: %s\n", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user by id"})
		return
	}

	accessToken, err := rth.RefreshTokenService.CreateAccessToken(user, rth.Env.AccessTokenSecret, rth.Env.AccessTokenExpiryHour)
	if err != nil {
		log.Printf("Failed to create access token: %s\n", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create access token"})
		return
	}

	refreshToken, err := rth.RefreshTokenService.CreateRefreshToken(user, rth.Env.RefreshTokenSecret, rth.Env.RefreshTokenExpiryHour)
	if err != nil {
		log.Printf("Failed to create refresh token: %s\n", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create refresh token"})
		return
	}

	refreshTokenResponse := domain.RefreshTokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	c.JSON(http.StatusOK, refreshTokenResponse)
}
