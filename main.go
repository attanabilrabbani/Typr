package main

import (
	"github.com/attanabilrabbani/go-typr/config"
	"github.com/attanabilrabbani/go-typr/routes"
	"github.com/gin-gonic/gin"
)

func init() {
	config.LoadEnvVars()
	config.DBConnect()
	config.MigrateDB()
}

func main() {
	r := gin.Default()

	r.Static("/static", "./views/static")
	r.Static("/assets", "./assets")
	r.LoadHTMLGlob("views/*.html")

	routes.WebRoutes(r)
	routes.UserRoutes(r)
	routes.PostsRoutes(r)
	routes.RepliesRoutes(r)
	routes.LikesRoutes(r)
	routes.FollowRoutes(r)

	r.Run()
}
