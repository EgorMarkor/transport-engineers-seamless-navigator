package domain

import "errors"

var (
	ErrMapAlreadyExist = errors.New("map already exists")
	ErrMapDoesntExist  = errors.New("map doesnt exist")
	ErrNotACreator     = errors.New("not a creator")
)
