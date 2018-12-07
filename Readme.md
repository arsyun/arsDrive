#### [中文版文档](https://github.com/arsyun/arsDrive/blob/master/Readme-cn.md)

# arsDrive

An Extension of ARS pServer Based on IPFS

demo website http://arsdrive.ipfs-storage.tech/

​	arsDrive is designed as an extension of ARS pServer .   Now the source code  open and modify as a website project ，So the Access control is simple.

### Environment   and Configuration

##### 1.Download and install 

```
$ go get github.com/arsyun/arsDrive
```

##### 2.Dependencies      

```
$ go get github.com/labstack/echo/... 
```

##### 3.Runtime environment  

​	install   IPFS node   https://github.com/ipfs/go-ipfs

​	arsDrive must connect an IPFS node. The IPFS node should set access control .

​	The steps to configure this are as follows. 

```
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST", "OPTIONS"]'
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
$ ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
$ ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
```

##### 4.configuration file

​	If IPFS node and arsDrive running on a LAN network. The IP of  IPFS node is 192.168.1.25  .so you can set the configuration file as follows.

```
# ./config/conf.json
{
  "title":"arsDrive",                 //HTTP title
  "app_name" :"arsDrive",            //app name
  "httpserver":":80",				//arsDrive server port
  "ipfs_gateway":"192.168.1.56:8080",//IPFS gateway address
  "ipfs_api":"192.168.1.56:5001"	//IPFS API address
 }
```

# License

arsDrive is issued under GPLv3. license. 


