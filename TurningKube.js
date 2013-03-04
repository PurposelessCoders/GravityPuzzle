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
(function() {
	TurningKube.Elements = {};
	TurningKube.Editor = {};
	TurningKube.Level = {};
	TurningKube.imgRess = {};
	TurningKube.CurrentWorld = {};
})();

/*
 * Definitions du monde du Gameplay
 */
(function() {
	//Constructor
	TurningKube.Elements.World = function() {
		console.log("Creat a new World");
		this.fixDef.density = 1.0;
		this.fixDef.friction = 0.5;
		this.fixDef.restitution = 0.2;
	};

	//Declaration
	TurningKube.Elements.World.prototype = {
		//Box2D env
		b2Vec2: Box2D.Common.Math.b2Vec2,
		b2AABB: Box2D.Collision.b2AABB,
		b2BodyDef: Box2D.Dynamics.b2BodyDef,
		b2Body: Box2D.Dynamics.b2Body,
		b2FixtureDef: Box2D.Dynamics.b2FixtureDef,
		b2Fixture: Box2D.Dynamics.b2Fixture,
		b2World: Box2D.Dynamics.b2World,
		b2MassData: Box2D.Collision.Shapes.b2MassData,
		b2PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
		b2CircleShape: Box2D.Collision.Shapes.b2CircleShape,
		b2DebugDraw: Box2D.Dynamics.b2DebugDraw,
		b2WeldJointDef: Box2D.Dynamics.Joints.b2WeldJointDef,

		world: new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true),
		fixDef: new Box2D.Dynamics.b2FixtureDef(),
		bodyDef: new Box2D.Dynamics.b2BodyDef(),
		//My env
		movingGroups: [],
		freezzeQuantity: 0,
		freezzeStatus: false,
		Freezze: function() {
			var my_i = 0;
			this.freezzeStatus = this.freezzeStatus ^ true;
			if (this.freezzeStatus) {
				this.freezzeQuantity++;
				for (my_i = 0; my_i < this.movingGroups.length; my_i++) {
					this.movingGroups[my_i].Freezze();
				}
			} else {
				for (my_i = 0; my_i < this.movingGroups.length; my_i++) {
					this.movingGroups[my_i].UnFreezze();
				}
			}
		},
		Rotation: function(side) {
			var my_i = 0;	
			for (my_i = 0; my_i < this.movingGroups.length; my_i++) {
				this.movingGroups[my_i].Turn();
			}
		}
	};
	TurningKube.CurrentWorld = new TurningKube.Elements.World();
})();

/*
 * Definitions des elements du Gameplay
 */
(function() {
	//Constructor
	TurningKube.Elements.MovingGroups = function(posX, posY) {
		TurningKube.CurrentWorld.bodyDef.type = TurningKube.CurrentWorld.b2Body.b2_staticBody;

		TurningKube.CurrentWorld.density = 1.0;
		TurningKube.CurrentWorld.friction = 0.5;
		TurningKube.CurrentWorld.restitution = 0.2;

		TurningKube.CurrentWorld.bodyDef.position.y = posY;
		TurningKube.CurrentWorld.bodyDef.position.x = posX;
		this.bodyRef = TurningKube.CurrentWorld.world.CreateBody(TurningKube.CurrentWorld.bodyDef);
		TurningKube.CurrentWorld.movingGroups.push(this);
	};
	//Declaration
	TurningKube.Elements.MovingGroups.prototype = {
		localJoint: new TurningKube.CurrentWorld.b2WeldJointDef(),
		child: [],
		img: undefined,
		bodyRef: undefined,
		Addchild: function(childRef) {
			this.child.push(childRef);
			this.localJoint.Initialize(this.bodyRef, childRef, this.bodyRef.GetWorldCenter());
			TurningKube.CurrentWorld.world.CreateJoint(this.localJoint);
			this.bodyRef.CreateFixture(TurningKube.CurrentWorld.fixDef);

		},
		Turn: function() {
			var my_i = 0;
			for (my_i = 0; my_i < this.child.length; my_i++) {
				this.child[my_i].SetAwake(true);
			}
			this.bodyRef.SetAngle(this.bodyRef.GetAngle() + 0.1);
		},
		Freezze: function() {

		},
		UnFreezze: function() {

		}
	};
})();


(function() {
	//Prototype
	TurningKube.Elements.StandardElem = function(posX, posY, group) {

		TurningKube.CurrentWorld.bodyDef.position.y = posY;
		TurningKube.CurrentWorld.bodyDef.position.x = posX;
		this.bodyRef = TurningKube.CurrentWorld.world.CreateBody(TurningKube.CurrentWorld.bodyDef);
		this.bodyRef.CreateFixture(TurningKube.CurrentWorld.fixDef);
		group.Addchild(this.bodyRef);
	};
	//Declaration
	TurningKube.Elements.StandardElem.prototype = {
		img: undefined,
		bodyRef: undefined,
		Freezze: function() {

		},
		UnFreezze: function() {

		}
	};
})();

(function() {
	//Prototype
	TurningKube.Elements.StandardWall = function(posX, posY, group) {
		TurningKube.CurrentWorld.bodyDef.type = TurningKube.CurrentWorld.b2Body.b2_dynamicBody;
		TurningKube.CurrentWorld.fixDef.shape = new TurningKube.CurrentWorld.b2PolygonShape;
		TurningKube.CurrentWorld.fixDef.shape.SetAsBox(1, 1);

		TurningKube.Elements.StandardElem.call(this, posX, posY, group);
};
//Declaration
TurningKube.Elements.StandardWall.prototype = {
	toto: 10
};
})();