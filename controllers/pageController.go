package controllers

import (
	"net/http"

	"github.com/attanabilrabbani/go-typr/config"
	"github.com/attanabilrabbani/go-typr/models"
	"github.com/gin-gonic/gin"
)

func Homepage(c *gin.Context) {
	c.HTML(http.StatusOK, "index.html", nil)
}

func SignupPage(c *gin.Context) {
	c.HTML(http.StatusOK, "signup.html", nil)
}

func LoginPage(c *gin.Context) {
	c.HTML(http.StatusOK, "login.html", nil)
}

func PostView(c *gin.Context) {
	postId := c.Param("postid")
	var postData models.Posts
	err := config.DB.First(&postData, postId).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to get Posts info",
		})
		return
	}
	c.HTML(http.StatusOK, "postview.html", gin.H{
		"Content": postData.Content,
	})
}

func ProfileView(c *gin.Context) {
	userId := c.Param("userid")
	var userInfo models.User
	err := config.DB.Where("ID = ?", userId).First(&userInfo).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to get user info",
		})
		return
	}

	c.HTML(http.StatusOK, "profile.html", gin.H{
		"Username": userInfo.Username,
		"Name":     userInfo.Name,
		"Pfp":      userInfo.ProfilePic,
	})
}

func EditPage(c *gin.Context) {
	userId := c.Param("userid")
	var userInfo models.User
	err := config.DB.Where("ID = ?", userId).First(&userInfo).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to get user info",
		})
		return
	}

	c.HTML(http.StatusOK, "editprofile.html", gin.H{
		"userInfo": userInfo,
	})
}
