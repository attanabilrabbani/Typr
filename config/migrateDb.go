package config

import "github.com/attanabilrabbani/go-typr/models"

func MigrateDB() {
	DB.AutoMigrate(&models.User{}, &models.Posts{}, &models.Likes{}, &models.Following{})
}
