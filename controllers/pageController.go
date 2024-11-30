package controllers

import "github.com/gin-gonic/gin"

func Homepage(c *gin.Context) {
	c.HTML(200, "index.html", gin.H{
		"title": "Typr",
	})
}

func SignupPage(c *gin.Context) {
	c.HTML(200, "signup.html", nil)
}

func LoginPage(c *gin.Context) {
	c.HTML(200, "login.html", nil)
}
