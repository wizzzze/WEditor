var FbxReader = function(arrayBuffer){
	this.FBXTree;
	if ( this.isFbxFormatBinary( arrayBuffer ) ) {

		this.FBXTree = new BinaryParser().parse( arrayBuffer );

	} else {

		var FBXText = this.convertArrayBufferToString( arrayBuffer );

		if ( ! isFbxFormatASCII( FBXText ) ) {

			throw 'THREE.FBXLoader: Unknown format.' ;

		}

		if ( getFbxVersion( FBXText ) < 7000 ) {

			throw 'THREE.FBXLoader: FBX version not supported, FileVersion: ' + getFbxVersion( FBXText ) ;
		}

		this.FBXTree = new TextParser().parse( FBXText );

	}
	console.log(this.FBXTree);

	var connections = this.parseConnections( FBXTree );
	// var images = parseImages( FBXTree );
	// var textures = parseTextures( FBXTree, new THREE.TextureLoader( this.manager ).setPath( resourceDirectory ), images, connections );
	var materials = this.parseMaterials( FBXTree, connections );
	// var deformers = parseDeformers( FBXTree, connections );
	// var geometryMap = parseGeometries( FBXTree, connections, deformers );
	// var sceneGraph = parseScene( FBXTree, connections, deformers, geometryMap, materials );

	return sceneGraph;
}


FbxReader.prototype = {
	isFbxFormatBinary : function( buffer ) {

		var CORRECT = 'Kaydara FBX Binary  \0';

		return buffer.byteLength >= CORRECT.length && CORRECT === this.convertArrayBufferToString( buffer, 0, CORRECT.length );

	},
	convertArrayBufferToString : function( buffer, from, to ) {

		if ( from === undefined ) from = 0;
		if ( to === undefined ) to = buffer.byteLength;

		var array = new Uint8Array( buffer, from, to );

		if ( window.TextDecoder !== undefined ) {

			return new TextDecoder().decode( array );

		}

		var s = '';

		for ( var i = 0, il = array.length; i < il; i ++ ) {

			s += String.fromCharCode( array[ i ] );

		}

		return s;
	},
	parseConnections : function( FBXTree ) {

		/**
		 * @type {Map<number, { parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>}
		 */
		var connectionMap = new Map();

		if ( 'Connections' in FBXTree ) {

			/**
			 * @type {[number, number, string][]}
			 */
			var connectionArray = FBXTree.Connections.properties.connections;
			for ( var connectionArrayIndex = 0, connectionArrayLength = connectionArray.length; connectionArrayIndex < connectionArrayLength; ++ connectionArrayIndex ) {

				var connection = connectionArray[ connectionArrayIndex ];

				if ( ! connectionMap.has( connection[ 0 ] ) ) {

					connectionMap.set( connection[ 0 ], {
						parents: [],
						children: []
					} );

				}

				var parentRelationship = { ID: connection[ 1 ], relationship: connection[ 2 ] };
				connectionMap.get( connection[ 0 ] ).parents.push( parentRelationship );

				if ( ! connectionMap.has( connection[ 1 ] ) ) {

					connectionMap.set( connection[ 1 ], {
						parents: [],
						children: []
					} );

				}

				var childRelationship = { ID: connection[ 0 ], relationship: connection[ 2 ] };
				connectionMap.get( connection[ 1 ] ).children.push( childRelationship );

			}

		}

		return connectionMap;

	},

	/**
	 * Parses map of Material information.
	 * @param {{Objects: {subNodes: {Material: Object.<number, FBXMaterialNode>}}}} FBXTree
	 * @param {Map<number, THREE.Texture>} textureMap
	 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
	 * @returns {Map<number, THREE.Material>}
	 */
	parseMaterials : function ( FBXTree, connections ) {

		var materialMap = new Map();

		if ( 'Material' in FBXTree.Objects.subNodes ) {

			var materialNodes = FBXTree.Objects.subNodes.Material;
			for ( var nodeID in materialNodes ) {

				var material = parseMaterial( materialNodes[ nodeID ], textureMap, connections );
				if ( material !== null ) materialMap.set( parseInt( nodeID ), material );

			}

		}

		return materialMap;

	},

	function parseMaterial( materialNode, connections ) {

		var FBX_ID = materialNode.id;
		var name = materialNode.attrName;
		var type = materialNode.properties.ShadingModel;

		//Case where FBX wraps shading model in property object.
		if ( typeof type === 'object' ) {

			type = type.value;

		}

		// Seems like FBX can include unused materials which don't have any connections.
		// Ignores them so far.
		if ( ! connections.has( FBX_ID ) ) return null;

		var children = connections.get( FBX_ID ).children;

		//Because we use pbr system, and fbx does't support, so here we gonna just use a default material to replace the original material
		var material = ;

		material.name = name;
		return material;

	}
}

