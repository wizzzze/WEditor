var Renderers = function(){
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



var Renderer = function(canvas, file){
	var gl = canvas.getContext('webgl');
	this.gl = gl;
	if(gl){
		gl.viewportWidth = canvas.clientWidth;
		gl.viewportHeight = canvas.clientHeight;
	}

	this.model = null;
	if(file.type == 'material'){
		var material = new Material();
		var mesh = new Mesh();
		mesh.createMaterialBall();
		this.model = new Model(mesh, material);
	}else if(file.type == 'mesh'){
		var material = new Material();
		var mesh = new Mesh();
		mesh.loadFromUrl();
		this.model = new Model(mesh, material);

	}else if(file.type == 'model'){
		var model = new Model();
		this.model = model;
	}

}

Renderer.prototype = function(){
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
	render : function(){

		this.setupShaders(this.gl);
	},
	destory : function(){

	},
}