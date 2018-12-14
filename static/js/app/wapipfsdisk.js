var uid = 0;
var curPath = '';
var newFolder = false;
var Select = null;
$(document).ready(function(){
    uid = 7800025;
    init();
});

function init(){
    getFileList(curPath);
    navigation(curPath);
    bindinit();
}
function bindinit(){
    $(".file-list-list").on("click",".file2",function(a){
        if (Select !== null){
            var s = $(a.target).parent();
            var action = s.hasClass("action-menu")?s.attr("data-action"):null;
            var name = $(this).attr("data-path");
            var hash = $(this).attr("data-hash");
            var menu = $(Select).find(".file-action-menu").first();
            menu.slideUp('fast',function(){menu.remove();Select = null;});
            fileAction(action,name,hash);
            return;
        }
        var isFile = $(this).hasClass("file-box");
        if($(a.target).hasClass("file-action")){
            Select = this;
            $(this).append(shownFileMenu(isFile));
            $(this).find(".file-action-menu").slideDown('fast');
            return;
        }
        if(isFile){
            var path = $(this).attr('data-path');
            IPFS.getUserRoot(function(root){
                window.open("/ipfs/"+root+'/'+curPath+path);
            });
        }else{
            var path = $(this).attr("data-path");
            gotoPath(curPath+path);
        }
    });
    $("#yarnball").on("click","a",function(){
        var path = $(this).attr("data-path");
        gotoPath(path);
    });
    $(".file-list-list").on("click",".menu-close",function(){
        var menu = $(this).parent();
        menu.slideUp('fast',function(){menu.remove();Select = null;});
    });
    $("#openmenu").click(function(){
        var p = $(this).parent();
        p.hasClass("open")?p.removeClass("open"):p.addClass("open");          
    });
    $(".dropdown-menu li").click(function(){
        var func = $(this).attr("data-action");
        switch(func){
            case "upload":
                $("#fileToUpload").trigger("click");
                break;
            case "newfolder":
                $("#newfolder").removeClass('hide');
                $("#newfoldername").focus();
                break;            
            case "paste":
                IPFS.paste();
                $("#btn-paste").addClass('hide');
                break;
        };
        $(".toolbar-menu").removeClass("open");
    });
    $("#upload_cancel").on("click",null,function(){
        FileUpload.cancel();
    });
    $(".file-list-list").on("click","#confirm",function(){
        var name = $("#newfoldername").val();
        if(name!=='')IPFS.newfolder(name);
        $("#newfolder").addClass('hide');
        $("#newfoldername").val('');
    });
    $(".file-list-list").on("click","#cancel",function(){
        $("#newfolder").addClass('hide');
        $("#newfoldername").val('');
    });
    $("#logout_btn").on("click",null,function(){
        logout();
    });
    var clipboard = new ClipboardJS('.share-btn', {
        text: function(a) {
            var t = ($(a).parent()).parent();
            return self.location.href+'ipfs/'+t.attr("data-hash")+"?"+t.attr("data-path")
        }
    });
}
function shownFileMenu(isFile){  
    var dl = isFile?'<div class="action-menu" data-action="action-download"><span class="content"><i class="font-icon icon-cloud-download"></i>Download</span></div>':'';
    return  '<div class="file-action-menu" style="display:none;">'+
                    '<div class="action-menu" data-action="action-copy"><span class="content"><i class="font-icon icon-copy"></i>Copy</span></div>'+
                    '<div class="action-menu" data-action="action-cut"><span class="content"><i class="font-icon icon-cut"></i>Cut</span></div>'+
                    '<div class="action-menu share-btn" data-action="action-share"><span class="content"><i class="font-icon icon-share"></i>Share</span></div>'+
                   // '<div class="action-menu" data-action="action-rname"><span class="content"><i class="font-icon icon-pencil"></i>重命名</span></div>'+                    
                    '<div class="action-menu" data-action="action-remove"><span class="content"><i class="font-icon icon-trash"></i>Remove</span></div>'+dl+
                    '<div class="menu-close"><span class="content" style="margin:20px;"><i class="font-icon icon-ellipsis-horizontal"></i></span></div>'+
                    '<div style="clear:both"></div></div>';
}
function getFileList(path){
    var postdata = {user_id:uid,path:path};
    $.ajax({
        type: 'post',
        url:'./api/getFileList',
        dataType: 'json',
        data:postdata,
        beforeSend:function(){
        },
        success: function(result) {
            if(result.success >= 0){
                htmlview(result.data);
                navigation(path);
            }else{
                Tips.close({code:false,data:result.describe});
            }
        },
        error:function(){
            Tips.close({code:false,data:'error'});
        }
    });
}
function logout(){
    $.ajax({
        type: 'post',
        url:'./api/logout',
        dataType: 'json',
        data:{},
        success: function(result) {
            if(result.success >= 0){
                location.reload();
            }else{
                //alert(error);
            }
        }
    }); 
}
function startUpload(){
    FileUpload.start();
}

