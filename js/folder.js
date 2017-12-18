var Folder = function(node){

	var fragment = document.getElementById('folder_tpl').content;

	item =  fragment.cloneNode(true);
	item.querySelector('.file_name').innerText = node.name;

	this.dom = document.createElement('div');
	this.dom.append(item);
	this.node = node;
	
}