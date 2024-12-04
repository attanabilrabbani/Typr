package routes

import (
	"github.com/attanabilrabbani/go-typr/controllers"
	"github.com/attanabilrabbani/go-typr/middleware"
	"github.com/gin-gonic/gin"
)

func WebRoutes(r *gin.Engine) {
	r.GET("/", controllers.Homepage)
	r.GET("/signup", controllers.SignupPage)
	r.GET("/login", controllers.LoginPage)
	r.GET("/posts/view/:postid", controllers.PostView)
	r.GET("/profile/:userid", controllers.ProfileView)
	r.GET("/editprofile/:userid", middleware.RequireAuth, controllers.EditPage)
}
