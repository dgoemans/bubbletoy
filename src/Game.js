/**
 * Created by David on 14-Mar-15.
 */

define([
    "class",
    "pixi",
    "filters/RGBSplit2Filter",
    "Ball",
    "proton"],
    function(Class, PIXI, RGBSplit2Filter, Ball, Proton) {

    var Game = Class({

        create: function (stage, proton)
        {
            this.stage = stage;

            //this.filter = new RGBSplit2Filter();
            //this.blur = new PIXI.BlurFilter();
            //this.blur.blur = 14;

            this.background = new PIXI.Sprite(PIXI.Texture.fromImage("assets/img/bg.jpg"));
            this.background.width = window.innerWidth;
            this.background.height = window.innerHeight;
            this.background.x = this.background.y = 0;
            stage.addChild(this.background);

            this.spriteBatch = new PIXI.SpriteBatch();
            stage.addChild(this.spriteBatch);

            //this.spriteBatch.filters = [this.blur];

            var numBubbles = window.innerWidth / 30;
            this.balls = [];
            for(var i=0; i<numBubbles; i++)
            {
                this.spawnBubble();
            }


            this.emitter = new Proton.BehaviourEmitter();
            this.emitter.rate = new Proton.Rate(new Proton.Span(35, 70));
            this.emitter.addInitialize(new Proton.Mass(1));
            this.emitter.addInitialize(new Proton.Position(new Proton.CircleZone(0,0,100)));
            this.emitter.addInitialize(new Proton.ImageTarget(PIXI.Texture.fromImage("assets/img/particle.png")));
            this.emitter.addInitialize(new Proton.Life(0.5, 5.0));
            this.emitter.addInitialize(new Proton.Velocity(new Proton.Span(-0.7, 0.7), new Proton.Span(-4,-1)));

            this.emitter.addBehaviour(new Proton.Scale(new Proton.Span(0.5, 1.2), 2.0));
            this.emitter.addBehaviour(new Proton.Alpha(1, 0.0, 'easeOutQuad'));
            this.emitter.addBehaviour(new Proton.Rotate(Proton.getSpan(-8, 9)));
            proton.addEmitter(this.emitter);

            this.time = 0;

        },

        spawnBubble: function(x,y,diam)
        {
            var bubble = new Ball(this.stage, x, y, diam);
            bubble.onPop = function(bubble){ this.bubblePop(bubble); }.bind(this);
            this.balls.push(bubble);
            return bubble;
        },

        bubblePop: function(bubble)
        {
            navigator.vibrate(100);

            this.emitter.p.x = bubble.x;
            this.emitter.p.y = bubble.y;
            this.emitter.emit('once');

            var size = 50;
            var toSpawn = Math.ceil(Math.random()*4);
            for(var i=0; i<toSpawn; i++)
            {
                var xVariance = (-bubble.diameter/2 + Math.random()*bubble.diameter)*0.667;
                var yVariance = (-bubble.diameter/2 + Math.random()*bubble.diameter)*0.667;
                var newBubble = this.spawnBubble(bubble.x + xVariance, bubble.y + yVariance, size);
                newBubble.velocity.y = bubble.velocity.y;
                newBubble.velocity.x = xVariance;
            }
        },

        sign: function(number) {
            return number?number<0?-1:1:0;
        },

        update: function(delta)
        {
            this.time += delta;

            var sin = Math.sin(this.time * 4.0);
            //this.filter.distance = sin > 0 ? sin * Math.random()*5 : 0;
            //this.blur.blur = this.filter.distance;

            for(var i=0; i<this.balls.length; i++)
            {
                this.balls[i].update(delta);

                //var mouse = this.stage.getMousePosition();
                //this.balls[i].velocity.x += (mouse.x - this.balls[i].x)*0.0001;

                for(var j=0; j<this.balls.length; j++)
                {
                    if(i===j)
                        continue;
                    var b1 = this.balls[i];
                    var b2 = this.balls[j];
                    var xDist = (b1.x - b2.x);
                    var yDist = (b1.y - b2.y);
                    var diam = b1.radius+b2.radius;
                    if( (xDist*xDist+yDist*yDist) < diam*diam )
                    {
                        var power = 0.018;
                        var xDir = this.sign(b1.x - b2.x);
                        b1.velocity.x += xDir*b2.radius*power;
                        b2.velocity.x += -xDir*b1.radius*power;

                        var yDir = this.sign(b1.y - b2.y);
                        b1.velocity.y += yDir*b2.radius*power;
                        b2.velocity.y += -yDir*b1.radius*power;

                        var diff = b2.radius - b1.radius;
                        var sizeDiff = 1;//Math.sign(diff)*1;

                        b2.resize(sizeDiff);
                        b1.resize(-sizeDiff);
                    }

                }
            }
        },

        render: function()
        {

        }
    });


    return Game;
});