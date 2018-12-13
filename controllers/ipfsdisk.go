package controllers

import (
	"crypto/md5"
	"encoding/json"
	"fmt"
	"github.com/labstack/echo"
	"arsDrive/models"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"regexp"
)

type responseData struct {
	Success int `json:"success"`
	Describe string  `json:"describe"`
	//Data []interface{} `json:"data"`
}

type fileList struct {
	responseData
	Data []models.FileInfo `json:"data"`
}

type result struct {
	responseData
	Data string `json:"data"`
}

type configuration struct {
	Title string
	App_name string
	Httpserver string
	Ipfs_gateway string
	Ipfs_api string
}

var Setting configuration
var ipfsModel models.IpfsModel

func init(){
	file, _ := os.Open("./config/conf.json")
	defer file.Close()
	decoder := json.NewDecoder(file)
	Setting = configuration{}
	err := decoder.Decode(&Setting)
	if err != nil {
		Setting.Httpserver = ":88"
		Setting.Ipfs_api = "127.0.0.1:5001"
		Setting.Ipfs_gateway = "127.0.0.1:8080"
	}
	ipfsModel = models.GetIpfsModel("http://"+Setting.Ipfs_api)
}


func Index(c echo.Context) error{
	index_data := map[string]interface{}{
		"title": Setting.Title,
		"app_name":Setting.App_name,
	}
	uid := getuser(c)
	if uid == ""{
		return c.Render(http.StatusOK, "login.html",index_data)
	}
	userAgent := c.Request().Header.Get("User-Agent")
	reg := regexp.MustCompile(`(?i:mobile|android|iphone|ipad)`)
	res := reg.FindString(userAgent)
	if(len(res)>0){
		return c.Render(http.StatusOK, "mobile.html",index_data)
	}else {
		return c.Render(http.StatusOK, "pc.html",index_data)
	}
}

func UploadPoxy(c echo.Context) error{
	remote, err := url.Parse("http://"+Setting.Ipfs_api)
	if err != nil {
		panic(err)
	}
	proxy := httputil.NewSingleHostReverseProxy(remote)
	proxy.ServeHTTP(c.Response(), c.Request())
	return nil
}

func GateWayPoxy(c echo.Context) error{
	remote, err := url.Parse("http://"+Setting.Ipfs_gateway)
	if err != nil {
		panic(err)
	}
	proxy := httputil.NewSingleHostReverseProxy(remote)
	proxy.ServeHTTP(c.Response(), c.Request())
	return nil
}

func errorReturn(c echo.Context,err string) (error){
	res := new(responseData)
	res.Success = -1
	res.Describe=err

	return c.JSON(http.StatusOK, res)
}

func GetFileList(c echo.Context) (err error){
	uid := getuser(c)
	if uid == ""{
		return errorReturn(c,"user_id is NULL")
	}
	path := c.FormValue("path")
	userRoot := models.GetUserRootModel(uid)
	root, err := userRoot.GetRoot()
	if err != nil{
		return errorReturn(c,"Get Root_Hash ERROR")
	}
	files ,err := ipfsModel.GetPathList(root,path)
	if err != nil{
		return errorReturn(c,"Wrong Path")
	}
	var res fileList
	res.Success=0
	res.Data = files
	return c.JSON(http.StatusOK, res)
}

func RemoveFiles(c echo.Context) (err error){
	uid := getuser(c)
	if uid == ""{
		return errorReturn(c,"user_id is NULL")
	}
	files := c.FormValue("files")
	userRoot := models.GetUserRootModel(uid)
	root, err := userRoot.GetRoot()
	if err != nil{
		return errorReturn(c,"Get Root_Hash ERROR")
	}
	hash ,err2 := ipfsModel.RmFiles(root,files)
	if err2 != nil{
		return errorReturn(c,"Wrong Path")
	}
	userRoot.SetRoot(hash)
	var res result
	res.Success=0
	res.Data = hash
	return c.JSON(http.StatusOK, res)
}

