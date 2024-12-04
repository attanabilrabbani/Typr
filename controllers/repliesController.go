package controllers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/attanabilrabbani/go-typr/config"
	"github.com/attanabilrabbani/go-typr/models"
	"github.com/gin-gonic/gin"
)

func AddReply(c *gin.Context) {
	postId, _ := strconv.Atoi(c.Param("postid"))
	var replyBody, parentPost models.Posts

	err := c.ShouldBind(&replyBody)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
		})
		return
	}

	if replyBody.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Content required",
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

	replyBody.UserID = authenticatedUser.ID
	replyBody.ParentID = &parentId

	err = config.DB.Create(&replyBody).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to post reply",
		})
		return
	}

	image, err := c.FormFile("image")
	if err == nil {
		imageName := strings.ReplaceAll(image.Filename, " ", "_")
		imageFolder := fmt.Sprintf("./assets/posts/%d", replyBody.ID)
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

		replyBody.Image = imageName
		config.DB.Save(&replyBody)
	}

	c.JSON(http.StatusOK, replyBody)

}
