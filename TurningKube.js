/*
 *
 * Main part of the Game
 *
 */

"use strict";

/*
 * Definitions du package TurningKube
 */

var TurningKube = {};
(function () {
	TurningKube.Elements = {};
	TurningKube.Editor = {};
	TurningKube.Level = {};
	TurningKube.imgRess = {};
	TurningKube.CurrentWorld = {};
})();

/*
 * Definitions du monde du Gameplay
 */
(function () {
	//Constructor
	TurningKube.Elements.World = function () {
		//Box2D env
		this.b2Vec2 = Box2D.Common.Math.b2Vec2;
		this.b2AABB = Box2D.Collision.b2AABB;
		this.b2BodyDef = Box2D.Dynamics.b2BodyDef;
		this.b2Body = Box2D.Dynamics.b2Body;
		this.b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
		this.b2Fixture = Box2D.Dynamics.b2Fixture;
		this.b2World = Box2D.Dynamics.b2World;
		this.b2MassData = Box2D.Collision.Shapes.b2MassData;
		this.b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
		this.b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
		this.b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
		this.b2WeldJointDef = Box2D.Dynamics.Joints.b2WeldJointDef;
		//Declaration
		this.world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true);
		this.fixDef = new Box2D.Dynamics.b2FixtureDef();
		this.bodyDef = new Box2D.Dynamics.b2BodyDef();
		//My env
		this.movingGroups = [];
		this.freezeQuantity = 0;
		this.freezeStatus = true;
		//Level Datas
		this.name = "";

		console.log("Creat a new World");
		this.fixDef.density = 1.0;
		this.fixDef.friction = 0.5;
		this.fixDef.restitution = 0.2;
	};

	TurningKube.Elements.World.prototype = {
		Freeze: function () {
			var my_i = 0;

			console.log("Freeze in world;");
			if (this.freezeStatus) {
				this.freezeQuantity++;
				for (my_i = 0; my_i < this.movingGroups.length; my_i++) {
					console.log("Freeze movingGroups nb:" + my_i);
					this.movingGroups[my_i].Freeze();
				}
				this.freezeStatus = false;
			} else {
				for (my_i = 0; my_i < this.movingGroups.length; my_i++) {
					this.movingGroups[my_i].UnFreeze();
				}
				this.freezeStatus = true;
			}
		},
		Rotation: function (side) {
			var my_i = 0;
			for (my_i = 0; my_i < this.movingGroups.length; my_i++) {
				this.movingGroups[my_i].Turn();
			}
		},
		LoadLevel: function (level) {
			this.name = level.name;
			var myI, myJ, myObjectName, myObjectParameters, myCurrentGroup;
			for (myI = 0; myI < level.Groups.length; myI++) {
				myCurrentGroup = new TurningKube.Elements.MovingGroups(level.Groups[myI].posX, level.Groups[myI].posY);
				TurningKube.CurrentWorld.movingGroups.push(myCurrentGroup);
				for (myJ = 0; myJ < level.Groups[myI].children.length; myJ++) {
					myObjectName = level.Groups[myI].children[myJ].name;
					myObjectParameters = level.Groups[myI].children[myJ].parameters;
					myObjectParameters.push(myCurrentGroup);

					(function () {
						function F(args) {
							return TurningKube.Elements[myObjectName].apply(this, args);
						}
						F.prototype = TurningKube.Elements[myObjectName].prototype;
						return new F(myObjectParameters);
					})();
					// same as TurningKube.Elements[myObjectName].apply(null, (myObjectParameters));
				}
			}
		}
	};
	TurningKube.CurrentWorld = new TurningKube.Elements.World();
})();

/*
 * Definitions des elements du Gameplay
 */

