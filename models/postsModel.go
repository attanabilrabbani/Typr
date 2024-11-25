package models

import (
	"gorm.io/gorm"
)

type Posts struct {
	gorm.Model
	Content  string `gorm:"not null"`
	Image    string
	ParentID *uint `json:"parent_id"`
	UserID   uint  `gorm:"not null"`

	User     User    `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;not null"`
	Likes    []Likes `gorm:"foreignKey:PostID"`
	Children []Posts `gorm:"foreignKey:ParentID"`
}
