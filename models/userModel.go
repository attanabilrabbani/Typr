package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username   string      `gorm:"unique;not null" form:"username"`
	Email      string      `gorm:"unique;not null" form:"email"`
	Name       string      `form:"name"`
	Bio        string      `form:"bio"`
	Password   string      `gorm:"not null" form:"password"`
	ProfilePic string      `gorm:"default:'defaultpfp.png';type:varchar(255)"`
	Role       string      `gorm:"default:'user';not null"`
	Posts      []Posts     `gorm:"foreignKey:UserID"`
	Likes      []Likes     `gorm:"foreignKey:UserID"`
	Followers  []Following `gorm:"foreignKey:FollowedID"`
	Following  []Following `gorm:"foreignKey:FollowerID"`
}
