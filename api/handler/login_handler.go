package handler

import (
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/bootstrap"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/domain"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/service"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

type LoginHandler struct {
	LoginService *service.LoginService
	Env          *bootstrap.Env
}

func (lh *LoginHandler) Login(c *gin.Context) {
	var request domain.LoginRequest

	err := c.ShouldBind(&request)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := lh.LoginService.GetUserByEmail(c, request.Email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found with the given email"})
		return
	}

	if !lh.LoginService.CompareCredentials(user, request) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	accessToken, err := lh.LoginService.CreateAccessToken(*user, lh.Env.AccessTokenSecret, lh.Env.AccessTokenExpiryHour)
	if err != nil {
		log.Printf("Failed to create access token: %s\n", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create access token"})
		return
	}

	refreshToken, err := lh.LoginService.CreateRefreshToken(*user, lh.Env.RefreshTokenSecret, lh.Env.RefreshTokenExpiryHour)
	if err != nil {
		log.Printf("Failed to create refresh token: %s\n", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create refresh token"})
		return
	}

	response := domain.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	c.JSON(http.StatusOK, response)
}
