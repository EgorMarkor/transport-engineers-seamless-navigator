package tokenutil

import (
	"fmt"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/domain"
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/models"
	"github.com/golang-jwt/jwt/v4"
	"time"
)

func CreateAccessToken(user models.User, secret string, expiry int) (string, error) {
	exp := jwt.NewNumericDate(time.Now().Add(time.Hour * time.Duration(expiry)))
	accessClaims := &domain.JwtCustomClaims{
		Name: user.Username,
		ID:   user.ID.Hex(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: exp,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	t, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}

	return t, nil
}

func CreateRefreshToken(user models.User, secret string, expiry int) (string, error) {
	exp := jwt.NewNumericDate(time.Now().Add(time.Hour * time.Duration(expiry)))
	refreshClaims := &domain.JwtCustomRefreshClaims{
		ID: user.ID.Hex(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: exp,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	t, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}

	return t, nil
}

func IsAuthorized(authToken string, secret string) (bool, error) {
	_, err := jwt.Parse(authToken, func(token *jwt.Token) (interface{}, error) {
		_, ok := token.Method.(*jwt.SigningMethodHMAC)
		if !ok {
			return nil, fmt.Errorf("unexpected signing method: %s", token.Header["alg"])
		}

		return []byte(secret), nil
	})

	if err != nil {
		return false, err
	}

	return true, nil
}

func ExtractIDFromToken(authToken string, secret string) (string, error) {
	token, err := jwt.Parse(authToken, func(token *jwt.Token) (interface{}, error) {
		_, ok := token.Method.(*jwt.SigningMethodHMAC)
		if !ok {
			return nil, fmt.Errorf("unexpected signing method: %s", token.Header["alg"])
		}

		return []byte(secret), nil
	})

	if err != nil {
		return "", nil
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok && !token.Valid {
		return "", fmt.Errorf("invalid token")
	}

	return claims["id"].(string), nil
}