func AddFile(c echo.Context )(err error){
	uid := getuser(c)
	if uid == ""{
		return errorReturn(c,"user_id is NULL")
	}
	path := c.FormValue("path")
	name := c.FormValue("name")
	hash := c.FormValue("hash")
	userRoot := models.GetUserRootModel(uid)
	root, err := userRoot.GetRoot()
	if err != nil{
		return errorReturn(c,"Get Root_Hash ERROR")
	}
	hash ,err2 := ipfsModel.AddFile(root,path+name,hash)
	if err2 != nil{
		return errorReturn(c,"Wro2ng Path")
	}
	userRoot.SetRoot(hash)
	var res result
	res.Success=0
	res.Data = hash
	return c.JSON(http.StatusOK, res)
}

func GetUserRoot(c echo.Context )(err error){
	uid := getuser(c)
	if uid == ""{
		return errorReturn(c,"user_id is NULL")
	}
	userRoot := models.GetUserRootModel(uid)
	root, err := userRoot.GetRoot()
	if err != nil{
		return errorReturn(c,"Get Root_Hash ERROR")
	}
	var res result
	res.Success=0
	res.Data = root
	return c.JSON(http.StatusOK, res)
}

func NewFolder(c echo.Context )(err error){
	uid := getuser(c)
	if uid == ""{
		return errorReturn(c,"user_id is NULL")
	}
	userRoot := models.GetUserRootModel(uid)
	root, err := userRoot.GetRoot()
	if err != nil{
		return errorReturn(c,"Get Root_Hash ERROR")
	}
	path := c.FormValue("path")
	name := c.FormValue("name")
	hash ,err2 := ipfsModel.AddFile(root,path+name,"QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn")
	if err2 != nil{
		return errorReturn(c,"Wrong Path")

	}
	userRoot.SetRoot(hash)
	var res result
	res.Success=0
	res.Data = hash
	return c.JSON(http.StatusOK, res)
}

func CopyFiles(c echo.Context )(err error){
	uid := getuser(c)
	if uid == ""{
		c.FormValue("user_id is NULL")
		return
	}
	userRoot := models.GetUserRootModel(uid)
	root, err := userRoot.GetRoot()
	if err != nil{
		return errorReturn(c,"Get Root_Hash ERROR")
	}
	path := c.FormValue("path")
	data := c.FormValue("data")
	hash ,err2 := ipfsModel.AddFiles(root,path,data)
	if err2 != nil{
		return errorReturn(c,"Wrong Path")
	}
	userRoot.SetRoot(hash)
	var res result
	res.Success=0
	res.Data = hash
	return c.JSON(http.StatusOK, res)
}

func MoveFiles(c echo.Context )(err error){
	uid := getuser(c)
	if uid == ""{
		return errorReturn(c,"user_id is NULL")
	}
	userRoot := models.GetUserRootModel(uid)
	root, err := userRoot.GetRoot()
	if err != nil{
		return errorReturn(c,"Get Root_Hash ERROR")
	}
	path := c.FormValue("path")
	data := c.FormValue("data")
	hash ,err2 := ipfsModel.MoveFiles(root,path,data)
	if err2 != nil{
		return errorReturn(c,"Wrong Path")
	}
	userRoot.SetRoot(hash)
	var res result
	res.Success=0
	res.Data = hash
	return c.JSON(http.StatusOK, res)
}
func Login(c echo.Context)(err error){
	user := c.FormValue("user")
	if user == ""{
		return errorReturn(c,"user is null")
	}
	setuser(c,user)
	var res result
	res.Success=0
	return c.JSON(http.StatusOK, res)
}
func Logout(c echo.Context)(err error){
	cookie := http.Cookie{Name: "user", Path: "/", HttpOnly: true,  MaxAge:-1}
	http.SetCookie(c.Response(), &cookie)
	var res result
	res.Success=0
	return c.JSON(http.StatusOK, res)
}
func getuser(c echo.Context)(string){
	var cookie, err = c.Request().Cookie("user")
	if cookie == nil ||err != nil {
		return ""
	}
	return cookie.Value
}
func setuser(c echo.Context,user string){
	data := []byte(user)
	hash := fmt.Sprintf("%x", md5.Sum(data))
	cookie := http.Cookie{Name: "user", Value: hash, Path: "/", HttpOnly: true, MaxAge: 3600*12}
	http.SetCookie(c.Response(), &cookie)
}