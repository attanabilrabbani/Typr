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

	routes.UserRoutes(r)
	routes.PostsRoutes(r)
	routes.RepliesRoutes(r)
	routes.LikesRoutes(r)
	routes.FollowRoutes(r)

	r.Run()
}
