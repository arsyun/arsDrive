package models

import (
	"encoding/json"
	"errors"
	"strings"
)

type IpfsModel struct {
	root string
}
type FileInfo struct {
	Name string `json:"Name"`
	Size int64 `json:"Size"`
	Hash string `json:"Hash"`
}
type ipld struct {
	Links []FileInfo `json:"Links"`
	Data string `json:"Data"`
	Type string `json:"Type"`
	Message string `json:"Message"`
}

type deleData struct {
	Path string `json:"path"`
	Files []string `json:"files"`
}
type sendData struct {
	Path string `json:"Path"`
	Files []FileInfo `json:"Files"`
}
type resData struct {
	Hash string `json:"Hash`
	Type string `json:"Type"`
	Message string `json:"Message"`
}

func GetIpfs(root string)(*IpfsModel){
	model := new(IpfsModel)
	model.root = root+"/"
	return model
}

func (self *IpfsModel) GetPathList(path string) ([]FileInfo,error){
	if strings.HasPrefix(path,"/"){
		path = path[1:]
	}
	api  := new(Api)
	res := api.ObjectGet(self.root+path)
	p := &ipld{}
	err := json.Unmarshal(res, p)
	if p.Type != ""{
		err = errors.New(p.Message)
	}
	return p.Links,err
}

func (self *IpfsModel)RmFiles(filesjson string)(string,error){
	f := &deleData{}
	json.Unmarshal([]byte(filesjson),f)
	api := new(Api)
	for i:=0;i< len(f.Files);i++{
		res := api.ObjectRm(self.root,f.Path+f.Files[i])
		p:= &resData{}
		json.Unmarshal(res, p)
		if p.Type != ""{
			return "", errors.New(p.Message)
		}
		if p.Hash == ""{
			return "", errors.New(string(res))
		}
		self.root = p.Hash
	}
	return self.root, nil
}

func (self *IpfsModel)AddFile(path string,hash string)(string,error){
	api := new(Api)
	res := api.ObjectAdd(self.root,path,hash)
	p:= &resData{}
	json.Unmarshal(res, p)
	if p.Type != ""{
		return "", errors.New(p.Message)
	}
	return p.Hash, nil
}

func (self *IpfsModel)AddFiles(path string,filesjson string)(string,error){
	f := &sendData{}
	json.Unmarshal([]byte(filesjson),f)
	api := new(Api)
	for i:=0;i < len(f.Files);i++{
		res := api.ObjectAdd(self.root, path+f.Files[i].Name,f.Files[i].Hash)
		p:= &resData{}
		json.Unmarshal(res, p)
		if p.Type != ""{
			return "", errors.New(p.Message)
		}
		self.root = p.Hash
	}
	return self.root, nil
}

func (self *IpfsModel)MoveFiles(path string,filesjson string)(string,error){
	f := &sendData{}
	json.Unmarshal([]byte(filesjson),f)
	api := new(Api)
	oldPath := f.Path
	for i:=0;i < len(f.Files);i++{
		res := api.ObjectRm(self.root,oldPath+f.Files[i].Name)
		p:= &resData{}
		json.Unmarshal(res, p)
		if p.Type != ""{
			return "", errors.New(p.Message)
		}
		self.root = p.Hash
	}
	for i:=0;i < len(f.Files);i++{
		res := api.ObjectAdd(self.root, path+f.Files[i].Name,f.Files[i].Hash)
		p:= &resData{}
		json.Unmarshal(res, p)
		if p.Type != ""{
			return "", errors.New(p.Message)
		}
		self.root = p.Hash
	}
	return self.root, nil
}