var AssetManager = function(editor, folder, container){
	this.editor = editor;
	this.folder = document.getElementById(folder);
	this.container = document.getElementById(container);
	this.uploadInput;
	this.initialize();
	this.data;
	this.folderData;
	this.containerData;
}



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
					self.addModel();
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

	addModel : function(){
		if(!this.uploadInput){
			this.uploadInput = document.createElement('input');
			this.uploadInput.type = 'file';
			this.uploadInput.onchange = function(){
				alert('upload file');
			};
		}

		this.uploadInput.click();
		this.editor.menuManager.destoryMenu();
	}

}