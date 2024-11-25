package controllers

import (
	"net/http"
	"strconv"

	"github.com/attanabilrabbani/go-typr/config"
	"github.com/attanabilrabbani/go-typr/models"
	"github.com/gin-gonic/gin"
)

func AddFollow(c *gin.Context) {
	var follow models.Following
	followedId, _ := strconv.Atoi(c.Param("followedid"))

	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	authenticatedUser := user.(models.User)

	follow.FollowerID = uint(authenticatedUser.ID)
	follow.FollowedID = uint(followedId)

	err := config.DB.Create(&follow).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to follow",
		})
		return
	}

	c.JSON(http.StatusOK, follow)

}

func Unfollow(c *gin.Context) {
	var followRecord models.Following
	followedId, _ := strconv.Atoi(c.Param("followedid"))

	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	authenticatedUser := user.(models.User)
	followerId := uint(authenticatedUser.ID)

	err := config.DB.Where("follower_id = ? AND followed_id = ?", followerId, followedId).Delete(&followRecord).Error

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "No follow relationship exists",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "unfollow success",
	})

}
