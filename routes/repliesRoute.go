package routes

import (
	"github.com/attanabilrabbani/go-typr/controllers"
	"github.com/attanabilrabbani/go-typr/middleware"
	"github.com/gin-gonic/gin"
)

func RepliesRoutes(r *gin.Engine) {
	r.POST("/reply/:postid", middleware.RequireAuth, controllers.AddReply)
}
