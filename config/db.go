package config

import (
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func DBConnect() {
	db_url := os.Getenv("DB_URL")
	dbConn, err := gorm.Open(postgres.Open(db_url), &gorm.Config{})
	if err != nil {
		panic("DB Connection Failed")
	}

	DB = dbConn
}
