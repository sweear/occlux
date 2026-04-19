package model

import "time"

type Secret struct {
	ID            string
	EncryptedData string
	MaxViews      int
	ViewCount     int
	ExpiresAt     time.Time
}
