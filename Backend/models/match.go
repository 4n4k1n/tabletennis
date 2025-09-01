package models

import (
	"time"
)

type SportType string

const (
	TableSoccer   SportType = "table_soccer"
	TableFootball SportType = "table_football"
)

type MatchStatus string

const (
	MatchPending   MatchStatus = "pending"
	MatchConfirmed MatchStatus = "confirmed"
	MatchDenied    MatchStatus = "denied"
)

type Match struct {
	ID              uint        `json:"id" gorm:"primaryKey"`
	Player1ID       uint        `json:"player1_id" gorm:"not null"`
	Player2ID       uint        `json:"player2_id" gorm:"not null"`
	Player1         Player      `json:"player1" gorm:"foreignKey:Player1ID"`
	Player2         Player      `json:"player2" gorm:"foreignKey:Player2ID"`
	WinnerID        uint        `json:"winner_id" gorm:"not null"`
	Winner          Player      `json:"winner" gorm:"foreignKey:WinnerID"`
	Sport           SportType   `json:"sport" gorm:"not null"`
	Score           string      `json:"score"`
	Status          MatchStatus `json:"status" gorm:"default:pending"`
	Player1ELOBefore int        `json:"player1_elo_before"`
	Player2ELOBefore int        `json:"player2_elo_before"`
	Player1ELOAfter  int        `json:"player1_elo_after"`
	Player2ELOAfter  int        `json:"player2_elo_after"`
	SubmittedAt      time.Time   `json:"submitted_at"`
	ConfirmedAt      *time.Time  `json:"confirmed_at"`
	CreatedAt        time.Time   `json:"created_at"`
	UpdatedAt        time.Time   `json:"updated_at"`
}