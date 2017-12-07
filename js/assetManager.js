var AssetManager = function(editor, folder, container){
	this.editor = editor;
	this.folder = document.getElementById(folder);
	this.container = document.getElementById(container);
	this.uploadInput;
	this.initialize();
	this.data;
	this.folderData;
	this.containerData;

	this.queue = [];
	this.reader = new FileReader();

	var self = this;
	this.reader.onloadend = function(){
		self.handlerQueue();
	}
}
//模型、贴图数据使用fileReader读取，用户通过编辑器主动上传至服务器。

AssetManager.prototype = {
	folderMenu : function(){
		var self = this;
		return [
			{
				html : '<i class="fa fa-folder-o"></i>  Folder',
				callback : function(){
					self.add('folder');
				}
			},
			{
				html : '<i class="fa fa-cube"></i>  Model',
				callback : function(){
					self.add('model');
				}
			},
			{
				html : '<i class="fa fa-image"></i>  Texture',
				callback : function(){
					self.add('texture');
				}
			},
		];
	},
	initialize : function(){
		var self = this;
		var folderHeader = document.createElement('div');
		folderHeader.innerHTML = '<i class="fa fa-chevron-circle-down" ></i> ASSETS';
		folderHeader.classList.add('assets_hierarchy_header','panel_header');

		var folderToolbar = document.createElement('div');
		folderToolbar.classList.add('tool_bar');

		var folderAddBtn = document.createElement('a');
		folderAddBtn.innerHTML = '<i class="fa fa-plus"></i>';
		folderToolbar.appendChild(folderAddBtn);

		folderAddBtn.addEventListener('click', function(event){
			event.stopPropagation();
			var target = event.target;
			self.editor.menuManager.createMenu(self.folderMenu(), folderAddBtn, {
				cache : true,
			});
		})

		var folderRemoveBtn = document.createElement('a');
		folderRemoveBtn.innerHTML = '<i class="fa fa-trash"></i>';
		folderToolbar.appendChild(folderRemoveBtn);

		var folderThBtn = document.createElement('a');
		folderThBtn.innerHTML = '<i class="fa fa-th"></i>';
		folderToolbar.appendChild(folderThBtn);

		var folderThLargeBtn = document.createElement('a');
		folderThLargeBtn.innerHTML = '<i class="fa fa-th-large"></i>';
		folderToolbar.appendChild(folderThLargeBtn);

		var folderSearch = document.createElement('div');
		folderSearch.classList.add('header_input');
		folderSearch.innerHTML = '<input type="text" placeholder="Search"><i class="fa fa-search"></i>';
		folderToolbar.appendChild(folderSearch);


		var modelLibary = document.createElement('a');
		modelLibary.innerHTML = '<i class="fa fa-cube"></i>  Models';
		folderToolbar.appendChild(modelLibary);

		var materialLibary = document.createElement('a');
		materialLibary.innerHTML = '<i class="fa fa-tint"></i>  Materials';
		folderToolbar.appendChild(materialLibary);

		folderHeader.appendChild(folderToolbar);

		this.folder.appendChild(folderHeader);
	},
	setData : function(data){
		if(this.data !== data){
			this.data = data;
			// this.dataChanged();
		}
	},
	dataChanged : function(){
		var data = this.loadFromData(this.data);
		this.folderData = data.folderData;
		this.containerData = data.containerData;
	},
	loadFromData : function(data){
		var floderData = [],containerData = [];

		for(var i in data){
			var item = data[i];
			if(item.type === 'folder'){
				folderData.push()
			}
		}
	},

	genFolder : function(){
		if(!this.folderDOM){
			this.folderDOM = document.createElement('ul');
			this.folderDOM.classList.add('folder_list');
		}
		for(var i in this.data){
			var item = this.data[i];

		}
	},
	add : function(type){
		var self  = this;
		if(type == 'folder'){

			return ;
		}

		if(!this.uploadInput){
			this.uploadInput = document.createElement('input');
			this.uploadInput.type = 'file';
			this.uploadInput.multiple = "multiple";
			this.uploadInput.onchange = function(){
				var files = this.files;
				console.log(files);
				var i = 0;
				while(i < files.length){
					var file = files[i];
					this.queue.push(file);
					i++;
				}
			};
		}else{
			this.uploadInput.files.length = 0;
		}

		if(type == 'model'){
			this.uploadInput.accept = '';

		}else if(type == 'texture'){
			this.uploadInput.accept = 'image/jpeg,image/png';
		}


		this.uploadInput.click();
		this.editor.menuManager.destoryMenu();
	},

	handlerQueue : function(){
		var file = this.queue.shift();
		if(!file){
			return;
		}
		var fileName = file.name;
		var ext = (fileName.split('.')).pop();
		if(ext.toLowerCase() == 'fbx'){
			var model = this.readFbxFile(file);
		}else if(ext.toLowerCase() == 'obj'){
			var model = ObjReader(file, this.reader);
		}else if(ext.toLowerCase() == 'png'){

		}else if(ext.toLowerCase() == 'jpg'){

		}
	},

	readFbxFile : function(file){
		this.reader.readAsArrayBuffer(file);
		this.reader.onprogress = function(progress){
			console.log(progress);
		};
		this.reader.onload = function(data){
			var arrayBuffer = data.target.result;
			console.log(arrayBuffer);
		};
		this.reader.onerror = function(e){
			console.log(e);
		}

	}

}