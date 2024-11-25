package routes

import (
	"github.com/attanabilrabbani/go-typr/controllers"
	"github.com/attanabilrabbani/go-typr/middleware"
	"github.com/gin-gonic/gin"
)

func LikesRoutes(r *gin.Engine) {
	r.POST("/likes/add/:postid", middleware.RequireAuth, controllers.AddLikes)
	r.DELETE("/likes/:postid", middleware.RequireAuth, controllers.RemoveLikes)
}
