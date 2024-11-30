package controllers

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/attanabilrabbani/go-typr/config"
	"github.com/attanabilrabbani/go-typr/models"
	"github.com/gin-gonic/gin"
)

func CreatePost(c *gin.Context) {
	var postBody models.Posts

	err := c.ShouldBind(&postBody)

	fmt.Println(postBody.Content)

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

	image, err := c.FormFile("image")
	imageName := strings.ReplaceAll(image.Filename, " ", "_")
	if err == nil {
		imageFolder := fmt.Sprintf("./assets/posts/%d", postBody.ID)
		err := os.MkdirAll(imageFolder, os.ModePerm)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create folder for post"})
			return
		}

		imgPath := fmt.Sprintf("%s/%s", imageFolder, imageName)
		err = c.SaveUploadedFile(image, imgPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to upload image"})
			return
		}

		postBody.Image = imageName
		config.DB.Save(&postBody)
	}

	c.JSON(http.StatusOK, postBody)

}

func GetPosts(c *gin.Context) {
	var posts []models.Posts
	err := config.DB.Preload("Children.Children").
		Preload("User").
		Preload("Likes").
		Where("parent_id IS NULL").
		Order("created_at DESC").
		Find(&posts).Error

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

	folderPath := fmt.Sprintf("./assets/posts/%s", postId)

	_, err := os.Stat(folderPath)
	if err != nil {
		if !os.IsNotExist(err) {
			_ = os.RemoveAll(folderPath)
		}
	}

	_, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	err = config.DB.Where("ID=?", postId).Delete(&posts).Error

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
