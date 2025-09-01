package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"tabletennis-backend/database"
	"tabletennis-backend/models"
)

type IntraUser struct {
	ID        int    `json:"id"`
	Login     string `json:"login"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Image     struct {
		Link string `json:"link"`
	} `json:"image"`
	Campus []struct {
		Name string `json:"name"`
	} `json:"campus"`
}

func ValidateTokenAndGetUser(token string) (*models.Player, error) {
	client := &http.Client{}
	req, err := http.NewRequest("GET", "https://api.intra.42.fr/v2/me", nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Add("Authorization", "Bearer "+token)
	
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid token")
	}
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	
	var intraUser IntraUser
	err = json.Unmarshal(body, &intraUser)
	if err != nil {
		return nil, err
	}
	
	campus := ""
	if len(intraUser.Campus) > 0 {
		campus = intraUser.Campus[0].Name
	}
	
	if !strings.Contains(strings.ToLower(campus), "heilbronn") {
		return nil, fmt.Errorf("only 42 Heilbronn students are allowed")
	}
	
	var player models.Player
	result := database.DB.Where("intra_id = ?", intraUser.ID).First(&player)
	
	if result.Error != nil {
		player = models.Player{
			IntraID:           intraUser.ID,
			Login:             intraUser.Login,
			FirstName:         intraUser.FirstName,
			LastName:          intraUser.LastName,
			Email:             intraUser.Email,
			ImageURL:          intraUser.Image.Link,
			Campus:            campus,
			TableSoccerELO:    1200,
			TableFootballELO:  1200,
		}
		
		if err := database.DB.Create(&player).Error; err != nil {
			return nil, err
		}
	}
	
	return &player, nil
}