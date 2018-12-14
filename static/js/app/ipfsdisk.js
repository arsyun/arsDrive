var backlist = [];
var aheadlist = [];
var curPath = '';
var ctrldown = false;
var newFolder = false;
$(document).on("keydown",function(e){
    if(e.key==="Control"){
        ctrldown = true;
    }
});
$(document).on("keyup",function(e){
    if(e.key==="Control"){
        ctrldown = false;
    }
});
$(document).ready(function(){
    init();
});

function init(){
    getFileList(curPath);
    navigation(curPath);
    bindinit();
}
function bindinit(){
    $("#file-list").on("dblclick",".open-folder",function(){  
        var parent = $(this).parent();
        var path = parent.attr('data-path');
        gotoPath(curPath+path);
    });
    $("#file-list").on("dblclick",".open-file",function(){  
        var root =  IPFS.getUserRoot();
        var path = $(this).parent().attr('data-path');
        window.open("/ipfs/"+root+'/'+curPath+path);
    });
    $("#yarnball-show").on("click","li a",function(){  
        var path = $(this).attr('data-path');
        gotoPath(path);
    });
    $("#home").click(function(){  
        gotoPath('');
    });
    $("#file-list").on("mouseover",".file",function(){
        $(this).addClass("hover");
    });
    $("#file-list").on("mouseleave",".file",function(){
        $(this).removeClass("hover");
    });
    $(".bodymain").click(function(){
        if(newFolder){
            return;
        }
        var ss = $(".file.hover");
        var sel = false;
        if(ss.length>0){
            sel = ss.hasClass("select");
        }
        if(!ctrldown){
            $(".file").removeClass("select");
        }
        if(ss.length > 0 && !sel){
            $(".select-button-show").removeClass('hidden');
            ss.addClass("select");
            if($(".file.select").length===1){
                if($(".file.select").first().hasClass("file-box")){
                    $("#download-btn").removeClass("disabled");
                }else{
                    $("#download-btn").addClass("disabled");
                }
                $("#share-btn").removeClass("disabled");
            }else{
                $("#download-btn").addClass("disabled");
                $("#share-btn").addClass("disabled");
            }
        }else{
            $(".select-button-show").addClass('hidden');
        }
    });
    $("#btn-history-back").click(function(){
        goback();
    });
    $("#btn-history-next").click(function(){
        goahead();
    });
    $("#goto-father").click(function(){
        goUpPath();
    });
    $("#file-list").on("blur","#pathRenameTextarea",function(){
        newFolder = false;
        $("#newfolder").addClass("hidden").removeClass("select");
        var name = $(this).val().replace(/\s*/g, '');
        IPFS.newfolder(name);
    });
    $(".tools .btn").click(function(){
        var action = $(this).attr("data-action");
        switch(action){
            case "add":$('#addFileModal').modal();break;
            case "remove":IPFS.removeFile();break;
            case "copy": 
                IPFS.copy();
                $("#btn-paste").removeClass("hidden");
                break;
            case "cut": 
                IPFS.cut();
                $("#btn-paste").removeClass("hidden");
                break;
            case "paste":
                IPFS.paste();
                $("#btn-paste").addClass("hidden");
                break;
            case "newfolder":
                newFolder = true;
                $(".file").removeClass("select");
                $("#newfolder").removeClass("hidden").addClass("select");
                $("#pathRenameTextarea").focus();
                break;
            case "download":
                var root =  IPFS.getUserRoot();
                var file = $(".file.select").first().attr("data-path");
                var url = "/ipfs/"+root+'/'+curPath+file;
                $("#downl").attr('href',url);
                $("#downl").attr('download',file);
                $("#downl").children("span").first().click();
                break;
            case "upload":
                $("#fileToUpload").trigger("click");
                break;
        }
        
    });
    $("#btn_submit").on("click",null,function(){
        var add_name = $("#add_name").val().replace(/\s*/g, '');
        var add_hash = $("#add_hash").val().replace(/\s*/g, '');
        if(add_name === ""){
            $("#name_err").text("Name is empty");
        }
        var reg = new RegExp('^[A-Za-z0-9]{46}$');
        if(!reg.test(add_hash)){
            $("#hash_err").text("Hash is not in the right format");
            return;
        }
        
        $("#add_hash").val('');
        $("#add_name").val("");
        $("#name_err").text("");
        $("#hash_err").text("");
        IPFS.addfile(encodeURI(add_name),add_hash);
        $('#addFileModal').modal("hide");
    });
    $("#upload_cancel").on("click",null,function(){
        FileUpload.cancel();
    });
    $("#upload_pause").on("click",null,function(){
        FileUpload.pause();
    });
    $("#logout-btn").on("click",null,function(){
        logout();
    });
    var clipboard = new ClipboardJS('#share-btn', {
        text: function() {
            var t = $('.file.select').first()
            return self.location.href+'ipfs/'+t.attr("data-hash")+"?"+t.attr("data-path")
        }
    });
    clipboard.on('success', function(e) {
        Tips.close({code:true,data:'Copied share-link to Clipboard'});
    });
}
function gotoPath(path){
    backlist.push(curPath);
    curPath = path===''?'':path+'/';
    aheadlist=[];
    getFileList(path);
    navigation(path);
}
function goUpPath(){
    if(curPath==='/'||curPath===''){
        return;
    }
    var path = curPath.substring(0,curPath.length-2);
    var i = path.lastIndexOf('/');
    var upPath = path.substring(0,i);
    gotoPath(upPath);
}
function goback(){
    if(backlist.length<1){
        return;
    }
    aheadlist.push(curPath);
    curPath = backlist.pop();
    getFileList(curPath);
    navigation(curPath);
}
function goahead(){
    if(aheadlist.length<1){
        return;
    }
    backlist.push(curPath);
    curPath = aheadlist.pop();
    getFileList(curPath);
    navigation(curPath);
}
function htmlview(data){
    var folder_list = [];
    var file_list = [];
    data.forEach(function(value){
        var index = value.Name.lastIndexOf(".");
        if( index > 0){
            var postf = value.Name.substring(index+1);
            var str = '<div data-hash="'+value.Hash+'" data-path="'+ value.Name +'" class="file  file-box menu-folder"  data-size="'+value.size+'">'+
                        '<div class="item-select"><div class="item-check"></div></div>'+
                        //'<div class="item-menu"><div class="cert"></div></div>'+
                        '<div class="ico open-file" filetype="'+ postf +'"><i class="x-item-file x-'+ postf +'"></i></div>'+
                        '<div class="filename"><span class="title db-click-rename" title="">'+value.Name +'</span></div></div>';
            file_list.push(str);
        }else{
            var str = '<div data-hash="'+value.Hash+'" data-path="'+value.Name+'" class="file  folder-box menu-folder"  data-size="'+value.size+'">'+
                        '<div class="item-select"><div class="item-check"></div></div>'+
                       // '<div class="item-menu"><div class="cert"></div></div>'+
                        '<div class="ico open-folder" filetype="folder"><i class="x-item-file x-folder"></i></div>'	+
                        '<div class="filename"><span class="title db-click-rename" title="">'+value.Name +'</span></div></div>';
            folder_list.push(str);
        }
    });
    var html = "";
    folder_list.forEach(function(value){
        html = html + value;
    });
    file_list.forEach(function(value){
        html = html + value;
    });
    html = html + '<div id="newfolder" data-hash="" data-path="" class="file  folder-box menu-folder  file-icon-edit hidden"  data-size="0">'+
                        '<div class="item-select"><div class="item-check"></div></div>'+
                        '<div class="ico open-folder" filetype="folder"><i class="x-item-file x-folder"></i></div>'	+
                        '<div class="filename"><span class="title db-click-rename" ><div class="textarea"><input class="fix" id="pathRenameTextarea" value=""/></div></span></div></div>';
    for(var n=0;n<20;n++){
        html = html + '<div class="flex-empty"></div>';
    }
    $('#file-list').empty();
    $('#file-list').html(html);
}
function navigation(path){
    if(backlist.length>0){
        $("#btn-history-back").removeClass("disable");
    }else{
        $("#btn-history-back").addClass("disable");
    }
    if(aheadlist.length>0){
        $("#btn-history-next").removeClass("disable");
    }else{
        $("#btn-history-next").addClass("disable");
    }
    if(path===''||path==='/'){
        $('#yarnball-show').empty();
        return;
    }
    var arr = path.split("/");
    var i = arr.length;
    var html='',vpath = '';
    var n = 0;
    var first = ' first';
    while(n < i){
        if(arr[n]!==''){
            vpath = vpath === ''?arr[n]:vpath +'/' +arr[n];
            html = html+ '<li class="yarnlet'+ first +'"><a title="'+ vpath+'" data-path="'+vpath+'" style="z-index:'+(i-n)+';"><span class="left-yarn"></span><span class="title-name">'+arr[n]+'</span></a></li>';
            first = '';
        }
        n++;
    }
    $('#yarnball-show').html(html);
}

