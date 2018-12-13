package main

import (
	"arsDrive/controllers"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"html/template"
	"io"
	"net/http"
)
type TemplateRenderer struct {
	templates *template.Template
}

// Render renders a template document
func (t *TemplateRenderer) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	// Add global methods if data is a map
	if viewContext, isMap := data.(map[string]interface{}); isMap {
		viewContext["reverse"] = c.Echo().Reverse
	}
	return t.templates.ExecuteTemplate(w, name, data)
}

func customHTTPErrorHandler(err error, c echo.Context) {
	var (
		code = http.StatusInternalServerError
		msg  string
	)
	if he, ok := err.(*echo.HTTPError); ok {
		code = he.Code
		msg = he.Error()
	}
	c.Render(code, "error.html",map[string]interface{}{
		"message": msg,
	})
}


func main() {

	// Echo instance
	e := echo.New()

	// Middleware
	//e.Use(middleware.Recover())
	//e.Use(middleware.Logger())
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "method=${method}, uri=${uri}, status=${status}\n",
	}))


	//static pages
	e.Static("/static", "static")

	e.Renderer = &TemplateRenderer{
		templates: template.Must(template.ParseGlob("views/*.html")),
	}

	//errot_pages
	e.HTTPErrorHandler = customHTTPErrorHandler
	//Routers
	e.GET("/",controllers.Index)
	e.Any("/api/v0/add",controllers.UploadPoxy)
	e.GET("/ipfs/*",controllers.GateWayPoxy)
	e.POST("/api/getFileList",controllers.GetFileList)
	e.POST("/api/addFile",controllers.AddFile)
	e.POST("/api/getUserRoot",controllers.GetUserRoot)
	e.POST("/api/newFolder",controllers.NewFolder)
	e.POST("/api/copyFiles",controllers.CopyFiles)
	e.POST("/api/moveFiles",controllers.MoveFiles)
	e.POST("/api/removeFiles",controllers.RemoveFiles)
	e.POST("/api/login",controllers.Login)
	e.POST("/api/logout",controllers.Logout)
	// Start server
	e.Logger.Fatal(e.Start(controllers.Setting.Httpserver))
}
