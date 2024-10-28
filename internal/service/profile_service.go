package service

import (
	"context"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/domain"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/repository"
	"time"
)

type ProfileService struct {
	UserRepository *repository.UserRepository
	ContextTimeout time.Duration
}

func NewProfileService(repo *repository.UserRepository, timeout time.Duration) *ProfileService {
	return &ProfileService{
		UserRepository: repo,
		ContextTimeout: timeout,
	}
}

func (ps *ProfileService) GetProfileByID(c context.Context, ID string) (*domain.Profile, error) {
	ctx, cancel := context.WithTimeout(c, ps.ContextTimeout)
	defer cancel()

	user, err := ps.UserRepository.GetUserByID(ctx, ID)
	if err != nil {
		return nil, err
	}

	return &domain.Profile{Name: user.Username, Email: user.Email}, nil
}