function getFileList(path){
    var postdata = {path:path};
    $.ajax({
        type: 'post',
        url:'/api/getFileList',
        dataType: 'json',
        data:postdata,
        beforeSend:function(){
            openLoading();
        },
        success: function(result) {
            closeLoading();
            if(result.success >= 0){
                htmlview(result.data);
            }else{
                Tips.close({code:false,data:result.describe});
            }
        },
        error:function(){
            closeLoading();
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
        $('#uploadFileModal').modal({backdrop: 'static', keyboard: false});
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
                $('#uploadFileModal').modal('hide');
            }
        }catch (e) {

        }
        
    };
    var _uploadFailed = function(evt){
        
    };
    var pauseUpload = function(){
        _stop = !_stop;  //can't pause
    };
    var cancel = function(){
        xhr.abort();
        $('#uploadFileModal').modal('hide');
    };
    return{
        start:_init,
        pause:pauseUpload,
        cancel:cancel
    };
})();

function openLoading(){
    $('#loading').css("display",'inline');
}
function closeLoading(){
    $('#loading').css("display",'none');
}
function bytesToSize(bytes) {
    if (bytes <= 0) return '0 B';
    var k = 1024;
    sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    i = Math.floor(Math.log(bytes) / Math.log(k));
    var num = bytes / Math.pow(k, i);
    return num.toPrecision(3) + sizes[i];
    //toPrecision(3) 后面保留一位小数，如1.0GB 
}
var Tips =  (function(){
	var inTime  = 400;
	var delay = 1000;
	var staticPath = "./static/";
        var UUID = function(){
                return 'uuid_'+Math.ceil(Math.random()*10000);
        };
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
				if ($(tipsID).css('display') === "none") return;
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
			case 100:delay = 2000;//加长时间 5s
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
		if (msg !== undefined) self.find('.tips-msg p').html(msg);
		$(tipsID).show().css({'left':($(window).width() - $(tipsID).innerWidth())/2});
		return self;
	};
	var tips = function(msg,code){
		if (msg && typeof(msg) === 'object'){
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
		if ($self.length === 0) {
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
    var files =null;
    var addfile = function(name,hash){
        var data = {name:encodeURI(name),hash:hash,path:curPath};
        request('addFile',data);
    };
    var getUserRoot = function(){
        var data = {};
        return getdata('getUserRoot',data);
    };
    var removeFile = function(){
        var sel=[];
        $('.file.select').each( function(index,val){
            sel.push(encodeURI($(val).attr("data-path")));
        });
        if(sel.length===0){
            return;
        }
        var ff = {path:curPath,files:sel};
        var data = {files:JSON.stringify(ff)};
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
    var getdata = function(cmd,data){
        var res = null;
        $.ajax({
            type: 'post',
            url:'./api/'+cmd,
            dataType: 'json',
            async:false, 
            data:data,
            success: function(result) {
                if(result.success >= 0){
                    res=result.data;
                }
            },
            error:function(){
                res='error';
            }
        });
        return res;
    };
    var selectFiles = function(){
        var sel=[];
        $('.file.select').each( function(index,val){
            sel.push({name:encodeURI($(val).attr("data-path")),hash:$(val).attr("data-hash")});
        });
        files = {path:curPath,files:sel};
    };
    var copy = function(){
        command = "copyFiles";
        selectFiles();
    };
    var cut = function(){
        command = "moveFiles";
        selectFiles();
    };
    var paste = function(){
        var filesStr = JSON.stringify(files);
        var data = {command:command,path:curPath,data:filesStr};
        request(command,data);
    };
    var newfolder = function(folder){
        if(folder==='')return;
        var reg = new RegExp('^[^\\\\\\/:*?\\"<>|]+$');//文件夹是不能包含   \/:*?"<>|    这几个符号
        if(!reg.test(folder)){
            Tips.close({code:false,data:'Folder name is not in the right format'});
            return;
        }
        var data = {name:folder,path:curPath};
        request("newFolder",data);
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