package models

import (
	"io/ioutil"
	"net/http"
)

const Host string = "http://192.168.2.56:5001";
type Api struct {

}

func (a *Api)httpGet(url string) []byte{
	resp, err :=   http.Get(url)
	if err != nil {
		// handle error
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil
	}
	return body
}
func (a *Api)ObjectGet (hash string)[]byte{
	url := Host+"/api/v0/object/get?arg="+hash
	return a.httpGet(url)
}
func (a *Api)ObjectRm(root string,name string)[]byte{
	url := Host+"/api/v0/object/patch/rm-link?arg="+root+"&arg="+name
	return a.httpGet(url)
}
func (a *Api)ObjectAdd(root string,name string,hash string)[]byte{
	url := Host+"/api/v0/object/patch/add-link?arg="+root+"&arg="+name+"&arg="+hash
	return a.httpGet(url)
}