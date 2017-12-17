var AssetManager = function(editor, folder, container){
	this.editor = editor;
	this.folder = document.getElementById(folder);
	this.folderScrollbar = new PerfectScrollbar(this.folder);
	this.container = document.getElementById(container);
	this.containerScrollbar = new PerfectScrollbar(this.container);

	this.root = new FolderNode(document.getElementById('folder_root'), this);
	this.currentSelectNode = this.root;

	this.uploadInput;


	this.textureUploadInput;
	this.textureUploadInput = document.createElement('input');
	this.textureUploadInput.type = 'file';
	this.textureUploadInput.multiple = "multiple";
	this.uploadInput.onchange = function(){
		var files = this.files;;
		var i = 0;
		while(i < files.length){
			var file = files[i];
			self.textureHandler(file);
			i++;
		}

	};

	this.textureUploadInput.accept = 'image/jpeg,image/png';


	this.initialize();

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
				html : '<i class="fa fa-tint"></i>  Material',
				callback : function(){
					self.add('material');
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
		folderHeader.innerHTML = '<div><i class="fa fa-chevron-circle-down" ></i> ASSETS</div>';
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

		document.querySelector('.center_bottom_panel').appendChild(folderHeader);
	},
	setData : function(data){
		if(this.data !== data){
			this.data = data;
			this.genNode(data, this.root);
		}
	},

	genNode : function(data ,currentNode){
		for(var i in data){
			var item = data[i];
			if(item.type === 'folder'){
				var dom = document.createElement('li');
				dom.innerHTML = "<div><i class='fa fa-folder'></i>  "+item.name+"</div>";
				var node = new FolderNode(dom, this);
				console.log(currentNode);
				currentNode.add(node);
				if(item.children){
					this.genNode(item.children, node);
				}
			}else if(item.type === 'material'){
				// var material = 
			}else if(item.type === 'texture'){

			}else if(item.type === 'model'){
				
			}

		}
	},
	showNode : function(){
		var children = this.currentNode.children;
	},

	add : function(type){
		var self  = this;
		if(type == 'folder'){
			var dom = document.createElement('li');
			dom.innerHTML = "<div><i class='fa fa-folder'></i>  New Folder</div>";
			var node = new FolderNode(dom, this);
			this.currentSelectNode.add(node);
		}else if(type == "material"){

			return;
		}else if(type == 'texture'){

		}else if(type == 'model'){
			if(!this.uploadInput){
				this.uploadInput = document.createElement('input');
				this.uploadInput.type = 'file';
				this.uploadInput.multiple = "multiple";
				this.uploadInput.onchange = function(){
					var files = this.files;;
					var i = 0;
					while(i < files.length){
						var file = files[i];
						self.queue.push(file);
						i++;
					}

					self.handlerQueue();
				};
			}else{
				this.uploadInput.files.length = 0;
				this.uploadInput.accept = '';
			}
			// this.uploadInput.accept = 'image/jpeg,image/png';
			

			this.uploadInput.click();
		}

		this.editor.menuManager.destroyMenu();
	},

	showChildren : function(){

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
			var model = new FbxReader(arrayBuffer);
		};
		this.reader.onerror = function(e){
			console.log(e);
		}

	},
	textureHandler : function(file){
		
	}
}




var FolderNode = function(dom, manager){
	var self = this;

	this.dom = dom;
	this.manager = manager;
	var childNodes = dom.childNodes;

	this.childContainer = null;
	for(var i in childNodes){
		var child = childNodes[i];
		if(child.tagName == 'DIV'){
			this.eventDom = child;
		}else if(child.tagName == "UL"){
			this.childContainer = child;
		}
	}


	this.eventDom.addEventListener('click', function(e){
		self.select();
	});

	this.hasChildFolder = false;
	this.children = [];

};


FolderNode.prototype = {
	add : function(node){
		if(! node instanceof FolderNode){
			console.error('node must be instanceof FolderNode');
		}

		if(this.childContainer === null){
			this.childContainer = document.createElement('ul');
			this.childContainer.classList.add('folder_list');
			this.dom.appendChild(this.childContainer);
			this.dom.classList.add('has_child');
		}
		this.childContainer.appendChild(node.dom);
		this.children.push(node);
	},
	select : function(){
		this.manager.currentSelectNode.eventDom.classList.remove('selected');
		this.eventDom.classList.add('selected');
		this.manager.currentSelectNode = this;
		this.manager.showChildren();
	},
	remove : function(){

	}
};