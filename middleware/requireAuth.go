package middleware

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/attanabilrabbani/go-typr/config"
	"github.com/attanabilrabbani/go-typr/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func RequireAuth(c *gin.Context) {
	/*1. Get Cookie
	  2. Decode/Validatre
	  3. Check expiration date
	  4. Find user with token sub
	  5. attach to req
	  6. continue*/

	tokenStr, err := c.Cookie("Auth")

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"valid": false})
		c.Abort()
		return
	}

	token, _ := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(os.Getenv("SECRET_KEY")), nil
	})

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		//check for expire date
		if float64(time.Now().Unix()) > claims["exp"].(float64) {
			c.JSON(http.StatusUnauthorized, gin.H{"valid": false})
			c.Abort()
			return
		}

		//find user
		var user models.User
		config.DB.First(&user, claims["sub"])
		if user.ID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"valid": false})
			c.Abort()
			return
		}

		//attach to request
		c.Set("user", user)

		//continue
		c.Next()

	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"valid": false})
		c.Abort()
		return
	}

}
