"use strict"

export {initPhysics, createRigidBody, createPlane, createRobotPhysics, updatePhysics }

function initPhysics() {
	// Physics configuration
	let gravityConstant = -9000,
		collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration(),
		dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
		broadphase = new Ammo.btDbvtBroadphase(),
		solver = new Ammo.btSequentialImpulseConstraintSolver(),
		physicsWorld = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
	physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
	physicsWorld.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, gravityConstant, 0));
	return physicsWorld;
}

function createRigidBody(physicsWorld, threeObject, physicsShape, mass, pos, quat, rigidBodies, scene, texture, bumpMap) {
	let textureLoader,
		bumpLoader;
	threeObject.position.copy(pos);
	threeObject.quaternion.copy(quat);
	let transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
	transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
	let motionState = new Ammo.btDefaultMotionState(transform),
		localInertia = new Ammo.btVector3(0, 0, 0);
	physicsShape.calculateLocalInertia(mass, localInertia);
	let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia),
		body = new Ammo.btRigidBody(rbInfo);
	if (texture) {
		textureLoader = new THREE.TextureLoader().load(texture, function(texture) {
			threeObject.material.map = texture;
			threeObject.material.needsUpdate = true;
		});
	}
	if (bumpMap) {
		bumpLoader = new THREE.TextureLoader().load(bumpMap, function(bumpMap) {
			threeObject.material.bumpMap = bumpMap;
			threeObject.material.needsUpdate = true;
		});
	}
	threeObject.userData.physicsBody = body;
	if (mass > 0) {
		rigidBodies.push(threeObject);
		body.setActivationState(4);
	}
	physicsWorld.addRigidBody(body);
	scene.add(threeObject);
	return body;
}

function createPlane(scene, rigidBodies, physicsWorld) {
	let pos = new THREE.Vector3().set(0, -25, 0),
		quat = new THREE.Quaternion().set(0, 0, 0, 1),
		planeMesh = new THREE.Mesh(new THREE.BoxGeometry(1010, 50, 1010, 1, 1, 1), new THREE.MeshStandardMaterial()),
		planeShape = new Ammo.btBoxShape(new Ammo.btVector3(505, 25, 505));
	// planeShape.setMargin(0.05);
	createRigidBody(physicsWorld, planeMesh, planeShape, 0, pos, quat, rigidBodies, scene, "images/textures/floorTexture.jpg", "images/textures/floorBumpMap.jpg");
	planeMesh.castShadow = true;
	planeMesh.receiveShadow = true;
	return planeMesh;
}

function createRobotPhysics(scene, rigidBodies, physicsWorld, mesh) {
	let pos = new THREE.Vector3(),
		quat = new THREE.Quaternion();
	pos.set(0, 50, 0);
	let userShape = new Ammo.btSphereShape(50),
		userBallBody = createRigidBody(physicsWorld, mesh, userShape, 60, pos, quat, rigidBodies, scene);
	return userBallBody;
}

function updatePhysics(deltaTime, physicsWorld, rigidBodies, transformAux1) {
	// Step world
	physicsWorld.stepSimulation(deltaTime, 10);
	// Update rigid bodies
	for (let i = 0, il = rigidBodies.length; i < il; i++) {
		let objThree = rigidBodies[i];
		let objPhys = objThree.userData.physicsBody;
		let ms = objPhys.getMotionState();
		if (ms) {
			ms.getWorldTransform(transformAux1);
			let p = transformAux1.getOrigin();
			let q = transformAux1.getRotation();
			objThree.position.set(p.x(), p.y(), p.z());
			objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
		}
	}
}