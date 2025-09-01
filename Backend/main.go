package main

import (
	"log"
	"tabletennis-backend/database"
	"tabletennis-backend/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDatabase()

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"http://localhost:3000",
		"https://tabletennis.42heilbronn.de",
		"http://157.180.121.251",
	}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	
	r.Use(cors.New(config))

	api := r.Group("/api")
	{
		api.GET("/profile", handlers.GetProfile)
		api.GET("/players/search", handlers.SearchPlayers)
		api.GET("/players/:login/stats", handlers.GetPlayerStats)
		
		api.POST("/matches/submit", handlers.SubmitMatch)
		api.PUT("/matches/:id/confirm", handlers.ConfirmMatch)
		api.GET("/matches/pending", handlers.GetPendingMatches)
		api.GET("/matches/history", handlers.GetMatchHistory)
		
		api.GET("/leaderboard", handlers.GetLeaderboard)
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy"})
	})

	log.Println("Server starting on :8081...")
	r.Run(":8081")
}