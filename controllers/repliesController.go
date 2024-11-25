package controllers

import (
	"net/http"
	"strconv"

	"github.com/attanabilrabbani/go-typr/config"
	"github.com/attanabilrabbani/go-typr/models"
	"github.com/gin-gonic/gin"
)

func AddReply(c *gin.Context) {
	postId, _ := strconv.Atoi(c.Param("postid"))
	var replyBody, parentPost models.Posts

	err := c.Bind(&replyBody)

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

	c.JSON(http.StatusOK, replyBody)

}
