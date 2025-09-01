package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"time"
	"tabletennis-backend/database"
	"tabletennis-backend/models"
	"tabletennis-backend/services"

	"github.com/gin-gonic/gin"
)

type SubmitMatchRequest struct {
	OpponentLogin string                `json:"opponent_login" binding:"required"`
	Sport         models.SportType      `json:"sport" binding:"required"`
	Score         string                `json:"score" binding:"required"`
	IWon          bool                  `json:"i_won" binding:"required"`
}

type ConfirmMatchRequest struct {
	Confirmed bool `json:"confirmed" binding:"required"`
}

func SubmitMatch(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	currentPlayer, err := services.ValidateTokenAndGetUser(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	var req SubmitMatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var opponent models.Player
	if err := database.DB.Where("login = ?", req.OpponentLogin).First(&opponent).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Opponent not found"})
		return
	}

	if opponent.ID == currentPlayer.ID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot play against yourself"})
		return
	}

	var winnerID uint
	if req.IWon {
		winnerID = currentPlayer.ID
	} else {
		winnerID = opponent.ID
	}

	match := models.Match{
		Player1ID:        currentPlayer.ID,
		Player2ID:        opponent.ID,
		WinnerID:         winnerID,
		Sport:            req.Sport,
		Score:            req.Score,
		Status:           models.MatchPending,
		Player1ELOBefore: currentPlayer.GetELO(req.Sport),
		Player2ELOBefore: opponent.GetELO(req.Sport),
		SubmittedAt:      time.Now(),
	}

	if err := database.DB.Create(&match).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create match"})
		return
	}

	database.DB.Preload("Player1").Preload("Player2").Preload("Winner").First(&match)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Match submitted successfully",
		"match":   match,
	})
}

func ConfirmMatch(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	currentPlayer, err := services.ValidateTokenAndGetUser(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	matchIDStr := c.Param("id")
	matchID, err := strconv.ParseUint(matchIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid match ID"})
		return
	}

	var match models.Match
	if err := database.DB.Preload("Player1").Preload("Player2").Preload("Winner").First(&match, matchID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
		return
	}

	if match.Player1ID != currentPlayer.ID && match.Player2ID != currentPlayer.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not part of this match"})
		return
	}

	if match.Status != models.MatchPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Match already processed"})
		return
	}

	var req ConfirmMatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	
	if req.Confirmed {
		match.Status = models.MatchConfirmed
		match.ConfirmedAt = &now

		var winner, loser models.Player
		if match.WinnerID == match.Player1ID {
			winner = match.Player1
			loser = match.Player2
		} else {
			winner = match.Player2
			loser = match.Player1
		}

		newWinnerELO, newLoserELO := services.CalculateELO(winner.GetELO(match.Sport), loser.GetELO(match.Sport))

		winner.SetELO(match.Sport, newWinnerELO)
		loser.SetELO(match.Sport, newLoserELO)

		if match.WinnerID == match.Player1ID {
			match.Player1ELOAfter = newWinnerELO
			match.Player2ELOAfter = newLoserELO
		} else {
			match.Player1ELOAfter = newLoserELO
			match.Player2ELOAfter = newWinnerELO
		}

		database.DB.Save(&winner)
		database.DB.Save(&loser)
	} else {
		match.Status = models.MatchDenied
	}

	database.DB.Save(&match)

	c.JSON(http.StatusOK, gin.H{
		"message": "Match updated successfully",
		"match":   match,
	})
}

func GetPendingMatches(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	currentPlayer, err := services.ValidateTokenAndGetUser(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	var matches []models.Match
	database.DB.Where("(player1_id = ? OR player2_id = ?) AND status = ?", 
		currentPlayer.ID, currentPlayer.ID, models.MatchPending).
		Preload("Player1").Preload("Player2").Preload("Winner").
		Order("created_at DESC").Find(&matches)

	c.JSON(http.StatusOK, gin.H{"matches": matches})
}

func GetMatchHistory(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	currentPlayer, err := services.ValidateTokenAndGetUser(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	var matches []models.Match
	database.DB.Where("(player1_id = ? OR player2_id = ?) AND status IN ?", 
		currentPlayer.ID, currentPlayer.ID, []models.MatchStatus{models.MatchConfirmed, models.MatchDenied}).
		Preload("Player1").Preload("Player2").Preload("Winner").
		Order("created_at DESC").Find(&matches)

	c.JSON(http.StatusOK, gin.H{"matches": matches})
}