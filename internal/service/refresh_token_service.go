package service

import (
	"context"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/models"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/repository"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/tokenutil"
	"time"
)

type RefreshTokenService struct {
	UserRepository *repository.UserRepository
	ContextTimeout time.Duration
}

func NewRefreshTokenService(repo *repository.UserRepository, timeout time.Duration) *RefreshTokenService {
	return &RefreshTokenService{
		UserRepository: repo,
		ContextTimeout: timeout,
	}
}

func (rts *RefreshTokenService) ExtractIDFromToken(token string, secret string) (string, error) {
	return tokenutil.ExtractIDFromToken(token, secret)
}

func (rts *RefreshTokenService) GetUserByID(c context.Context, ID string) (models.User, error) {
	ctx, cancel := context.WithTimeout(c, rts.ContextTimeout)
	defer cancel()
	return rts.UserRepository.GetUserByID(ctx, ID)
}

func (rts *RefreshTokenService) CreateAccessToken(user models.User, secret string, expiry int) (string, error) {
	return tokenutil.CreateAccessToken(user, secret, expiry)
}

func (rts *RefreshTokenService) CreateRefreshToken(user models.User, secret string, expiry int) (string, error) {
	return tokenutil.CreateRefreshToken(user, secret, expiry)
}
