var GridHelper = function(device ,size, divisions){


	var center = divisions / 2;
	var step = size / divisions;
	var halfSize = size/2;


	var defaultColor = [155,155,155,255];
	var axisColor = [55, 55, 55, 255];

	var vertexDesc = [
        { semantic: pc.SEMANTIC_POSITION, components: 3, type: pc.TYPE_FLOAT32 },
        { semantic: pc.SEMANTIC_COLOR, components: 4, type: pc.TYPE_UINT8, normalize : true },
    ];

	var vertexFormat = new pc.VertexFormat(device, vertexDesc);

    console.log(vertexFormat.size);

	var numVertices  = (divisions + 1) * 4;
    var vertexBuffer = new pc.VertexBuffer(device, vertexFormat, numVertices);

    var buffer = vertexBuffer.lock();

    var vertexArray = new Float32Array(buffer, 0);
    // vertexArray.set(positions);

    var colorArray = new Uint8Array(buffer, vertexFormat.elements[1].offset);
    // colorArray.set(colors);
    // console.log(colorArray.byteLength);


	var positions = [],colors = [];
	var vIndex = 0;
	var cIndex = 0;
	var i;
	var color;
	for (i = -divisions / 2; i <= divisions / 2; i++ ) {
		color = i===0?axisColor:defaultColor;

		vertexArray[vIndex] = -size/2;
		vertexArray[vIndex+1] = -0;
		vertexArray[vIndex+2] = i * step;
		vIndex += 4;

		colorArray[cIndex] = color[0];
		colorArray[cIndex+1] = color[1];
		colorArray[cIndex+2] = color[2];
		colorArray[cIndex+3] = color[3];
		cIndex += 16;



		vertexArray[vIndex] = size/2;
		vertexArray[vIndex+1] = -0;
		vertexArray[vIndex+2] = i * step;
		vIndex +=4;

		colorArray[cIndex] = color[0];
		colorArray[cIndex+1] = color[1];
		colorArray[cIndex+2] = color[2];
		colorArray[cIndex+3] = color[3];
		cIndex += 16;



		vertexArray[vIndex] = i * step;
		vertexArray[vIndex+1] = -0;
		vertexArray[vIndex+2] = -size/2;
		vIndex += 4;

		colorArray[cIndex] = color[0];
		colorArray[cIndex+1] = color[1];
		colorArray[cIndex+2] = color[2];
		colorArray[cIndex+3] = color[3];
		cIndex += 16;



		vertexArray[vIndex] = i * step;
		vertexArray[vIndex+1] = -0;
		vertexArray[vIndex+2] = size/2;
		vIndex +=4;

		colorArray[cIndex] = color[0];
		colorArray[cIndex+1] = color[1];
		colorArray[cIndex+2] = color[2];
		colorArray[cIndex+3] = color[3];
		cIndex += 16;
		

	}


    // var vertexArray = new Float32Array(vertexBuffer.lock(), 0, numVertices);
    // vertexArray.set(positions);
    // console.log(vertexArray.byteLength);

    // var colorArray = new Uint8Array(vertexBuffer.lock(), positions.length * 4 );
    // colorArray.set(colors);
    // console.log(colorArray.byteLength);

    vertexBuffer.unlock();

    var mesh = new pc.Mesh();
    mesh.vertexBuffer = vertexBuffer;
    mesh.indexBuffer[0] = null;
    mesh.primitive[0].type = pc.PRIMITIVE_LINES;
    mesh.primitive[0].base = 0;
    mesh.primitive[0].count =  vertexBuffer.getNumVertices();
    mesh.primitive[0].indexed = false;

    var library = device.getProgramLibrary();
    var shader = library.getProgram('basic', {vertexColors:true, diffuseMapping: false});
    var material = new pc.Material();

    material.shader = shader;
    // material.color.set(1,1,1);

    // material.update();

    var node = new pc.GraphNode('gridHelper');

    var meshInstance = new pc.MeshInstance(node, mesh, material);
    meshInstance.mask = 8;

    var model = new pc.Model();

    model.graph = node;
    model.meshInstances.push(meshInstance);

    return model;
}