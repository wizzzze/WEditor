var menuId = 0;

var MenuManager = function(editor){
	this.menus = {};
	this.menusFrom = {};
	this.activeMenu = null;
	this.clientWidth = document.getElementById('editor').clientWidth;
	this.clientHeight = document.getElementById('editor').clientHeight;
	var self = this;
	document.body.addEventListener('click', function(event){
		// var target = event.target;
		if(!self.isMenu(event.target) && self.activeMenu){
			self.destroyMenu();
		}
	});
}

MenuManager.prototype = {
	createMenu : function(items, target, opts){
		var cache = (opts && opts.cache)?opts.cache:false;
		var menu = null;
		if(cache && this.menusFrom){
			for(var i in this.menusFrom){
				if(this.menusFrom[i] && this.menusFrom[i] === target){
					menu = this.menus[i];
				}
			}
		}
		if(!menu){
			menu = document.createElement('div');
			menu.classList.add('menu');
			var i = 0;
			while(i < items.length){
				var menuItem = new MenuItem(items[i], this);
				i++;
				menu.appendChild(menuItem); 
			}

			document.body.appendChild(menu);

			var menuWidth = opts && opts.width?opts.width:200;
			var menuHeight = menu.clientHeight;

			var position = this.calculatePos(target, menuWidth, menuHeight);
			menu.style.left = position.x +'px';
			menu.style.top = position.y +'px';

			menu.cache = cache;
			if(cache){
				this.menus[menuId] = menu;
				this.menusFrom[menuId] = target;
				menuId++;
			}
		}
		
		if(this.activeMenu && this.activeMenu != menu){
			this.destroyMenu();
		}

		this.activeMenu = menu;
		this.activeMenu.style.display = 'block';

	},

	destroyMenu: function(){
		if(this.activeMenu.cache){
			this.activeMenu.style.display = "none";
		}else{
			document.body.removeChild(this.activeMenu);
		}
		this.activeMenu = null;
	},

	clearMenus : function(){
		this.menus = {};
		this.menusFrom = {};
	},

	calculatePos : function(target, width, height){
		var x,y;
		if(!target.getBoundingClientRect){
			if(target.clientX + width <= this.clientWidth){
				x = target.clientX;
			}else{
				x = target.clientX - width;
			}
			if(target.clientY + height > this.clientHeight){
				y = this.clientHeight - height ;
			}else{
				y = target.clientY;
			}
		}else{
			var rectObject = target.getBoundingClientRect();
			var top = rectObject.top;
			var left = rectObject.left;
			var clientWidth = rectObject.width;
			var clientHeight = rectObject.height;
			if(left+clientWidth+width > this.clientWidth){
				x = left - width;
			}else{
				x = left;
			}
			if(top + height + clientHeight > this.clientHeight){
				y = this.clientHeight - height;
			}else{
				y = top + clientHeight;
			}
		}	


		return {x:x, y:y};
	},

	isMenu : function(node){
		do{
			if(node.classList && node.classList.contains('menu')){
				return true;
			}
		}while(node = node.parentNode)
		return false;
	}
};


var MenuItem = function(item, menu){
	if(item === 'separate'){
		var separate = document.createElement('hr');
		return separate;
	}
	var menuItem = document.createElement('div');
	menuItem.classList.add('menu_item');
	if(typeof item.html == 'string'){
		menuItem.innerHTML = item.html;
	}else{

		menuItem.innerHTML = item.html();
	}
	if(item.children){
		menuItem.innerHTML += "<i class='fa fa-caret-right child'></i>";
		menu.createMenu(item.children);
		menuItem.addEventListener('mouseover', function(){

		})
	}else if(item.callback){
		menuItem.addEventListener('click', function(){
			//do some action here;
			if(typeof item.html == 'function'){
				this.innerHTML = item.html();
			}
			item.callback();
		})
	}
	return menuItem;
}