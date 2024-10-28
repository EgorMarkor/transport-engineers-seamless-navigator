package handler

import (
	"errors"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/bootstrap"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/domain"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/service"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

type SignupHandler struct {
	SignupService *service.SignupService
	Env           *bootstrap.Env
}

func (sh *SignupHandler) Signup(c *gin.Context) {
	var request domain.SignupRequest

	err := c.ShouldBind(&request)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := sh.SignupService.Create(c, request)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrEmailAlreadyExists):
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})

		case errors.Is(err, domain.ErrInvalidEmailFormat),
			errors.Is(err, domain.ErrInvalidUsernameFormat):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		default:
			log.Printf("Failed to create user: %s\n", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		}

		return
	}

	accessToken, err := sh.SignupService.CreateAccessToken(*user, sh.Env.AccessTokenSecret, sh.Env.AccessTokenExpiryHour)
	if err != nil {
		log.Printf("Failed to create access token: %s\n", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create access token"})
		return
	}

	refreshToken, err := sh.SignupService.CreateRefreshToken(*user, sh.Env.RefreshTokenSecret, sh.Env.RefreshTokenExpiryHour)
	if err != nil {
		log.Printf("Failed to create refresh token: %s\n", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create refresh token"})
		return
	}

	response := domain.SignupResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	c.JSON(http.StatusOK, response)
}