function TextParser() {}

Object.assign( TextParser.prototype, {

	getPrevNode: function () {

		return this.nodeStack[ this.currentIndent - 2 ];

	},

	getCurrentNode: function () {

		return this.nodeStack[ this.currentIndent - 1 ];

	},

	getCurrentProp: function () {

		return this.currentProp;

	},

	pushStack: function ( node ) {

		this.nodeStack.push( node );
		this.currentIndent += 1;

	},

	popStack: function () {

		this.nodeStack.pop();
		this.currentIndent -= 1;

	},

	setCurrentProp: function ( val, name ) {

		this.currentProp = val;
		this.currentPropName = name;

	},

	// ----------parse ---------------------------------------------------
	parse: function ( text ) {

		this.currentIndent = 0;
		this.allNodes = new FBXTree();
		this.nodeStack = [];
		this.currentProp = [];
		this.currentPropName = '';

		var split = text.split( '\n' );

		for ( var lineNum = 0, lineLength = split.length; lineNum < lineLength; lineNum ++ ) {

			var l = split[ lineNum ];

			// skip comment line
			if ( l.match( /^[\s\t]*;/ ) ) {

				continue;

			}

			// skip empty line
			if ( l.match( /^[\s\t]*$/ ) ) {

				continue;

			}

			// beginning of node
			var beginningOfNodeExp = new RegExp( '^\\t{' + this.currentIndent + '}(\\w+):(.*){', '' );
			var match = l.match( beginningOfNodeExp );

			if ( match ) {

				var nodeName = match[ 1 ].trim().replace( /^"/, '' ).replace( /"$/, '' );
				var nodeAttrs = match[ 2 ].split( ',' );

				for ( var i = 0, l = nodeAttrs.length; i < l; i ++ ) {

					nodeAttrs[ i ] = nodeAttrs[ i ].trim().replace( /^"/, '' ).replace( /"$/, '' );

				}

				this.parseNodeBegin( l, nodeName, nodeAttrs || null );
				continue;

			}

			// node's property
			var propExp = new RegExp( '^\\t{' + ( this.currentIndent ) + '}(\\w+):[\\s\\t\\r\\n](.*)' );
			var match = l.match( propExp );

			if ( match ) {

				var propName = match[ 1 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();
				var propValue = match[ 2 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();

				// for special case: base64 image data follows "Content: ," line
				//	Content: ,
				//	 "iVB..."
				if ( propName === 'Content' && propValue === ',' ) {

					propValue = split[ ++ lineNum ].replace( /"/g, '' ).trim();

				}

				this.parseNodeProperty( l, propName, propValue );
				continue;

			}

			// end of node
			var endOfNodeExp = new RegExp( '^\\t{' + ( this.currentIndent - 1 ) + '}}' );

			if ( l.match( endOfNodeExp ) ) {

				this.nodeEnd();
				continue;

			}

			// for special case,
			//
			//	  Vertices: *8670 {
			//		  a: 0.0356229953467846,13.9599733352661,-0.399196773.....(snip)
			// -0.0612030513584614,13.960485458374,-0.409748703241348,-0.10.....
			// 0.12490539252758,13.7450733184814,-0.454119384288788,0.09272.....
			// 0.0836158767342567,13.5432004928589,-0.435397416353226,0.028.....
			//
			// in these case the lines must continue from the previous line
			if ( l.match( /^[^\s\t}]/ ) ) {

				this.parseNodePropertyContinued( l );

			}

		}

		return this.allNodes;

	},

	parseNodeBegin: function ( line, nodeName, nodeAttrs ) {

		// var nodeName = match[1];
		var node = { 'name': nodeName, properties: {}, 'subNodes': {} };
		var attrs = this.parseNodeAttr( nodeAttrs );
		var currentNode = this.getCurrentNode();

		// a top node
		if ( this.currentIndent === 0 ) {

			this.allNodes.add( nodeName, node );

		} else {

			// a subnode

			// already exists subnode, then append it
			if ( nodeName in currentNode.subNodes ) {

				var tmp = currentNode.subNodes[ nodeName ];

				// console.log( "duped entry found\nkey: " + nodeName + "\nvalue: " + propValue );
				if ( this.isFlattenNode( currentNode.subNodes[ nodeName ] ) ) {


					if ( attrs.id === '' ) {

						currentNode.subNodes[ nodeName ] = [];
						currentNode.subNodes[ nodeName ].push( tmp );

					} else {

						currentNode.subNodes[ nodeName ] = {};
						currentNode.subNodes[ nodeName ][ tmp.id ] = tmp;

					}

				}

				if ( attrs.id === '' ) {

					currentNode.subNodes[ nodeName ].push( node );

				} else {

					currentNode.subNodes[ nodeName ][ attrs.id ] = node;

				}

			} else if ( typeof attrs.id === 'number' || attrs.id.match( /^\d+$/ ) ) {

				currentNode.subNodes[ nodeName ] = {};
				currentNode.subNodes[ nodeName ][ attrs.id ] = node;

			} else {

				currentNode.subNodes[ nodeName ] = node;

			}

		}

		// for this		  ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
		// NodeAttribute: 1001463072, "NodeAttribute::", "LimbNode" {
		if ( nodeAttrs ) {

			node.id = attrs.id;
			node.attrName = attrs.name;
			node.attrType = attrs.type;

		}

		this.pushStack( node );

	},

	parseNodeAttr: function ( attrs ) {

		var id = attrs[ 0 ];

		if ( attrs[ 0 ] !== '' ) {

			id = parseInt( attrs[ 0 ] );

			if ( isNaN( id ) ) {

				// PolygonVertexIndex: *16380 {
				id = attrs[ 0 ];

			}

		}

		var name = '', type = '';

		if ( attrs.length > 1 ) {

			name = attrs[ 1 ].replace( /^(\w+)::/, '' );
			type = attrs[ 2 ];

		}

		return { id: id, name: name, type: type };

	},

	parseNodeProperty: function ( line, propName, propValue ) {

		var currentNode = this.getCurrentNode();
		var parentName = currentNode.name;

		// special case parent node's is like "Properties70"
		// these children nodes must treat with careful
		if ( parentName !== undefined ) {

			var propMatch = parentName.match( /Properties(\d)+/ );
			if ( propMatch ) {

				this.parseNodeSpecialProperty( line, propName, propValue );
				return;

			}

		}

		// special case Connections
		if ( propName === 'C' ) {

			var connProps = propValue.split( ',' ).slice( 1 );
			var from = parseInt( connProps[ 0 ] );
			var to = parseInt( connProps[ 1 ] );

			var rest = propValue.split( ',' ).slice( 3 );

			propName = 'connections';
			propValue = [ from, to ];
			append( propValue, rest );

			if ( currentNode.properties[ propName ] === undefined ) {

				currentNode.properties[ propName ] = [];

			}

		}

		// special case Connections
		if ( propName === 'Node' ) {

			var id = parseInt( propValue );
			currentNode.properties.id = id;
			currentNode.id = id;

		}

		// already exists in properties, then append this
		if ( propName in currentNode.properties ) {

			// console.log( "duped entry found\nkey: " + propName + "\nvalue: " + propValue );
			if ( Array.isArray( currentNode.properties[ propName ] ) ) {

				currentNode.properties[ propName ].push( propValue );

			} else {

				currentNode.properties[ propName ] += propValue;

			}

		} else {

			// console.log( propName + ":  " + propValue );
			if ( Array.isArray( currentNode.properties[ propName ] ) ) {

				currentNode.properties[ propName ].push( propValue );

			} else {

				currentNode.properties[ propName ] = propValue;

			}

		}

		this.setCurrentProp( currentNode.properties, propName );

	},

	// TODO:
	parseNodePropertyContinued: function ( line ) {

		this.currentProp[ this.currentPropName ] += line;

	},

	parseNodeSpecialProperty: function ( line, propName, propValue ) {

		// split this
		// P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
		// into array like below
		// ["Lcl Scaling", "Lcl Scaling", "", "A", "1,1,1" ]
		var props = propValue.split( '",' );

		for ( var i = 0, l = props.length; i < l; i ++ ) {

			props[ i ] = props[ i ].trim().replace( /^\"/, '' ).replace( /\s/, '_' );

		}

		var innerPropName = props[ 0 ];
		var innerPropType1 = props[ 1 ];
		var innerPropType2 = props[ 2 ];
		var innerPropFlag = props[ 3 ];
		var innerPropValue = props[ 4 ];

		/*
		if ( innerPropValue === undefined ) {
			innerPropValue = props[3];
		}
		*/

		// cast value in its type
		switch ( innerPropType1 ) {

			case 'int':
				innerPropValue = parseInt( innerPropValue );
				break;

			case 'double':
				innerPropValue = parseFloat( innerPropValue );
				break;

			case 'ColorRGB':
			case 'Vector3D':
				innerPropValue = parseFloatArray( innerPropValue );
				break;

		}

		// CAUTION: these props must append to parent's parent
		this.getPrevNode().properties[ innerPropName ] = {

			'type': innerPropType1,
			'type2': innerPropType2,
			'flag': innerPropFlag,
			'value': innerPropValue

		};

		this.setCurrentProp( this.getPrevNode().properties, innerPropName );

	},

	nodeEnd: function () {

		this.popStack();

	},

	/* ---------------------------------------------------------------- */
	/*		util													  */
	isFlattenNode: function ( node ) {

		return ( 'subNodes' in node && 'properties' in node ) ? true : false;

	}

} );


function BinaryParser() {}

Object.assign( BinaryParser.prototype, {

	/**
	 * Parses binary data and builds FBXTree as much compatible as possible with the one built by TextParser.
	 * @param {ArrayBuffer} buffer
	 * @returns {THREE.FBXTree}
	 */
	parse: function ( buffer ) {

		var reader = new BinaryReader( buffer );
		reader.skip( 23 ); // skip magic 23 bytes

		var version = reader.getUint32();

		console.log( 'THREE.FBXLoader: FBX binary version: ' + version );

		var allNodes = new FBXTree();

		while ( ! this.endOfContent( reader ) ) {

			var node = this.parseNode( reader, version );
			if ( node !== null ) allNodes.add( node.name, node );

		}

		return allNodes;

	},

	/**
	 * Checks if reader has reached the end of content.
	 * @param {BinaryReader} reader
	 * @returns {boolean}
	 */
	endOfContent: function ( reader ) {

		// footer size: 160bytes + 16-byte alignment padding
		// - 16bytes: magic
		// - padding til 16-byte alignment (at least 1byte?)
		//   (seems like some exporters embed fixed 15 or 16bytes?)
		// - 4bytes: magic
		// - 4bytes: version
		// - 120bytes: zero
		// - 16bytes: magic
		if ( reader.size() % 16 === 0 ) {

			return ( ( reader.getOffset() + 160 + 16 ) & ~ 0xf ) >= reader.size();

		} else {

			return reader.getOffset() + 160 + 16 >= reader.size();

		}

	},

	/**
	 * Parses Node as much compatible as possible with the one parsed by TextParser
	 * TODO: could be optimized more?
	 * @param {BinaryReader} reader
	 * @param {number} version
	 * @returns {Object} - Returns an Object as node, or null if NULL-record.
	 */
	parseNode: function ( reader, version ) {

		// The first three data sizes depends on version.
		var endOffset = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();
		var numProperties = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();
		var propertyListLen = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();
		var nameLen = reader.getUint8();
		var name = reader.getString( nameLen );

		// Regards this node as NULL-record if endOffset is zero
		if ( endOffset === 0 ) return null;

		var propertyList = [];

		for ( var i = 0; i < numProperties; i ++ ) {

			propertyList.push( this.parseProperty( reader ) );

		}

		// Regards the first three elements in propertyList as id, attrName, and attrType
		var id = propertyList.length > 0 ? propertyList[ 0 ] : '';
		var attrName = propertyList.length > 1 ? propertyList[ 1 ] : '';
		var attrType = propertyList.length > 2 ? propertyList[ 2 ] : '';

		var subNodes = {};
		var properties = {};

		var isSingleProperty = false;

		// if this node represents just a single property
		// like (name, 0) set or (name2, [0, 1, 2]) set of {name: 0, name2: [0, 1, 2]}
		if ( numProperties === 1 && reader.getOffset() === endOffset ) {

			isSingleProperty = true;

		}

		while ( endOffset > reader.getOffset() ) {

			var node = this.parseNode( reader, version );

			if ( node === null ) continue;

			// special case: child node is single property
			if ( node.singleProperty === true ) {

				var value = node.propertyList[ 0 ];

				if ( Array.isArray( value ) ) {

					// node represents
					//	Vertices: *3 {
					//		a: 0.01, 0.02, 0.03
					//	}
					// of text format here.

					node.properties[ node.name ] = node.propertyList[ 0 ];
					subNodes[ node.name ] = node;

					// Later phase expects single property array is in node.properties.a as String.
					// TODO: optimize
					node.properties.a = value.toString();

				} else {

					// node represents
					// 	Version: 100
					// of text format here.

					properties[ node.name ] = value;

				}

				continue;

			}

			// special case: connections
			if ( name === 'Connections' && node.name === 'C' ) {

				var array = [];

				// node.propertyList would be like
				// ["OO", 111264976, 144038752, "d|x"] (?, from, to, additional values)
				for ( var i = 1, il = node.propertyList.length; i < il; i ++ ) {

					array[ i - 1 ] = node.propertyList[ i ];

				}

				if ( properties.connections === undefined ) {

					properties.connections = [];

				}

				properties.connections.push( array );

				continue;

			}

			// special case: child node is Properties\d+
			if ( node.name.match( /^Properties\d+$/ ) ) {

				// move child node's properties to this node.

				var keys = Object.keys( node.properties );

				for ( var i = 0, il = keys.length; i < il; i ++ ) {

					var key = keys[ i ];
					properties[ key ] = node.properties[ key ];

				}

				continue;

			}

			// special case: properties
			if ( name.match( /^Properties\d+$/ ) && node.name === 'P' ) {

				var innerPropName = node.propertyList[ 0 ];
				var innerPropType1 = node.propertyList[ 1 ];
				var innerPropType2 = node.propertyList[ 2 ];
				var innerPropFlag = node.propertyList[ 3 ];
				var innerPropValue;

				if ( innerPropName.indexOf( 'Lcl ' ) === 0 ) innerPropName = innerPropName.replace( 'Lcl ', 'Lcl_' );
				if ( innerPropType1.indexOf( 'Lcl ' ) === 0 ) innerPropType1 = innerPropType1.replace( 'Lcl ', 'Lcl_' );

				if ( innerPropType1 === 'ColorRGB' || innerPropType1 === 'Vector' ||
					 innerPropType1 === 'Vector3D' || innerPropType1.indexOf( 'Lcl_' ) === 0 ) {

					innerPropValue = [
						node.propertyList[ 4 ],
						node.propertyList[ 5 ],
						node.propertyList[ 6 ]
					];

				} else {

					innerPropValue = node.propertyList[ 4 ];

				}

				if ( innerPropType1.indexOf( 'Lcl_' ) === 0 ) {

					innerPropValue = innerPropValue.toString();

				}

				// this will be copied to parent. see above.
				properties[ innerPropName ] = {

					'type': innerPropType1,
					'type2': innerPropType2,
					'flag': innerPropFlag,
					'value': innerPropValue

				};

				continue;

			}

			// standard case
			// follows TextParser's manner.
			if ( subNodes[ node.name ] === undefined ) {

				if ( typeof node.id === 'number' ) {

					subNodes[ node.name ] = {};
					subNodes[ node.name ][ node.id ] = node;

				} else {

					subNodes[ node.name ] = node;

				}

			} else {

				if ( node.id === '' ) {

					if ( ! Array.isArray( subNodes[ node.name ] ) ) {

						subNodes[ node.name ] = [ subNodes[ node.name ] ];

					}

					subNodes[ node.name ].push( node );

				} else {

					if ( subNodes[ node.name ][ node.id ] === undefined ) {

						subNodes[ node.name ][ node.id ] = node;

					} else {

						// conflict id. irregular?

						if ( ! Array.isArray( subNodes[ node.name ][ node.id ] ) ) {

							subNodes[ node.name ][ node.id ] = [ subNodes[ node.name ][ node.id ] ];

						}

						subNodes[ node.name ][ node.id ].push( node );

					}

				}

			}

		}

		return {

			singleProperty: isSingleProperty,
			id: id,
			attrName: attrName,
			attrType: attrType,
			name: name,
			properties: properties,
			propertyList: propertyList, // raw property list, would be used by parent
			subNodes: subNodes

		};

	},

	parseProperty: function ( reader ) {

		var type = reader.getChar();

		switch ( type ) {

			case 'F':
				return reader.getFloat32();

			case 'D':
				return reader.getFloat64();

			case 'L':
				return reader.getInt64();

			case 'I':
				return reader.getInt32();

			case 'Y':
				return reader.getInt16();

			case 'C':
				return reader.getBoolean();

			case 'f':
			case 'd':
			case 'l':
			case 'i':
			case 'b':

				var arrayLength = reader.getUint32();
				var encoding = reader.getUint32(); // 0: non-compressed, 1: compressed
				var compressedLength = reader.getUint32();

				if ( encoding === 0 ) {

					switch ( type ) {

						case 'f':
							return reader.getFloat32Array( arrayLength );

						case 'd':
							return reader.getFloat64Array( arrayLength );

						case 'l':
							return reader.getInt64Array( arrayLength );

						case 'i':
							return reader.getInt32Array( arrayLength );

						case 'b':
							return reader.getBooleanArray( arrayLength );

					}

				}

				if ( window.Zlib === undefined ) {

					throw new Error( 'THREE.FBXLoader: External library Inflate.min.js required, obtain or import from https://github.com/imaya/zlib.js' );

				}

				var inflate = new Zlib.Inflate( new Uint8Array( reader.getArrayBuffer( compressedLength ) ) ); // eslint-disable-line no-undef
				var reader2 = new BinaryReader( inflate.decompress().buffer );

				switch ( type ) {

					case 'f':
						return reader2.getFloat32Array( arrayLength );

					case 'd':
						return reader2.getFloat64Array( arrayLength );

					case 'l':
						return reader2.getInt64Array( arrayLength );

					case 'i':
						return reader2.getInt32Array( arrayLength );

					case 'b':
						return reader2.getBooleanArray( arrayLength );

				}

			case 'S':
				var length = reader.getUint32();
				return reader.getString( length );

			case 'R':
				var length = reader.getUint32();
				return reader.getArrayBuffer( length );

			default:
				throw new Error( 'THREE.FBXLoader: Unknown property type ' + type );

		}

	}

} );


function BinaryReader( buffer, littleEndian ) {

	this.dv = new DataView( buffer );
	this.offset = 0;
	this.littleEndian = ( littleEndian !== undefined ) ? littleEndian : true;

}

Object.assign( BinaryReader.prototype, {

	getOffset: function () {

		return this.offset;

	},

	size: function () {

		return this.dv.buffer.byteLength;

	},

	skip: function ( length ) {

		this.offset += length;

	},

	// seems like true/false representation depends on exporter.
	//   true: 1 or 'Y'(=0x59), false: 0 or 'T'(=0x54)
	// then sees LSB.
	getBoolean: function () {

		return ( this.getUint8() & 1 ) === 1;

	},

	getBooleanArray: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getBoolean() );

		}

		return a;

	},

	getInt8: function () {

		var value = this.dv.getInt8( this.offset );
		this.offset += 1;
		return value;

	},

	getInt8Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getInt8() );

		}

		return a;

	},

	getUint8: function () {

		var value = this.dv.getUint8( this.offset );
		this.offset += 1;
		return value;

	},

	getUint8Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getUint8() );

		}

		return a;

	},

	getInt16: function () {

		var value = this.dv.getInt16( this.offset, this.littleEndian );
		this.offset += 2;
		return value;

	},

	getInt16Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getInt16() );

		}

		return a;

	},

	getUint16: function () {

		var value = this.dv.getUint16( this.offset, this.littleEndian );
		this.offset += 2;
		return value;

	},

	getUint16Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getUint16() );

		}

		return a;

	},

	getInt32: function () {

		var value = this.dv.getInt32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	},

	getInt32Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getInt32() );

		}

		return a;

	},

	getUint32: function () {

		var value = this.dv.getUint32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	},

	getUint32Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getUint32() );

		}

		return a;

	},

	// JavaScript doesn't support 64-bit integer so attempting to calculate by ourselves.
	// 1 << 32 will return 1 so using multiply operation instead here.
	// There'd be a possibility that this method returns wrong value if the value
	// is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
	// TODO: safely handle 64-bit integer
	getInt64: function () {

		var low, high;

		if ( this.littleEndian ) {

			low = this.getUint32();
			high = this.getUint32();

		} else {

			high = this.getUint32();
			low = this.getUint32();

		}

		// calculate negative value
		if ( high & 0x80000000 ) {

			high = ~ high & 0xFFFFFFFF;
			low = ~ low & 0xFFFFFFFF;

			if ( low === 0xFFFFFFFF ) high = ( high + 1 ) & 0xFFFFFFFF;

			low = ( low + 1 ) & 0xFFFFFFFF;

			return - ( high * 0x100000000 + low );

		}

		return high * 0x100000000 + low;

	},

	getInt64Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getInt64() );

		}

		return a;

	},

	// Note: see getInt64() comment
	getUint64: function () {

		var low, high;

		if ( this.littleEndian ) {

			low = this.getUint32();
			high = this.getUint32();

		} else {

			high = this.getUint32();
			low = this.getUint32();

		}

		return high * 0x100000000 + low;

	},

	getUint64Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getUint64() );

		}

		return a;

	},

	getFloat32: function () {

		var value = this.dv.getFloat32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	},

	getFloat32Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getFloat32() );

		}

		return a;

	},

	getFloat64: function () {

		var value = this.dv.getFloat64( this.offset, this.littleEndian );
		this.offset += 8;
		return value;

	},

	getFloat64Array: function ( size ) {

		var a = [];

		for ( var i = 0; i < size; i ++ ) {

			a.push( this.getFloat64() );

		}

		return a;

	},

	getArrayBuffer: function ( size ) {

		var value = this.dv.buffer.slice( this.offset, this.offset + size );
		this.offset += size;
		return value;

	},

	getChar: function () {

		return String.fromCharCode( this.getUint8() );

	},

	getString: function ( size ) {

		var s = '';

		while ( size > 0 ) {

			var value = this.getUint8();
			size --;

			if ( value === 0 ) break;

			s += String.fromCharCode( value );

		}
		console.log(s);
		console.log(escape( s ));
		// Manage UTF8 encoding
		s = decodeURIComponent( escape( s ) );

		this.skip( size );

		return s;

	}

} );