var FileUpload = (function(){
    var _stop = false;
    var xhr;
    var _init = function(){
        var file = $("#fileToUpload")[0].files[0];
        if(!file)return;
        $(".upload-info p").text(bytesToSize(file.size)+"--"+file.name).attr("title",file.name);
        var fd = new FormData();
        fd.append("file",file);
        $("#fileToUpload").val("");
        $('#upload-display').removeClass("hide");
        xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", _uploadProgress, false);
        xhr.addEventListener("load", _uploadComplete, false);
        xhr.addEventListener("error", _uploadFailed, false);
        xhr.open("POST", "/api/v0/add");//修改成自己的接口
        xhr.send(fd);
    };
    var _uploadProgress = function(evt){
        if (evt.lengthComputable) {
            var percentComplete = Math.round(evt.loaded * 100 / evt.total).toString()+"%";
            $("#upload_progress").width(percentComplete);
            $("#upload_progress div").html(percentComplete);
        }
        else {
            $("#upload_progress div").html('unable to compute');
        }
    };
    var _uploadComplete = function(evt){
        try {
            var res = JSON.parse(evt.target.response);
            if(res.Hash!=='' && res.Name!==''){
                IPFS.addfile(res.Name,res.Hash);
                $('#upload-display').addClass("hide");
            }
        }catch (e) {

        }
        
    };
    var _uploadFailed = function(evt){
        
    };
    var pauseUpload = function(){
        _stop = !_stop;
    };
    var cancel = function(){
        xhr.abort();
        $('#upload-display').addClass('hide');
    };
    return{
        start:_init,
        pause:pauseUpload,
        cancel:cancel
    };
})();

