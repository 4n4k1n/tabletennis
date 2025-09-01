package models

import (
	"time"
)

type Player struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	IntraID        int       `json:"intra_id" gorm:"uniqueIndex;not null"`
	Login          string    `json:"login" gorm:"uniqueIndex;not null"`
	FirstName      string    `json:"first_name"`
	LastName       string    `json:"last_name"`
	Email          string    `json:"email"`
	ImageURL       string    `json:"image_url"`
	Campus         string    `json:"campus"`
	TableSoccerELO int       `json:"table_soccer_elo" gorm:"default:1200"`
	TableFootballELO int     `json:"table_football_elo" gorm:"default:1200"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (p *Player) GetELO(sport SportType) int {
	if sport == TableSoccer {
		return p.TableSoccerELO
	}
	return p.TableFootballELO
}

func (p *Player) SetELO(sport SportType, elo int) {
	if sport == TableSoccer {
		p.TableSoccerELO = elo
	} else {
		p.TableFootballELO = elo
	}
}