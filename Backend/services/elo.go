package services

import "math"

const (
	K_FACTOR = 32
	BASE_ELO = 1200
)

func CalculateELO(winnerELO, loserELO int) (newWinnerELO, newLoserELO int) {
	expectedWinner := 1.0 / (1.0 + math.Pow(10, float64(loserELO-winnerELO)/400.0))
	expectedLoser := 1.0 / (1.0 + math.Pow(10, float64(winnerELO-loserELO)/400.0))
	
	newWinnerELO = winnerELO + int(K_FACTOR*(1.0-expectedWinner))
	newLoserELO = loserELO + int(K_FACTOR*(0.0-expectedLoser))
	
	if newWinnerELO < 0 {
		newWinnerELO = 0
	}
	if newLoserELO < 0 {
		newLoserELO = 0
	}
	
	return newWinnerELO, newLoserELO
}