package models

//say User A follows User B, followerID = id userA followedID = id UserB
type Following struct {
	FollowerID uint `gorm:"not null;index"`
	FollowedID uint `gorm:"not null;index"`
}
