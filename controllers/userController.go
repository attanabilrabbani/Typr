package controllers

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/attanabilrabbani/go-typr/config"
	"github.com/attanabilrabbani/go-typr/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func UserSignup(c *gin.Context) {
	var signupbody struct {
		Username string
		Email    string
		Password string
		Role     string
	}

	if c.Bind(&signupbody) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Signup Failed",
		})
		return
	}

	if CheckUsernameAvailability(signupbody.Username) {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Username already taken",
		})
		return
	}

	if CheckUsername(signupbody.Username) {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "username cannot contain spaces.",
		})
		return
	}

	if CheckEmail(signupbody.Email) {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Email already used.",
		})
		return
	}

	//hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(signupbody.Password), 10)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password Hash Failed",
		})
		return
	}

	user := models.User{
		Username: signupbody.Username,
		Email:    signupbody.Email,
		Password: string(hash),
		Role:     signupbody.Role,
	}

	err = config.DB.Create(&user).Error

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Signup Failed",
		})
		return
	}

	c.JSON(http.StatusOK, user)

}

func UserLogin(c *gin.Context) {
	var loginbody struct {
		Email    string
		Password string
	}

	if c.Bind(&loginbody) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Login Failed",
		})
		return
	}
	var user models.User

	config.DB.First(&user, "email = ?", loginbody.Email)
	if user.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid email or password",
		})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginbody.Password))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid email or password",
		})
		return
	}

	//generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 24 * 15).Unix(),
	})

	tokenStr, err := token.SignedString([]byte(os.Getenv("SECRET_KEY")))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to create key",
		})
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("Auth", tokenStr, 3600*24*15, "", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login succesful",
	})
}

func UserSignout(c *gin.Context) {
	c.SetCookie("Auth", "", -1, "", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out Successfully",
	})
}

func UserValidate(c *gin.Context) {
	user, _ := c.Get("user")
	c.JSON(http.StatusOK, gin.H{
		"message": user,
	})
}

func GetUserById(c *gin.Context) {
	userId := c.Param("id")

	var userData models.User
	config.DB.Preload("Posts").Preload("Likes").Preload("Followers").Preload("Following").First(&userData, userId)

	if userData.ID == 0 || userData.Role == "admin" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "user not found.",
		})
		return
	}
	c.JSON(http.StatusOK, userData)
}

func CheckUsernameAvailability(username string) bool {
	var user models.User
	taken := config.DB.Where("username = ?", username).First(&user)

	//false = username available
	//true = username found
	if taken.Error == gorm.ErrRecordNotFound {
		return false
	} else {
		return true
	}

}

func CheckUsername(username string) bool {
	check_for_spaces := strings.Contains(username, " ")

	//true = contains spaces
	if check_for_spaces {
		return true
	} else {
		return false
	}

}

func CheckEmail(email string) bool {
	var user models.User
	emailTaken := config.DB.Where("email = ?", email).First(&user)

	if emailTaken.Error == gorm.ErrRecordNotFound {
		return false
	} else {
		return true
	}
}
