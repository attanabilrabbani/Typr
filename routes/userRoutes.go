package routes

import (
	"github.com/attanabilrabbani/go-typr/controllers"
	"github.com/attanabilrabbani/go-typr/middleware"
	"github.com/gin-gonic/gin"
)

func UserRoutes(r *gin.Engine) {
	r.POST("/signup", controllers.UserSignup)
	r.POST("/login", controllers.UserLogin)
	r.GET("/validate", middleware.RequireAuth, controllers.UserValidate)
	r.POST("/logout", controllers.UserSignout)
	r.GET("/users/:id", controllers.GetUserById)
	r.PUT("/users/edit/:id", middleware.RequireAuth, controllers.UpdateUser)
}
