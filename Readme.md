

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

​	If IPFS node and arsDrive running on a LAN network. The IP of  IPFS node is 192.168.2.25  .so you can set the configuration file as follows.

```
# ./config/conf.json
{
  "title":"arsDrive",                 //HTTP title
  "app_name" :"arsDrive",            //app name
  "httpserver":":80",				//arsDrive server port
  "ipfs_gateway":"192.168.2.56:8080",//IPFS gateway address
  "ipfs_api":"192.168.2.56:5001"	//IPFS API address
 }
```

# License

arsDrive is issued under GPLv3. license. 







# 先河网盘

基于IPFS的应用先河私有云扩展应用   

演示网址 http://arsdrive.ipfs-storage.tech/

​	先河网盘本来是部署在先河私有云应用市场下的一个扩展应用，现在作为一个网站开源，所以鉴权只做了简单的设计。

### 环境配置

##### 1.源码下载

```
$ go get github.com/arsyun/arsDrive
```

##### 2.依赖安装

```
$ go get github.com/labstack/echo/... 
```

​	因为golang.org 在国内无法访问，会导致package golang.org/x/crypto 安装失败

需要访问访问https://github.com/golang/crypto下载该组件 然后放到$(GOROOT)/src/golang.org/x/crypto

​	以后再碰到无法安装golang.org/x/...之类的错误，只需要到https://github.com/golang/...去下载，放到${GOROOT}/src/golang.org /x/...目录下 

##### 3.运行环境

​	安装IPFS节点  https://github.com/ipfs/go-ipfs

​	arsDrive需要连接一个IPFS节点，IPFS节点需要设置访问控制，参考如下

```
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST", "OPTIONS"]'
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
$ ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
$ ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
```

##### 4.配置文件

​	假如IPFS节点与arsDrive运行在同一局域网，IPFS节点的IP为192.168.1.56 。配置参考如下

```
# ./config/conf.json

{
  "title":"先河网盘",                 //浏览器显示的title
  "app_name" :"arsDrive",            //应用名称
  "httpserver":":80",				//arsDrive运行服务端口
  "ipfs_gateway":"192.168.1.56:8080",//IPFS节点的网关——gateway
  "ipfs_api":"192.168.1.56:5001"	//IPFS节点的API
 }
```

# 版权声明

先河网盘使用 GPL v3 协议. 