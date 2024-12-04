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
	if err == nil {
		imageName := strings.ReplaceAll(image.Filename, " ", "_")
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

func preloadChildren(depth int) string {
	if depth == 0 {
		return "Children"
	}

	return fmt.Sprintf("Children.%s", preloadChildren(depth-1))
}

func GetPosts(c *gin.Context) {
	var posts []models.Posts

	postQuery := config.DB

	depth := 1

	for depth < 15 {
		preloadStr := preloadChildren(depth)
		postQuery = postQuery.Preload(preloadStr)
		postQuery = postQuery.Preload(fmt.Sprintf("%s.User", preloadStr))
		postQuery = postQuery.Preload(fmt.Sprintf("%s.Likes", preloadStr))
		depth++

	}
	err := postQuery.Preload("Children.Children").
		Preload("Children.User").
		Preload("Children.Likes").
		Preload("User").
		Preload("Likes").Where("parent_id IS NULL").
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

func EditPosts(c *gin.Context) {
	postId := c.Param("id")

	var postData models.Posts
	var editBody struct {
		Content string `gorm:"not null" form:"content"`
	}

	c.ShouldBind(&editBody)

	config.DB.First(&postData, postId)

	editData := make(map[string]interface{})

	if editBody.Content != "" {
		editData["Content"] = editBody.Content
	}

	err := config.DB.Model(&postData).Updates(editData).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Update Failed.",
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Update Succesful.",
	})

}

func GetPostsById(c *gin.Context) {
	postId := c.Param("id")
	var postBody models.Posts

	postQuery := config.DB

	postQuery = postQuery.Preload("User").Preload("Likes").Preload("Children.Children").Preload("Children.User").Preload("Children.Likes")

	err := postQuery.First(&postBody, postId).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Post Unavailable",
		})
		return
	}

	depth := 1

	for depth < 15 {
		preloadStr := preloadChildren(depth)
		postQuery = postQuery.Preload(preloadStr)
		postQuery = postQuery.Preload(fmt.Sprintf("%s.User", preloadStr))
		postQuery = postQuery.Preload(fmt.Sprintf("%s.Likes", preloadStr))

		err := postQuery.Find(&postBody).Error
		if err != nil {
			break
		}
		depth++

	}

	c.JSON(http.StatusOK, postBody)

}

func DeletePosts(c *gin.Context) {
	var posts models.Posts
	postId := c.Param("id")

	folderPath := fmt.Sprintf("./assets/posts/%s", postId)

	_, err := os.Stat(folderPath)
	if err == nil {
		_ = os.RemoveAll(folderPath)
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
