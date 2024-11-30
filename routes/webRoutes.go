package routes

import (
	"github.com/attanabilrabbani/go-typr/controllers"
	"github.com/gin-gonic/gin"
)

func WebRoutes(r *gin.Engine) {
	r.GET("/", controllers.Homepage)
	r.GET("/signup", controllers.SignupPage)
	r.GET("/login", controllers.LoginPage)
}
