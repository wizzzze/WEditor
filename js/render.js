var Renders = function(){
	this.renders = {};
}


Renders.prototype = {
	createRender : function(canvas, file){
		var render = new Render(canvas, file);

		this.renders[file.id] = render;

	},
	destoryRender : function(render){
		delete this.renders[render.id];
		render.destory();
	}
}



var Render = function(canvas, file){

	var ctx = canvas.getContext('webgl');
	this.ctx = ctx;
	if(ctx){
		ctx.viewportWidth = canvas.clientWidth;
		ctx.viewportHeight = canvas.clientHeight;
	}

}

Render.prototype = function(){
	destory : function(){

	},
}