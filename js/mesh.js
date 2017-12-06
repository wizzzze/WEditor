var Mesh = function(){
	this.indices = [];
	this.vertices = [];
	this.normals = [];
	this.uvs =[];
}


Mesh.prototype = {
	createMaterialBall : function(radius){
		var widthSegments = 24;
		var heightSegments = 24;

		var ix, iy;

		var index = 0;
		var grid = [];

		var vertex = new pc.Vec3();
		var normal = new pc.Vec3();

		// buffers

		var indices = [];
		var vertices = [];
		var normals = [];
		var uvs = [];

		// generate vertices, normals and uvs

		for ( iy = 0; iy <= heightSegments; iy ++ ) {

			var verticesRow = [];

			var v = iy / heightSegments;

			for ( ix = 0; ix <= widthSegments; ix ++ ) {

				var u = ix / widthSegments;

				// vertex

				vertex.x = - radius * Math.cos( u * Math.PI *2 ) * Math.sin( v * Math.PI );
				vertex.y = radius * Math.cos( 0 + v * Math.PI );
				vertex.z = radius * Math.sin( u * Math.PI * 2 ) * Math.sin( v * Math.PI );

				vertices.push( vertex.x, vertex.y, vertex.z );

				// normal

				normal.set( vertex.x, vertex.y, vertex.z ).normalize();
				normals.push( normal.x, normal.y, normal.z );

				// uv

				uvs.push( u, 1 - v );

				verticesRow.push( index ++ );

			}

			grid.push( verticesRow );

		}

		for ( iy = 0; iy < heightSegments; iy ++ ) {

			for ( ix = 0; ix < widthSegments; ix ++ ) {

				var a = grid[ iy ][ ix + 1 ];
				var b = grid[ iy ][ ix ];
				var c = grid[ iy + 1 ][ ix ];
				var d = grid[ iy + 1 ][ ix + 1 ];

				if ( iy !== 0 || thetaStart > 0 ) indices.push( a, b, d );
				if ( iy !== heightSegments - 1 ) indices.push( b, c, d );

			}

		}

		this.indices = indices;
		this.vertices = vertices;
		this.normals = normals;
		this.uvs = uvs;


	}


}