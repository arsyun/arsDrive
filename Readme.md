# arsDrive

先河网盘

基于IPFS的应用先河私有云扩展应用

### 环境配置

##### 1.源码下载

```
$ go get github.com/arsyun/arsDrive
```

##### 2.依赖安装

```
$ go get github.com/labstack/echo/... 
```

因为golang.org 在国内无法访问，会导致package golang.org/x/crypto 安装失败

需要访问访问<https://github.com/golang/crypto>下载该组件 然后放到$(GOROOT)/src/golang.org/x/crypto

以后再碰到无法安装golang.org/x/...之类的错误，只需要到https://github.com/golang/...去下载，放到${GOROOT}/src/golang.org /x/...目录下 

##### 3.运行环境

arsDrive需要连接一个IPFS节点，IPFS节点需要设置访问控制，参考如下

```
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST", "OPTIONS"]'
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
$ ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
$ ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
```

##### 4.配置文件

假如IPFS节点与arsDrive运行在同一局域网，IPFS节点的IP为192.168.2.56 。配置参考如下

```
# ./config/conf.json
{
  "title":"先河网盘",                 //浏览器显示的title
  "app_name" :"arsDrive",            //应用名称
  "httpserver":":80",				//arsDrive运行服务端口
  "ipfs_gateway":"192.168.2.56:8080",//IPFS节点的网关——gateway
  "ipfs_api":"192.168.2.56:5001"	//IPFS节点的API
 }
```
