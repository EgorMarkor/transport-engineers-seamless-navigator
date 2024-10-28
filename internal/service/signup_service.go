package service

import (
	"context"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/domain"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/models"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/repository"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/tokenutil"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
	"net/mail"
	"time"
)

type SignupService struct {
	UserRepository *repository.UserRepository
	ContextTimeout time.Duration
}

func NewSignupService(repo *repository.UserRepository, timeout time.Duration) *SignupService {
	return &SignupService{
		UserRepository: repo,
		ContextTimeout: timeout,
	}
}

func (ss *SignupService) Create(c context.Context, userData domain.SignupRequest) (*models.User, error) {
	ctx, cancel := context.WithTimeout(c, ss.ContextTimeout)
	defer cancel()

	_, err := ss.UserRepository.GetUserByEmail(ctx, userData.Email)
	if err == nil {
		return nil, domain.ErrEmailAlreadyExists
	}

	_, err = mail.ParseAddress(userData.Email)
	if err != nil {
		return nil, domain.ErrInvalidEmailFormat
	}

	if len(userData.Name) < 3 || len(userData.Name) > 16 {
		return nil, domain.ErrInvalidUsernameFormat
	}

	encryptedPassword, err := bcrypt.GenerateFromPassword([]byte(userData.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	userData.Password = string(encryptedPassword)

	user := models.User{
		ID:           primitive.NewObjectID(),
		Username:     userData.Name,
		Email:        userData.Email,
		Password:     userData.Password,
		CreationTime: time.Now(),
	}

	err = ss.UserRepository.Create(ctx, user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (ss *SignupService) CreateAccessToken(user models.User, secret string, expiry int) (string, error) {
	return tokenutil.CreateAccessToken(user, secret, expiry)
}

func (ss *SignupService) CreateRefreshToken(user models.User, secret string, expiry int) (string, error) {
	return tokenutil.CreateRefreshToken(user, secret, expiry)
}
