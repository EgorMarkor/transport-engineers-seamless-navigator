package service

import (
	"context"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/domain"
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

	for _, feature := range newMap.Features {
		if feature.Properties["bluetoothID"] != nil {
			bluetoothID, ok := feature.Properties["bluetoothID"].(string)
			if ok {
				_, err := ms.MapRepository.GetMapByBluetoothID(ctx, bluetoothID)
				if err == nil {
					return domain.ErrMapAlreadyExist
				}
			}
		}
	}

	return ms.MapRepository.Create(ctx, newMap)
}

func (ms *MapService) GetMapByBluetoothID(c context.Context, ID string) (models.GeoJSON, error) {
	ctx, cancel := context.WithTimeout(c, ms.ContextTimeout)
	defer cancel()
	return ms.MapRepository.GetMapByBluetoothID(ctx, ID)
}
