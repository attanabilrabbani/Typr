package models

type Likes struct {
	PostID *uint `gorm:"not null"`
	UserID uint  `gorm:"not null"`
}
