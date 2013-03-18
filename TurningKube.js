/*
 *
 * Main part of the Game
 *
 */

"use strict";

/*
 *	Define Keyboard
 */
var KEYCODE_SPACE = 32;
var KEYCODE_RIGHT = 39;
var KEYCODE_LEFT = 37;
var KEYCODE_C = 67;
var KEYCODE_V = 86;

/*
 *	Define Category collider
 */
var CATEGORY_GRY = 0x01 // Default
/*
 * Definitions du package TurningKube
 */

var TurningKube = {
	Elements: {},
	Editor: {},
	Level: {},
	imgRess: {},
	CurrentWorld: {}
};

/*
 * Definitions du monde du Gameplay
 */
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

	//Init Createjs
	this.stage = new createjs.Stage("Game_TurningKube_canvas"); //Using canva name

	//define update
	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(60);

	//My env
	this.movingGroups = [];
	this.freezeQuantity = 0;
	this.isdebuging = true;

	//Level Datas
	this.name = "";

	console.log("Creat a new World");
	this.fixDef.density = 1.0;
	this.fixDef.friction = 0.5;
	this.fixDef.restitution = 0.2;

	this.currentGroup = 0; // Current group for freeze effect
	this.eventRotation = 0; //  > 0 == unClock; 0 == nothing;  < 0 == clock
	this.eventRotationMore = false;
	this.eventRotationLess = false;
	this.eventNextGroup = 0; // > 0 == this.currentGroup++; 0 == nothing;  < 0 == this.currentGroup--
	this.eventNextGroupMore = false;
	this.eventNextGroupLess = false;
	this.timerNextGroup = 0;

	//Binding Keyboard event
	document.onkeydown = this.HandleKeyDown;
	document.onkeyup = this.HandleKeyUp;
};

