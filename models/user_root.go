package models

import (
	"io/ioutil"
	"os"
)

type UserRoot struct {
	root_file string
}

func (self *UserRoot) GetRoot() (string ,error){
	var root string
	f, err := os.Open(self.root_file)
	if(err != nil){
		if os.IsNotExist(err){
			root = "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn"
			err = nil
		}
	}else{
		fd, err2 := ioutil.ReadAll(f)
		root = string(fd)
		err = err2
	}
	return root,err
}
func (self *UserRoot)SetRoot(root string)(error){
	if(root !=  ""){
		d1 := []byte(root)
		err := ioutil.WriteFile(self.root_file, d1, 0755)
		return err
	}else {
		return nil
	}
}

func GetUserRootModel(uid string) (u *UserRoot){
	u = new(UserRoot)
	u.root_file = "./cache/"+uid+".txt"
	_, err := os.Stat("./cache")
	if err!=nil && os.IsNotExist(err) {
		os.Mkdir("./cache", os.ModePerm)
		return
	}
	return
}

/*
func (this UserRoot)GerRoot(uid string) (res string){
	//var res string
	bm, _ := cache.NewCache("file", `{"CachePath":"./userhash","FileSuffix":".txt","DirectoryLevel":2,"EmbedExpiry":0}`)
	if(bm.IsExist(uid)){
		v := bm.Get(uid)
		res = string(v.([]byte))
	}else{
		res = "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn"
		bm.Put(uid,res,0)
	}
	return
}
func (this UserRoot)SetRoot(uid string ,hash string){
	bm, _ := cache.NewCache("file", `{"CachePath":"./userhash","FileSuffix":".txt","DirectoryLevel":2,"EmbedExpiry":0}`)

}
*/