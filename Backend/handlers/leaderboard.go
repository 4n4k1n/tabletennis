package handlers

import (
	"net/http"
	"tabletennis-backend/database"
	"tabletennis-backend/models"

	"github.com/gin-gonic/gin"
)

type LeaderboardEntry struct {
	Player    models.Player `json:"player"`
	ELO       int           `json:"elo"`
	Wins      int           `json:"wins"`
	Losses    int           `json:"losses"`
	WinRate   float64       `json:"win_rate"`
	Rank      int           `json:"rank"`
}

func GetLeaderboard(c *gin.Context) {
	sport := c.Query("sport")
	if sport == "" {
		sport = string(models.TableSoccer)
	}

	sportType := models.SportType(sport)
	if sportType != models.TableSoccer && sportType != models.TableFootball {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid sport type"})
		return
	}

	var players []models.Player
	orderField := "table_soccer_elo"
	if sportType == models.TableFootball {
		orderField = "table_football_elo"
	}

	database.DB.Order(orderField + " DESC").Find(&players)

	var leaderboard []LeaderboardEntry
	for i, player := range players {
		var wins int64
		var losses int64

		database.DB.Model(&models.Match{}).Where(
			"winner_id = ? AND sport = ? AND status = ?",
			player.ID, sportType, models.MatchConfirmed,
		).Count(&wins)

		database.DB.Model(&models.Match{}).Where(
			"(player1_id = ? OR player2_id = ?) AND winner_id != ? AND sport = ? AND status = ?",
			player.ID, player.ID, player.ID, sportType, models.MatchConfirmed,
		).Count(&losses)

		totalMatches := wins + losses
		winRate := 0.0
		if totalMatches > 0 {
			winRate = float64(wins) / float64(totalMatches) * 100
		}

		entry := LeaderboardEntry{
			Player:  player,
			ELO:     player.GetELO(sportType),
			Wins:    int(wins),
			Losses:  int(losses),
			WinRate: winRate,
			Rank:    i + 1,
		}

		leaderboard = append(leaderboard, entry)
	}

	c.JSON(http.StatusOK, gin.H{
		"sport":       sport,
		"leaderboard": leaderboard,
	})
}

func GetPlayerStats(c *gin.Context) {
	login := c.Param("login")
	if login == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Login parameter required"})
		return
	}

	var player models.Player
	if err := database.DB.Where("login = ?", login).First(&player).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
		return
	}

	stats := make(map[string]interface{})

	for _, sport := range []models.SportType{models.TableSoccer, models.TableFootball} {
		var wins int64
		var losses int64
		var totalMatches int64

		database.DB.Model(&models.Match{}).Where(
			"winner_id = ? AND sport = ? AND status = ?",
			player.ID, sport, models.MatchConfirmed,
		).Count(&wins)

		database.DB.Model(&models.Match{}).Where(
			"(player1_id = ? OR player2_id = ?) AND winner_id != ? AND sport = ? AND status = ?",
			player.ID, player.ID, player.ID, sport, models.MatchConfirmed,
		).Count(&losses)

		database.DB.Model(&models.Match{}).Where(
			"(player1_id = ? OR player2_id = ?) AND sport = ? AND status = ?",
			player.ID, player.ID, sport, models.MatchConfirmed,
		).Count(&totalMatches)

		winRate := 0.0
		if totalMatches > 0 {
			winRate = float64(wins) / float64(totalMatches) * 100
		}

		stats[string(sport)] = map[string]interface{}{
			"elo":           player.GetELO(sport),
			"wins":          wins,
			"losses":        losses,
			"total_matches": totalMatches,
			"win_rate":      winRate,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"player": player,
		"stats":  stats,
	})
}