//Constructor
TurningKube.Elements.MovingGroups = function (posX, posY) {
	//Declaration
	this.localJoint = new TurningKube.CurrentWorld.b2WeldJointDef();
	this.child = [];
	this.dynamicChild = [];
	this.img = undefined;
	this.bodyRef = undefined;

	TurningKube.CurrentWorld.bodyDef.type = TurningKube.CurrentWorld.b2Body.b2_staticBody;

	TurningKube.CurrentWorld.density = 1.0;
	TurningKube.CurrentWorld.friction = 0.5;
	TurningKube.CurrentWorld.restitution = 0.2;

	TurningKube.CurrentWorld.bodyDef.position.y = posY;
	TurningKube.CurrentWorld.bodyDef.position.x = posX;
	this.bodyRef = TurningKube.CurrentWorld.world.CreateBody(TurningKube.CurrentWorld.bodyDef);
};
TurningKube.Elements.MovingGroups.prototype = {
	Addchild: function (childRef) {
		this.child.push(childRef);
		this.localJoint.Initialize(this.bodyRef, childRef, this.bodyRef.GetWorldCenter());
		TurningKube.CurrentWorld.world.CreateJoint(this.localJoint);
		this.bodyRef.CreateFixture(TurningKube.CurrentWorld.fixDef);

	},
	Turn: function () {
		var my_i = 0;
		for (my_i = 0; my_i < this.child.length; my_i++) {
			this.child[my_i].SetAwake(true);
		}
		this.bodyRef.SetAngle(this.bodyRef.GetAngle() + 0.02);
	},
	Freeze: function () {
		var my_i = 0;
		for (my_i = 0; my_i < this.dynamicChild.length; my_i++) {
			console.log("Freeze dynamicChild nb:" + my_i);
			this.dynamicChild[my_i].Freeze();
		}
	},
	UnFreeze: function () {
		var my_i = 0;
		for (my_i = 0; my_i < this.dynamicChild.length; my_i++) {
			this.dynamicChild[my_i].UnFreeze();
		}
	}
};



(function () {
	//Prototype
	TurningKube.Elements.StandardElem = function (posX, posY, group) {
		//Declaration
		this.img = undefined;
		this.bodyRef = undefined;

		TurningKube.CurrentWorld.bodyDef.position.y = posY;
		TurningKube.CurrentWorld.bodyDef.position.x = posX;
		this.bodyRef = TurningKube.CurrentWorld.world.CreateBody(TurningKube.CurrentWorld.bodyDef);
		this.bodyRef.CreateFixture(TurningKube.CurrentWorld.fixDef);
	};
	TurningKube.Elements.StandardElem.prototype = {
		Freeze: function () {

		},
		UnFreeze: function () {

		}
	};
})();

(function () {
	//Prototype
	TurningKube.Elements.StandardWall = function (posX, posY, group) {
		TurningKube.CurrentWorld.bodyDef.type = TurningKube.CurrentWorld.b2Body.b2_dynamicBody;
		TurningKube.CurrentWorld.fixDef.shape = new TurningKube.CurrentWorld.b2PolygonShape();
		TurningKube.CurrentWorld.fixDef.shape.SetAsBox(1, 1);
		TurningKube.Elements.StandardElem.call(this, posX, posY, group);
		group.Addchild(this.bodyRef);
	};
	//Declaration
	TurningKube.Elements.StandardWall.prototype = {};
})();

(function () {
	//Prototype
	TurningKube.Elements.BallMoving = function (posX, posY, group) {
		//Declaration
		this.groupFather = group;
		this.currentJoin = undefined;

		console.log("Creat a BallMoving");
		TurningKube.CurrentWorld.bodyDef.type = TurningKube.CurrentWorld.b2Body.b2_dynamicBody;
		TurningKube.CurrentWorld.fixDef.shape = new TurningKube.CurrentWorld.b2CircleShape(1);
		TurningKube.Elements.StandardElem.call(this, posX, posY, group);
		group.dynamicChild.push(this);
	};

	TurningKube.Elements.BallMoving.prototype = {
		Freeze: function () {
			console.log("event de freeze");
			this.groupFather.localJoint.Initialize(this.groupFather.bodyRef, this.bodyRef, this.groupFather.bodyRef.GetWorldCenter());
			this.currentJoin = TurningKube.CurrentWorld.world.CreateJoint(this.groupFather.localJoint);
		},
		UnFreeze: function () {
			console.log("event de Unfreeze");
			TurningKube.CurrentWorld.world.DestroyJoint(this.currentJoin);
			console.log("End event de Unfreeze");
		}
	};
})();