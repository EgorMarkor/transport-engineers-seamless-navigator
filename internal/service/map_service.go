package service

import (
	"context"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/models"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/repository"
	"time"
)

type MapService struct {
	MapRepository  *repository.MapRepository
	ContextTimeout time.Duration
}

func NewMapService(repo *repository.MapRepository, timeout time.Duration) *MapService {
	return &MapService{
		MapRepository:  repo,
		ContextTimeout: timeout,
	}
}

func (ms *MapService) Create(c context.Context, newMap models.GeoJSON) error {
	ctx, cancel := context.WithTimeout(c, ms.ContextTimeout)
	defer cancel()
	return ms.MapRepository.Create(ctx, newMap)
}

func (ms *MapService) Get(c context.Context) (models.GeoJSON, error) {
	ctx, cancel := context.WithTimeout(c, ms.ContextTimeout)
	defer cancel()
	return ms.MapRepository.GetMap(ctx)
}
