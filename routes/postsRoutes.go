package routes

import (
	"github.com/attanabilrabbani/go-typr/controllers"
	"github.com/attanabilrabbani/go-typr/middleware"
	"github.com/gin-gonic/gin"
)

func PostsRoutes(r *gin.Engine) {
	r.POST("/posts/create", middleware.RequireAuth, controllers.CreatePost)
	r.GET("/posts/", controllers.GetPosts)
	r.GET("/posts/:id", controllers.GetPostsById)
	r.DELETE("/posts/:id", middleware.RequireAuth, controllers.DeletePosts)
}
