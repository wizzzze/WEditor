var Folder = function(editor, node){

	var fragment = document.getElementById('folder_tpl').content;

	this.item =  fragment.cloneNode(true);
	this.item.querySelector('.file_name').innerText = node.name;

	this.dom = document.createElement('div');
	this.dom.append(this.item);
	this.node = node;
	this.name = node.name;
	this.nameDom = this.dom.childNodes[3];

	var self = this;

	this.dom.addEventListener('click', function(){
		editor.settingManager.load(self);
	});

	this.type = 'folder';
	
}

Folder.prototype = {
	setName : function(name){
		this.nameDom.innerText = name;
		this.node.setName(name);
	}
}