# 先河网盘

基于IPFS的应用先河私有云扩展应用   

先河网盘本来是部署在先河私有云应用市场下的一个扩展应用，现在作为一个网站开源，所以鉴权只做了简单的设计——只需要输入用户名。

演示网址 http://arsdrive.ipfs-storage.tech/

### 用法

添加一个文件

Name:      test.jpg

Hash:       QmNv5MKP7iExYiHBYZaCkbCB3So4BHQjjQGroC2N1aBCMy

添加一个文件夹

Name:      AAA

Hash:        QmdZ3QZbiZcvAp9ZAon3YVb38EZJWS1351mJs6curruzKr

上传、删除、打开等其他操作不详细介绍

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

需要访问访问 https://github.com/golang/crypto    下载该组件 然后放到$(GOROOT)/src/golang.org/x/crypto

以后再碰到无法安装golang.org/x/...之类的错误，只需要到[https://github.com/golang/...](https://github.com/golang)   去下载，放到${GOROOT}/src/golang.org /x/...目录下 

##### 3.运行环境

安装IPFS节点  https://github.com/ipfs/go-ipfs

arsDrive需要连接一个IPFS节点，IPFS节点需要设置访问控制，参考如下

```
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST", "OPTIONS"]'
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
$ ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
$ ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
```

##### 4.配置文件

假如IPFS节点的IP为192.168.1.56 。配置参考如下

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

假如IPFS节点和arsDrive运行在同一太主机，访问控制和配置应该把地址设为“127.0.0.1”

```
$ ipfs config Addresses.Gateway /ip4/127.0.0.1/tcp/8080
$ ipfs config Addresses.API /ip4/127.0.0.1/tcp/5001
...
# ./config/conf.json
...
  "ipfs_gateway":"127.0.0.1:8080",//IPFS gateway address
  "ipfs_api":"127.0.0.1:5001"	//IPFS API address
```



# 版权声明

先河网盘使用 GPL v3 协议. 

