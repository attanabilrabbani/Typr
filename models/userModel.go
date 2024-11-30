package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username   string `gorm:"unique;not null"`
	Email      string `gorm:"unique;not null"`
	Name       string
	Password   string      `gorm:"not null"`
	ProfilePic string      `gorm:"default:'defaultpfp.png';type:varchar(255)"`
	Role       string      `gorm:"default:'user';not null"`
	Posts      []Posts     `gorm:"foreignKey:UserID"`
	Likes      []Likes     `gorm:"foreignKey:UserID"`
	Followers  []Following `gorm:"foreignKey:FollowedID"`
	Following  []Following `gorm:"foreignKey:FollowerID"`
}
