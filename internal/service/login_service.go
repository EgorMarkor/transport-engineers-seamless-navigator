package service

import (
	"context"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/domain"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/models"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/repository"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/tokenutil"
	"golang.org/x/crypto/bcrypt"
	"time"
)

type LoginService struct {
	UserRepository *repository.UserRepository
	ContextTimeout time.Duration
}

func NewLoginService(repo *repository.UserRepository, timeout time.Duration) *LoginService {
	return &LoginService{
		UserRepository: repo,
		ContextTimeout: timeout,
	}
}

func (ls *LoginService) GetUserByEmail(c context.Context, email string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(c, ls.ContextTimeout)
	defer cancel()
	user, err := ls.UserRepository.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (ls *LoginService) CompareCredentials(user *models.User, request domain.LoginRequest) bool {
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password))
	return err == nil
}

func (ls *LoginService) CreateAccessToken(user models.User, secret string, expiry int) (string, error) {
	return tokenutil.CreateAccessToken(user, secret, expiry)
}

func (ls *LoginService) CreateRefreshToken(user models.User, secret string, expiry int) (string, error) {
	return tokenutil.CreateRefreshToken(user, secret, expiry)
}
