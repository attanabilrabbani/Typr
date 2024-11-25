package controllers

import (
	"net/http"

	"github.com/attanabilrabbani/go-typr/config"
	"github.com/attanabilrabbani/go-typr/models"
	"github.com/gin-gonic/gin"
)

func CreatePost(c *gin.Context) {
	var postBody models.Posts

	err := c.Bind(&postBody)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
		})
		return
	}

	if postBody.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Content required",
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

	postBody.UserID = authenticatedUser.ID

	err = config.DB.Create(&postBody).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create post",
		})
		return
	}

	c.JSON(http.StatusOK, postBody)

}

func GetPosts(c *gin.Context) {
	var posts []models.Posts
	err := config.DB.Preload("Children.Children").Preload("User").Preload("Likes").Where("parent_id IS NULL").Find(&posts).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Unable to receive posts at the time.",
		})
		return
	}

	c.JSON(http.StatusOK, posts)
}

func GetPostsById(c *gin.Context) {
	postId := c.Param("id")

	var postBody models.Posts
	err := config.DB.Preload("Children").Preload("User").Preload("Likes").First(&postBody, postId).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Post Unavailable",
		})
		return
	}

	c.JSON(http.StatusOK, postBody)

}

func DeletePosts(c *gin.Context) {
	var posts models.Posts
	postId := c.Param("id")

	_, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	err := config.DB.Where("ID=?", postId).Delete(&posts).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Deletion Failed",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "post deleted.",
	})
}
