var Renderers = function(editor){
	this.renderers = {};
}


Renderers.prototype = {
	createRender : function(canvas, file){
		var renderer = new Renderer(canvas, file);

		this.renderers[file.id] = renderer;

	},
	destoryRenderer : function(render){
		delete this.renders[render.id];
		renderer.destory();
	}
}



var Renderer = function(canvas, model){
	var gl = canvas.getContext('webgl');
	this.gl = gl;
	if(gl){
		gl.viewportWidth = canvas.clientWidth;
		gl.viewportHeight = canvas.clientHeight;
	}

	this.model = model;
	

}

Renderer.prototype = {
	setupShaders : function(gl){
	  	var vertexShaderSource = 
	    "attribute vec3 aVertexPosition;                 \n" +
	    "void main() {                                   \n" +
	    "  gl_Position = vec4(aVertexPosition, 1.0);     \n" +
	    "}                                               \n";           
	   
	   	var fragmentShaderSource = 
	     "precision mediump float;                    \n"+
	     "void main() {                               \n"+
	     "  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);  \n"+
	     "}                                           \n";
	     
	  	var vertexShader = loadShader(gl.VERTEX_SHADER, vertexShaderSource);
	  	var fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
	  
	  	shaderProgram = gl.createProgram();
	  	gl.attachShader(shaderProgram, vertexShader);
	  	gl.attachShader(shaderProgram, fragmentShader);
	  	gl.linkProgram(shaderProgram);

	  	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	    	alert("Failed to setup shaders");
	  	}

	  	gl.useProgram(shaderProgram);
	  
	  	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition"); 
	},
	draw : function(){
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clearColor(gl.COLOR_BUFFER_BIT);
		
		this.setupShaders(this.gl);
	},
	destory : function(){

	},
}