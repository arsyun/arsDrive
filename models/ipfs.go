package models

import (
	"encoding/json"
	"errors"
	"strings"
)

type IpfsModel struct {
	ApiModel Api
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

func GetIpfsModel(apihost string)(IpfsModel){
	model := IpfsModel{Api{apihost}}
	return model
}

func (self *IpfsModel) GetPathList(root string,path string) ([]FileInfo,error){
	if strings.HasPrefix(path,"/"){
		path = path[1:]
	}
	res := self.ApiModel.ObjectGet(root+"/"+path)
	p := &ipld{}
	err := json.Unmarshal(res, p)
	if p.Type != ""{
		err = errors.New(p.Message)
	}
	return p.Links,err
}

func (self *IpfsModel)RmFiles(root string,filesjson string)(string,error){
	f := &deleData{}
	json.Unmarshal([]byte(filesjson),f)
	for i:=0;i< len(f.Files);i++{
		res := self.ApiModel.ObjectRm(root,f.Path+f.Files[i])
		p:= &resData{}
		json.Unmarshal(res, p)
		if p.Type != ""{
			return "", errors.New(p.Message)
		}
		if p.Hash == ""{
			return "", errors.New(string(res))
		}
		root = p.Hash
	}
	return root, nil
}

func (self *IpfsModel)AddFile(root string,path string,hash string)(string,error){
	res := self.ApiModel.ObjectAdd(root,path,hash)
	p:= &resData{}
	json.Unmarshal(res, p)
	if p.Type != ""{
		return "", errors.New(p.Message)
	}
	return p.Hash, nil
}

func (self *IpfsModel)AddFiles(root string,path string,filesjson string)(string,error){
	f := &sendData{}
	json.Unmarshal([]byte(filesjson),f)
	for i:=0;i < len(f.Files);i++{
		res := self.ApiModel.ObjectAdd(root, path+f.Files[i].Name,f.Files[i].Hash)
		p:= &resData{}
		json.Unmarshal(res, p)
		if p.Type != ""{
			return "", errors.New(p.Message)
		}
		root = p.Hash
	}
	return root, nil
}

func (self *IpfsModel)MoveFiles(root string,path string,filesjson string)(string,error){
	f := &sendData{}
	json.Unmarshal([]byte(filesjson),f)
	oldPath := f.Path
	for i:=0;i < len(f.Files);i++{
		res := self.ApiModel.ObjectRm(root,oldPath+f.Files[i].Name)
		p:= &resData{}
		json.Unmarshal(res, p)
		if p.Type != ""{
			return "", errors.New(p.Message)
		}
		root = p.Hash
	}
	for i:=0;i < len(f.Files);i++{
		res := self.ApiModel.ObjectAdd(root, path+f.Files[i].Name,f.Files[i].Hash)
		p:= &resData{}
		json.Unmarshal(res, p)
		if p.Type != ""{
			return "", errors.New(p.Message)
		}
		root = p.Hash
	}
	return root, nil
}