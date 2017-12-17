var Gizmo = function(app){

	var visible = true;
    var moving = false;
    var mouseTap = null;
    var mouseTapMoved = false;
    var posCameraLast = new pc.Vec3();
    var visible = true;
    var enabled = false;
    var hover = false;
    var hoverAxis = '';
    var hoverPlane = false;
    var hoverEntity = null;
    var gizmoSize = .4;
    var arrowRadius = .4;
    var vecA = new pc.Vec3();
    var vecB = new pc.Vec3();
    var vecC = new pc.Vec3();
    var vecD = new pc.Vec3();
    var vecE = new pc.Vec3();
    var quat = new pc.Quat();
    var matA = new pc.Mat4();
    var matB = new pc.Mat4();
    var evtTapStart;

	var obj = {
        root: null,
        plane: {
            x: null,
            y: null,
            z: null
        },
        line: {
            x: null,
            y: null,
            z: null
        },
        arrow: {
            x: null,
            y: null,
            z: null
        },
        hoverable: [ ],
        matActive: null,
        matActiveTransparent: null
    };

    // active mat
    obj.matActive = createMaterial(new pc.Color(1, 1, 1, 1));
    obj.matActiveTransparent = createMaterial(new pc.Color(1, 1, 1, .25));
    obj.matActiveTransparent.cull = pc.CULLFACE_NONE;

    // root entity
    var entity = obj.root = new pc.Entity();

    // plane x
    var planeX = obj.plane.x = new pc.Entity();
    obj.hoverable.push(planeX);
    planeX.axis = 'x';
    planeX.plane = true;
    planeX.addComponent('model', {
        type: 'plane',
        castShadows: false,
        receiveShadows: false,
        castShadowsLightmap: false
    });
    planeX.model.model.meshInstances[0].layer = pc.LAYER_GIZMO;
    planeX.model.model.meshInstances[0].mask = 8;
    entity.addChild(planeX);
    planeX.setLocalEulerAngles(90, -90, 0);
    planeX.setLocalScale(.8, .8, .8);
    planeX.setLocalPosition(0, .4, .4);
    planeX.mat = planeX.model.material = createMaterial(new pc.Color(1, 0, 0, .25));
    planeX.mat.cull = pc.CULLFACE_NONE;

    // plane y
    var planeY = obj.plane.y = new pc.Entity();
    obj.hoverable.push(planeY);
    planeY.axis = 'y';
    planeY.plane = true;
    planeY.addComponent('model', {
        type: 'plane',
        castShadows: false,
        receiveShadows: false,
        castShadowsLightmap: false
    });
    planeY.model.model.meshInstances[0].layer = pc.LAYER_GIZMO;
    planeY.model.model.meshInstances[0].mask = 8;
    entity.addChild(planeY);
    planeY.setLocalEulerAngles(0, 0, 0);
    planeY.setLocalScale(.8, .8, .8);
    planeY.setLocalPosition(-.4, 0, .4);
    planeY.mat = planeY.model.material = createMaterial(new pc.Color(0, 1, 0, .25));
    planeY.mat.cull = pc.CULLFACE_NONE;

    // plane z
    var planeZ = obj.plane.z = new pc.Entity();
    obj.hoverable.push(planeZ);
    planeZ.axis = 'z';
    planeZ.plane = true;
    planeZ.addComponent('model', {
        type: 'plane',
        castShadows: false,
        receiveShadows: false,
        castShadowsLightmap: false
    });
    planeZ.model.model.meshInstances[0].layer = pc.LAYER_GIZMO;
    planeZ.model.model.meshInstances[0].mask = 8;
    entity.addChild(planeZ);
    planeZ.setLocalEulerAngles(90, 0, 0);
    planeZ.setLocalScale(.8, .8, .8);
    planeZ.setLocalPosition(-.4, .4, 0);
    planeZ.mat = planeZ.model.material = createMaterial(new pc.Color(0, 0, 1, .25));
    planeZ.mat.cull = pc.CULLFACE_NONE;

    // line x
    var lineX = obj.line.x = new pc.Entity();
    obj.hoverable.push(lineX);
    lineX.axis = 'x';
    lineX.addComponent('model', {
        type: 'cylinder',
        castShadows: false,
        receiveShadows: false,
        castShadowsLightmap: false
    });
    lineX.model.model.meshInstances[0].layer = pc.LAYER_GIZMO;
    lineX.model.model.meshInstances[0].mask = 8;
    entity.addChild(lineX);
    lineX.setLocalEulerAngles(90, 90, 0);
    lineX.setLocalPosition(1.6, 0, 0);
    lineX.setLocalScale(arrowRadius, .8, arrowRadius);
    lineX.mat = lineX.model.material = createMaterial(new pc.Color(1, 0, 0, 0));

    // line y
    var lineY = obj.line.y = new pc.Entity();
    obj.hoverable.push(lineY);
    lineY.axis = 'y';
    lineY.addComponent('model', {
        type: 'cylinder',
        castShadows: false,
        receiveShadows: false,
        castShadowsLightmap: false
    });
    lineY.model.model.meshInstances[0].layer = pc.LAYER_GIZMO;
    lineY.model.model.meshInstances[0].mask = 8;
    entity.addChild(lineY);
    lineY.setLocalEulerAngles(0, 0, 0);
    lineY.setLocalPosition(0, 1.6, 0);
    lineY.setLocalScale(arrowRadius, .8, arrowRadius);
    lineY.mat = lineY.model.material = createMaterial(new pc.Color(0, 1, 0, 0));

    // line z
    var lineZ = obj.line.z = new pc.Entity();
    obj.hoverable.push(lineZ);
    lineZ.axis = 'z';
    lineZ.addComponent('model', {
        type: 'cylinder',
        castShadows: false,
        receiveShadows: false,
        castShadowsLightmap: false
    });
    lineZ.model.model.meshInstances[0].layer = pc.LAYER_GIZMO;
    lineZ.model.model.meshInstances[0].mask = 8;
    entity.addChild(lineZ);
    lineZ.setLocalEulerAngles(90, 0, 0);
    lineZ.setLocalPosition(0, 0, 1.6);
    lineZ.setLocalScale(arrowRadius, .8, arrowRadius);
    lineZ.mat = lineZ.model.material = createMaterial(new pc.Color(0, 0, 1, 0));

    // arrow x
    var arrowX = obj.arrow.x = new pc.Entity();
    obj.hoverable.push(arrowX);
    arrowX.axis = 'x';
    arrowX.addComponent('model', {
        type: 'cone',
        castShadows: false,
        receiveShadows: false,
        castShadowsLightmap: false
    });
    arrowX.model.model.meshInstances[0].layer = pc.LAYER_GIZMO;
    arrowX.model.model.meshInstances[0].mask = 8;
    entity.addChild(arrowX);
    arrowX.setLocalEulerAngles(90, 90, 0);
    arrowX.setLocalPosition(2.3, 0, 0);
    arrowX.setLocalScale(arrowRadius, .6, arrowRadius);
    arrowX.mat = arrowX.model.material = createMaterial(new pc.Color(1, 0, 0, 1));

    // arrow y
    var arrowY = obj.arrow.y = new pc.Entity();
    obj.hoverable.push(arrowY);
    arrowY.axis = 'y';
    arrowY.addComponent('model', {
        type: 'cone',
        castShadows: false,
        receiveShadows: false,
        castShadowsLightmap: false
    });
    arrowY.model.model.meshInstances[0].layer = pc.LAYER_GIZMO;
    arrowY.model.model.meshInstances[0].mask = 8;
    entity.addChild(arrowY);
    arrowY.setLocalEulerAngles(0, 0, 0);
    arrowY.setLocalPosition(0, 2.3, 0);
    arrowY.setLocalScale(arrowRadius, .6, arrowRadius);
    arrowY.mat = arrowY.model.material = createMaterial(new pc.Color(0, 1, 0, 1));

    // arrow z
    var arrowZ = obj.arrow.z = new pc.Entity();
    obj.hoverable.push(arrowZ);
    arrowZ.axis = 'z';
    arrowZ.addComponent('model', {
        type: 'cone',
        castShadows: false,
        receiveShadows: false,
        castShadowsLightmap: false
    });
    arrowZ.model.model.meshInstances[0].layer = pc.LAYER_GIZMO;
    arrowZ.model.model.meshInstances[0].mask = 8;
    entity.addChild(arrowZ);
    arrowZ.setLocalEulerAngles(90, 0, 0);
    arrowZ.setLocalPosition(0, 0, 2.3);
    arrowZ.setLocalScale(arrowRadius, .6, arrowRadius);
    arrowZ.mat = arrowZ.model.material = createMaterial(new pc.Color(0, 0, 1, 1));
    this.clone = function(){
    	var copy = entity.clone();
    	return copy;

    }
    return obj;
}


var createMaterial = function(color) {
    var mat = new pc.BasicMaterial();
    mat.color = color;
    if (color.a !== 1) {
        mat.blend = true;
        mat.blendSrc = pc.BLENDMODE_SRC_ALPHA;
        mat.blendDst = pc.BLENDMODE_ONE_MINUS_SRC_ALPHA;
    }
    mat.cull = pc.CULLFACE_NONE;
    mat.update();
    return mat;
};