function FBXTree() {}

Object.assign( FBXTree.prototype, {

	add: function ( key, val ) {

		this[ key ] = val;

	},

	searchConnectionParent: function ( id ) {

		if ( this.__cache_search_connection_parent === undefined ) {

			this.__cache_search_connection_parent = [];

		}

		if ( this.__cache_search_connection_parent[ id ] !== undefined ) {

			return this.__cache_search_connection_parent[ id ];

		} else {

			this.__cache_search_connection_parent[ id ] = [];

		}

		var conns = this.Connections.properties.connections;

		var results = [];
		for ( var i = 0; i < conns.length; ++ i ) {

			if ( conns[ i ][ 0 ] == id ) {

				// 0 means scene root
				var res = conns[ i ][ 1 ] === 0 ? - 1 : conns[ i ][ 1 ];
				results.push( res );

			}

		}

		if ( results.length > 0 ) {

			append( this.__cache_search_connection_parent[ id ], results );
			return results;

		} else {

			this.__cache_search_connection_parent[ id ] = [ - 1 ];
			return [ - 1 ];

		}

	},

	searchConnectionChildren: function ( id ) {

		if ( this.__cache_search_connection_children === undefined ) {

			this.__cache_search_connection_children = [];

		}

		if ( this.__cache_search_connection_children[ id ] !== undefined ) {

			return this.__cache_search_connection_children[ id ];

		} else {

			this.__cache_search_connection_children[ id ] = [];

		}

		var conns = this.Connections.properties.connections;

		var res = [];
		for ( var i = 0; i < conns.length; ++ i ) {

			if ( conns[ i ][ 1 ] == id ) {

				// 0 means scene root
				res.push( conns[ i ][ 0 ] === 0 ? - 1 : conns[ i ][ 0 ] );
				// there may more than one kid, then search to the end

			}

		}

		if ( res.length > 0 ) {

			append( this.__cache_search_connection_children[ id ], res );
			return res;

		} else {

			this.__cache_search_connection_children[ id ] = [ ];
			return [ ];

		}

	},

	searchConnectionType: function ( id, to ) {

		var key = id + ',' + to; // TODO: to hash
		if ( this.__cache_search_connection_type === undefined ) {

			this.__cache_search_connection_type = {};

		}

		if ( this.__cache_search_connection_type[ key ] !== undefined ) {

			return this.__cache_search_connection_type[ key ];

		} else {

			this.__cache_search_connection_type[ key ] = '';

		}

		var conns = this.Connections.properties.connections;

		for ( var i = 0; i < conns.length; ++ i ) {

			if ( conns[ i ][ 0 ] == id && conns[ i ][ 1 ] == to ) {

				// 0 means scene root
				this.__cache_search_connection_type[ key ] = conns[ i ][ 2 ];
				return conns[ i ][ 2 ];

			}

		}

		this.__cache_search_connection_type[ id ] = null;
		return null;

	}

} );