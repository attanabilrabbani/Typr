package routes

import (
	"github.com/attanabilrabbani/go-typr/controllers"
	"github.com/attanabilrabbani/go-typr/middleware"
	"github.com/gin-gonic/gin"
)

func FollowRoutes(r *gin.Engine) {
	r.POST("/follow/:followedid", middleware.RequireAuth, controllers.AddFollow)
	r.DELETE("/unfollow/:followedid", middleware.RequireAuth, controllers.Unfollow)
}
