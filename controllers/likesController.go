package controllers

import (
	"net/http"
	"strconv"

	"github.com/attanabilrabbani/go-typr/config"
	"github.com/attanabilrabbani/go-typr/models"
	"github.com/gin-gonic/gin"
)

func AddLikes(c *gin.Context) {
	var likes models.Likes
	var parentPost models.Posts
	postId, _ := strconv.Atoi(c.Param("postid"))

	err := c.Bind(&likes)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid",
		})
		return
	}

	err = config.DB.First(&parentPost, postId).Error

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "parent post not found",
		})
		return
	}

	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	authenticatedUser := user.(models.User)
	parentId := uint(postId)

	likes.PostID = &parentId
	likes.UserID = authenticatedUser.ID

	err = config.DB.Create(&likes).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Invalid2",
		})
		return
	}

	c.JSON(http.StatusOK, likes)

}

func RemoveLikes(c *gin.Context) {
	var likes models.Likes
	postId, _ := strconv.Atoi(c.Param("postid"))

	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	authenticatedUser := user.(models.User)
	userId := uint(authenticatedUser.ID)

	err := config.DB.Where("post_id = ? AND user_id = ?", postId, userId).Delete(&likes).Error

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "No like relationship exists",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "like removed.",
	})
}