function gotoPath(path){
    curPath = path===''?'':path+'/';
    getFileList(path);
    
}
function htmlview(data){
    var folder_list = [];
    var file_list = [];
    data.forEach(function(value){
        var index = value.Name.lastIndexOf(".");
        if( index > 0){
            var postf = value.Name.substring(index+1);
            var str = '<div data-hash="'+value.Hash+'" data-path="'+value.Name+'" class="file file2 undefined file-box menu-file" title="" data-size="'+value.Size+'">'+
                            '<div class="ico" filetype="'+ postf +'"><i class="x-item-file x-'+ postf +' small"></i></div>'+
                            '<div class="filename"><span class="title">'+ value.Name +'</span></div>'+
                            '<div class="filesize">'+bytesToSize(value.Size)+'</div><div style="clear:both"></div>'+
                            '<div class="file-action icon-font icon-ellipsis-horizontal"></div></div>';
            file_list.push(str);
        }else{
            var str =  '<div data-hash="'+value.Hash+'" data-path="'+value.Name+'" class="file file2 undefined folder-box menu-folder" title="" data-size="'+value.Size+'">'+
                        '<div class="ico" filetype="folder"><i class="x-item-file x-folder small"></i></div>'+
                        '<div class="filename"><span class="title">'+ value.Name +'</span></div>'+
                        '<div class="filesize">'+bytesToSize(value.Size-71)+'</div><div style="clear:both"></div>'+
                        '<div class="file-action icon-font icon-ellipsis-horizontal"></div></div>';
            folder_list.push(str);
        }
    });
    var html = '<div id="newfolder" class="file undefined folder-box menu-folder hide" title="" data-size="0">'+
                        '<div class="ico" filetype="folder"><i class="x-item-file x-folder small"></i></div>'+
                        '<div class="filename" style="height:3rem;padding-top:0.8rem;width:80%;"><input class="fix" id="newfoldername" value=""/><a id="confirm">确定</a><a id="cancel">取消</a></div></div>';
    
    folder_list.forEach(function(value){
        html = html + value;
    });
    file_list.forEach(function(value){
        html = html + value;
    });
    html = html + '<div style="clear:both"></div>';
    for(var n=0;n<10;n++){
        html = html + '<div class="flex-empty"></div>';
    }
    $('.file-list-list').empty();
    $('.file-list-list').html(html);
}
function navigation(path){
    var arr = path.split("/");
    var i = arr.length;
    var html='<li ><a data-path="" style="z-index:'+ (i+1) +';"><i class="font-icon icon-home" style="line-height:inherit;"></i></a></li>';
    var vpath = '';
    var n = 0;
    while(n < i){
        if(arr[n]!==''){
            vpath = vpath === ''?arr[n]:vpath +'/' +arr[n];
            html = html+ '<li ><a data-path="'+vpath+'" style="z-index:'+(i-n)+';"><span class="title-name">'+arr[n]+'</span></a></li>';
        }
        n++;
    }
    $('#yarnball').html(html);
}
function fileAction(func,name,hash){
    if (func === null) return;
    switch(func){
        case "action-copy":
            IPFS.copy({path:curPath,files:[{name:name,hash:hash}]});
            $("#btn-paste").removeClass('hide');
            break;
        case "action-cut":
            IPFS.cut({path:curPath,files:[{name:name,hash:hash}]});
            $("#btn-paste").removeClass('hide');
            break;
        case "action-share":
            break;
        case "action-remove":
            IPFS.removeFile({path:curPath,files:[name]});
            break;
        case "action-download":
            IPFS.getUserRoot(function (root) {
                var url = "/ipfs/"+root+'/'+curPath+name;
                $("#downl").attr('href',url);
                $("#downl").attr('download',name);
                $("#downl").children("span").first().click();
            });
            break;
    }
}
var UUID = function(){
	return 'uuid_'+Math.ceil(Math.random()*10000);
};
function bytesToSize(bytes) {
    if (bytes <= 0) return '0 B';
    var k = 1024;
    sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    i = Math.floor(Math.log(bytes) / Math.log(k));
    var num = bytes / Math.pow(k, i);
    return num.toPrecision(3) + sizes[i];
    //return (bytes / Math.pow(k, i)) + ' ' + sizes[i]; 
    //toPrecision(3) 后面保留一位小数，如1.0GB //return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}
var Tips =  (function(){
	var inTime  = 400;
	var delay = 1000;
	var staticPath = "./static/";
	var _init = function(single,msg,code){
		var tipsIDname = UUID();
		if(single){
			tipsIDname = 'messageTips';
		}

		var tipsID = "#"+tipsIDname;
		if ($(tipsID).length === 0) {
			var html='<div id="'+tipsIDname+'" class="tips-box"><i class="tips-icon"></i><div class="tips-msg"><p></p></div>'+
				'<a class="tips-close">×</a><div style="clear:both"></div></div>';
			$('body').append(html);

			$(tipsID).show().css({'left':($(window).width() - $(tipsID).innerWidth())/2});
			$(window).bind('resize',function(){
				if ($(tipsID).css('display') =="none") return;
				self.stop(true,true);
				$(tipsID).css({'left':($(window).width() - $(tipsID).width()) / 2});
			});
			$(tipsID).find('.tips-close').click(function(){
				$(tipsID).animate({opacity:0},
					inTime,0,function(){
						$(this).hide();
					});
			});
		}
		var self = $(tipsID),theType;
		switch(code){//  success/warning/info/error
			case 100:delay = 2000;//加长时间 2s
			case true:
			case undefined:
			case 'success':theType = 'success';break;
			case 'info':theType = 'info';break;
			case 'warning':theType = 'warning';break;
			case false:
			case 'error':theType = 'error';delay = 2000;break;
			default:theType = 'info';break;
		}

		self.removeClass().addClass('tips-box '+theType);
		if (msg != undefined) self.find('.tips-msg p').html(msg);
		$(tipsID).show().css({'left':($(window).width() - $(tipsID).innerWidth())/2});
		return self;
	};
	var tips = function(msg,code){
		if (msg && typeof(msg) == 'object'){
			code = msg.code;
			msg  = msg.data;
		}
		var self = _init(false,msg,code);
		self.stop(true,true)
			.css({opacity:0,'top':-self.height()})
			.show()
			.animate({opacity:1,top:0},inTime,0);
		setTimeout(function(){
			self.animate({opacity:0,top:-self.height()},inTime,0,function(){
				self.remove();
			});
		},delay);
	};

	var pop = function(msg){
		var tipsIDname = 'messageTipsPop';
		var $self = $("#"+tipsIDname);
		if ($self.length ==0) {
			var html='<div id="'+tipsIDname+'" class="tips-box-pop"><div class="tips-msg"></div></div>';
			$('body').append(html);
			$self = $("#"+tipsIDname);
		}
		$self.find('.tips-msg').html(msg);
		$self.css({
			'left':($(window).width() - $self.innerWidth())/2,
			'top':($(window).height() - $self.innerHeight())/2
		});

		var animateTime = 150;
		$self.stop(true,true)
			.fadeIn(animateTime)
			.animate({opacity:0.4},animateTime,0)
			.delay(delay)
			.animate({opacity:0},animateTime,0,function(){
				$self.remove();
			});
	};

	var loading = function(msg,code){
		if (typeof(msg) == 'object'){
			code=msg.code;
			msg = msg.data;
		}
		if (msg == undefined) msg = 'loading...';
		msg+= "&nbsp;&nbsp; <img src='"+staticPath+"images/common/loading_circle.gif'/>";

		var self = _init(true,msg,code);
		try{
			self.stop(true,true)
			.css({'opacity':'0','top':-self.height()})
			.animate({opacity:1,top:0},inTime,0);
		}catch(e){};
	};
	var close = function(msg,code){
		if (typeof(msg) == 'object'){
			try{
				code=msg.code;msg = msg.data;
				if(code && typeof(msg) != 'string'){
					msg = "Success!";
				}
			}catch(e){
				code=0;msg ='';
			};
		}
		var self = _init(true,msg,code);
		setTimeout(function(){
			self.stop(true,true).animate({opacity:0,top:- self.height()},inTime,'linear',function(){
				self.remove();
			});
		},delay);
	};
	return{
		tips:tips,
		pop:pop,
		loading:loading,
		close:close
	};
})();
var IPFS = (function (){
    var command = null;
    var files = null;
    var addfile = function(name,hash){
        var data = {name:name,hash:hash,path:curPath,user_id:uid};
        request('addFile',data);
    };
    var getUserRoot = function(callback){
        var data = {user_id:uid};
        getdata('getUserRoot',data,callback);
    };
    var removeFile = function(sel){
        if(sel.files.length===0){
            return;
        }
        var data = {files:JSON.stringify(sel),user_id:uid};
        request('removeFiles',data);
    };
    var request = function(cmd,data){
        $.ajax({
            type: 'post',
            url:'./api/'+cmd,
            dataType: 'json',
            data:data,
            beforeSend:function(){
                Tips.loading();
            },
            success: function(result) {
                if(result.success >= 0){
                    Tips.close({code:true});
                    getFileList(curPath);
                    navigation(curPath);
                }else{
                    Tips.close({code:false,data:result.describe});
                }
            },
            error:function(){
                Tips.close({code:false,data:'error'});
            }
        });
    };
    var getdata = function(cmd,data,callback){
        var res = null;
        $.ajax({
            type: 'post',
            url:'./api/'+cmd,
            dataType: 'json',
            async:false, 
            data:data,
            success: function(result) {
                if(result.success >= 0){
                    res =result.data;
                }
            },
            error:function(){
            },
            complete:function(){
                if (res!==null)callback(res);
            }
        });
    };
    var copy = function(sels){
        command = "copyFiles";
        files = sels;
    };
    var cut = function(sels){
        command = "moveFiles";
        files =  sels;
    };
    var paste = function(){
        var filesStr = JSON.stringify(files);
        var data = {path:curPath,data:filesStr,user_id:uid};
        request(command,data);
    };
    var newfolder = function(folder){
        if(folder==='')return;
        var reg = new RegExp('^[^\\\\\\/:*?\\"<>|]+$');//文件夹是不能包含   \/:*?"<>|    这几个符号
        if(!reg.test(folder)){
            Tips.close({code:false,data:'Folder name is not in the right format'});
            return;
        }
        var data = {name:folder,path:curPath,user_id:uid};
        request('newFolder',data);
    };
    return{
        addfile:addfile,
        removeFile:removeFile,
        getUserRoot:getUserRoot,
        cut:cut,
        copy:copy,
        paste:paste,
        newfolder:newfolder
    };
})();
