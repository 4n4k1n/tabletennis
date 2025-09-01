package handlers

import (
	"net/http"
	"strings"
	"tabletennis-backend/database"
	"tabletennis-backend/models"
	"tabletennis-backend/services"

	"github.com/gin-gonic/gin"
)

func GetProfile(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	player, err := services.ValidateTokenAndGetUser(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"player": player})
}

func SearchPlayers(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query required"})
		return
	}

	var players []models.Player
	database.DB.Where("login LIKE ? OR first_name LIKE ? OR last_name LIKE ?", 
		"%"+query+"%", "%"+query+"%", "%"+query+"%").
		Limit(10).Find(&players)

	c.JSON(http.StatusOK, gin.H{"players": players})
}