TurningKube.Elements.World.prototype = {
	HandleKeyDown: function (key) {
		//cross browser issues exist
		console.log("Key pressed; Key.keyCode = " + key.keyCode);
		if (!key) {
			key = window.event;
		}
		switch (key.keyCode) {
			case KEYCODE_SPACE:
				console.log("Event: espace pressed, Freeze;");
				TurningKube.CurrentWorld.Freeze(TurningKube.CurrentWorld.currentGroup);
				break;
			case KEYCODE_C:
				TurningKube.CurrentWorld.eventNextGroup = -1;
				TurningKube.CurrentWorld.eventNextGroupLess = true;
				break;
			case KEYCODE_V:
				TurningKube.CurrentWorld.eventNextGroup = 1;
				TurningKube.CurrentWorld.eventNextGroupMore = true;
				break;
			case KEYCODE_LEFT:
				TurningKube.CurrentWorld.eventRotation = -1;
				TurningKube.CurrentWorld.eventRotationLess = true;
				break;
			case KEYCODE_RIGHT:
				TurningKube.CurrentWorld.eventRotation = 1;
				TurningKube.CurrentWorld.eventRotationMore = true;
				break;
		}
	},
	HandleKeyUp: function (key) {
		//cross browser issues exist
		if (!key) {
			key = window.event;
		}
		switch (key.keyCode) {
			case KEYCODE_C:
				TurningKube.CurrentWorld.eventNextGroupLess = false;
				if (TurningKube.CurrentWorld.eventNextGroupMore) {
					TurningKube.CurrentWorld.eventNextGroup = 1;
				} else {
					TurningKube.CurrentWorld.eventNextGroup = 0;
					TurningKube.CurrentWorld.timerNextGroup = 10;
				}
				break;
			case KEYCODE_V:
				TurningKube.CurrentWorld.eventNextGroupMore = false;
				if (TurningKube.CurrentWorld.eventNextGroupLess) {
					TurningKube.CurrentWorld.eventNextGroup = -1;
				} else {
					TurningKube.CurrentWorld.eventNextGroup = 0;
					TurningKube.CurrentWorld.timerNextGroup = 10;
				}
				break;
			case KEYCODE_LEFT:
				TurningKube.CurrentWorld.eventRotationLess = false;
				if (TurningKube.CurrentWorld.eventRotationMore) {
					TurningKube.CurrentWorld.eventRotation = 1;
				} else {
					TurningKube.CurrentWorld.eventRotation = 0;
				}
				break;
			case KEYCODE_RIGHT:
				TurningKube.CurrentWorld.eventRotationMore = false;
				if (TurningKube.CurrentWorld.eventRotationLess) {
					TurningKube.CurrentWorld.eventRotation = -1;
				} else {
					TurningKube.CurrentWorld.eventRotation = 0;
				}
				break;
		}
	},
	Freeze: function (groupTarget) {
		console.log("Freeze in world;");
		if (groupTarget < this.movingGroups.length) {
			if (!this.movingGroups[groupTarget].freezeStatus) {
				console.log("Freeze movingGroups nb:" + groupTarget);
				this.movingGroups[groupTarget].Freeze();
				this.movingGroups[groupTarget].freezeStatus = true;
			} else {
				this.movingGroups[groupTarget].UnFreeze();
				this.movingGroups[groupTarget].freezeStatus = false;
			}
		}
	},
	Rotation: function (side) {
		var my_i = 0;
		for (my_i = 0; my_i < this.movingGroups.length; my_i++) {
			this.movingGroups[my_i].Turn();
		}
	},
	RotationOpp: function (side) {
		var my_i = 0;
		for (my_i = 0; my_i < this.movingGroups.length; my_i++) {
			this.movingGroups[my_i].TurnOpp();
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
				myObjectParameters = [myCurrentGroup].concat(level.Groups[myI].children[myJ].parameters);
				console.log("1- " + myObjectParameters.toString());

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
	},
	Update: function () {
		//physic update, using timer
		if (TurningKube.CurrentWorld.eventRotation > 0) {
			TurningKube.CurrentWorld.Rotation();
		} else if (TurningKube.CurrentWorld.eventRotation < 0) {
			TurningKube.CurrentWorld.RotationOpp();
		}

		if (TurningKube.CurrentWorld.eventNextGroup !== 0) {
			if (this.timerNextGroup >= 10) {
				this.timerNextGroup = 0;
				if (TurningKube.CurrentWorld.eventNextGroup > 0) {
					TurningKube.CurrentWorld.currentGroup = (TurningKube.CurrentWorld.currentGroup + 1) % TurningKube.CurrentWorld.movingGroups.length;
				} else {
					if (TurningKube.CurrentWorld.currentGroup > 0) {
						--TurningKube.CurrentWorld.currentGroup;
					} else if (TurningKube.CurrentWorld.movingGroups.length > 0) {
						TurningKube.CurrentWorld.currentGroup = TurningKube.CurrentWorld.movingGroups.length - 1;
					}
				}
			}
			this.eventNextGroup++;
		}
		TurningKube.CurrentWorld.world.Step(1 / 60, 10, 10);

		//Graphic update, using frame system.
		TurningKube.CurrentWorld.stage.update();
		if (TurningKube.CurrentWorld.isdebuging) {
			TurningKube.CurrentWorld.world.DrawDebugData();
			TurningKube.CurrentWorld.world.ClearForces();
		}
	}
};

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
	this.freezeStatus = false;

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
	TurnOpp: function () {
		var my_i = 0;
		for (my_i = 0; my_i < this.child.length; my_i++) {
			this.child[my_i].SetAwake(true);
		}
		this.bodyRef.SetAngle(this.bodyRef.GetAngle() - 0.02);
	},
	Freeze: function () {
		var my_i = 0;

		this.freezeQuantity++;
		for (my_i = 0; my_i < this.dynamicChild.length; my_i++) {
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



//Prototype
TurningKube.Elements.StandardElem = function (group, posX, posY, collisionID) {
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

//Prototype
TurningKube.Elements.StandardWall = function (group, posX, posY, collisionID) {
	TurningKube.CurrentWorld.bodyDef.type = TurningKube.CurrentWorld.b2Body.b2_dynamicBody;
	TurningKube.CurrentWorld.fixDef.shape = new TurningKube.CurrentWorld.b2PolygonShape();
	TurningKube.CurrentWorld.fixDef.shape.SetAsBox(1, 1);
	TurningKube.Elements.StandardElem.call(this, group, posX, posY, collisionID);
	group.Addchild(this.bodyRef);
};
//Declaration
TurningKube.Elements.StandardWall.prototype = {};

//Prototype
TurningKube.Elements.BallMoving = function (group, posX, posY, collisionID) {
	//Declaration
	this.groupFather = group;
	this.currentJoin = undefined;

	TurningKube.CurrentWorld.bodyDef.type = TurningKube.CurrentWorld.b2Body.b2_dynamicBody;
	TurningKube.CurrentWorld.fixDef.shape = new TurningKube.CurrentWorld.b2CircleShape(1);

	TurningKube.CurrentWorld.fixDef.friction = 2;
	TurningKube.CurrentWorld.fixDef.restitution = 0.9;
	TurningKube.Elements.StandardElem.call(this, group, posX, posY, collisionID);

	//Reset values fixDef
	TurningKube.CurrentWorld.fixDef.friction = 0.5;
	TurningKube.CurrentWorld.fixDef.restitution = 0.2;
	group.dynamicChild.push(this);
};

TurningKube.Elements.BallMoving.prototype = {
	Freeze: function () {
		this.bodyRef.SetAwake(false);
		//this.groupFather.localJoint.Initialize(this.groupFather.bodyRef, this.bodyRef, this.groupFather.bodyRef.GetWorldCenter());
		//this.currentJoin = TurningKube.CurrentWorld.world.CreateJoint(this.groupFather.localJoint);
	},
	UnFreeze: function () {
		this.bodyRef.SetAwake(true);
	}
};