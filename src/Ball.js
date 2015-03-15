/**
 * Created by David on 14-Mar-15.
 */

define([
        "class",
        "pixi",
        "filters/RGBSplit2Filter"],
    function(Class, PIXI, RGBSplit2Filter) {

        var Ball = Class({

            create: function(container,x,y,baseSize)
            {
                this.expansionRate = 5.0;
                this.maxSize = 300;
                this.gravity = -20.0;
                this.drag = 0.007;
                this.onPop = null;
                this.expanding = false;

                var texture = PIXI.Texture.fromImage("assets/img/bubble_3.png");

                this.image = new PIXI.Sprite(texture);
                this.image.anchor.x = 0.5;
                this.image.anchor.y = 0.5;
                this.image.interactive = true;


                this.image.mousedown = this.image.touchstart = function(mouseData){ this.startExpanding(); }.bind(this);
                this.image.mouseup = this.image.touchend = this.image.mouseupoutside = this.image.touchendoutside  = function(mouseData){ this.stopExpanding(); }.bind(this);
                //this.image.mouseover = this.image.touchstart = function(mouseData){ this.click(mouseData);}.bind(this);

                //this.image.rotation = Math.random()*Math.PI;
                this.velocity = new PIXI.Point(0,0);
                this.acceleration = new PIXI.Point(0,0);

                this.spawn(x,y,baseSize);

                container.addChild(this.image);


                this.time = 0;
                this.wobbleTimer = 0;

            },

            spawn: function(x,y, baseSize)
            {
                this.diameter = baseSize ? (baseSize/2 + Math.random()*baseSize) : (64 + Math.random()*128);
                this.radius = this.diameter/2;
                this.image.width = this.diameter;
                this.image.height = this.diameter;

                // move the sprite t the center of the screen
                this.image.position.x = x ? x : Math.random()*window.innerWidth;
                this.image.position.y = y ? y : (window.innerHeight + Math.random()*window.innerHeight + this.image.height);

                this.wobbleAmplitude = this.diameter*0.02 + Math.random()*this.diameter*0.06;
                this.wobbleTime = 1.0 + Math.random()*6;
                this.velocity.y = 0;
                this.velocity.x = 0;
                this.acceleration.y = this.gravity - (-10 + Math.random()*20);
            },


            update: function(delta)
            {
                this.time += delta;
                this.x += this.velocity.x*delta;
                this.y += this.velocity.y*delta;

                this.velocity.x += this.acceleration.x*delta - this.drag*this.velocity.x;
                this.velocity.y += this.acceleration.y*delta - this.drag*this.velocity.y;

                if(this.expanding)
                    this.resize(this.expansionRate);

                if(this.wobbleTimer > 0)
                {
                    this.updateWobble();
                    this.wobbleTimer -= delta;
                }
                else if(Math.random() < 0.003)
                    this.wobbleTimer = this.wobbleTime;

                var halfHeight = this.image.height/2;
                var halfWidth = this.image.width/2;
                if( this.image.y < -halfHeight //|| this.image.y > window.innerHeight+halfHeight
                    || this.image.x < -halfWidth || this.image.x > window.innerWidth+halfWidth  )
                    this.spawn();


                if(this.diameter > this.maxSize)
                {
                    if(this.onPop)
                        this.onPop(this);

                    this.spawn();
                }
            },

            updateWobble: function()
            {
                var timeScale = Math.PI*3/this.wobbleTime;
                var deltaSize = Math.sin((this.wobbleTime - this.wobbleTimer)*timeScale) * this.wobbleAmplitude * this.wobbleTimer/this.wobbleTime;
                this.image.width = this.diameter + deltaSize;
                this.image.height = this.diameter - deltaSize;
            },


            wobble : function(mouseData)
            {
                this.wobbleTime = 2;
                this.wobbleTimer = 2;
                this.wobbleAmplitude = this.diameter*0.2;
            },

            resize: function(amount)
            {
                this.diameter += amount;
                this.radius = this.diameter/2;
                this.image.width += amount;
                this.image.height += amount;
            },

            startExpanding: function()
            {
                this.expanding = true;
            },

            stopExpanding: function()
            {
                this.expanding = false;
            }


        });

        Object.defineProperty(Ball.prototype, 'y', {
            get: function() {
                return this.image.y;
            },
            set: function(value) {
                this.image.y = value;
            }
        });

        Object.defineProperty(Ball.prototype, 'x', {
            get: function() {
                return this.image.x;
            },
            set: function(value) {
                this.image.x = value;
            }
        });

        return Ball;
    }
);