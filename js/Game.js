var SpaceHipster = SpaceHipster || {};

//title screen
SpaceHipster.Game = function(){};

SpaceHipster.Game.prototype = {
  create: function() {
  	//set world dimensions
    this.game.world.setBounds(0, 0, 1920, 1920);

    //background
    this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');

    //create player
    this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'playership');
    this.player.scale.setTo(2);
    this.player.animations.add('fly', [0, 1, 2, 3], 3, true);
    this.player.animations.play('fly');

    //player initial score of zero
    this.playerScore = 0;

    //enable player physics
    this.game.physics.arcade.enable(this.player);
    this.playerSpeed = 120;
    this.player.body.collideWorldBounds = true;
    this.cursors = this.game.input.keyboard.createCursorKeys();

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //generate game elements
    this.generateCollectables();
    this.generateAsteroids();

    //show score
    this.showLabels();

    //sounds
    this.explosionSound = this.game.add.audio('explosion');
    console.log(this.explosionSound);
    this.collectSound = this.game.add.audio('collect');
    
    //setup bullets
    this.fireRate = 1000;
    this.nextFire = 0;
    this.createBullets();
  },
  update: function() {
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    if (this.cursors.left.isDown)
    {
        //  Move to the left
        this.player.body.velocity.x = -150;
    }
    if (this.cursors.right.isDown)
    {
        //  Move to the right
        this.player.body.velocity.x = 150;
    }
    if (this.cursors.up.isDown)
    {
        //  Move to the right
        this.player.body.velocity.y = -150;
    }
    if (this.cursors.down.isDown)
    {
        //  Move to the right
        this.player.body.velocity.y = 150;
    }

    if (this.game.input.activePointer.isDown)
    {
        this.fire();
    }
   
    //collision between player and asteroids
    this.game.physics.arcade.collide(this.player, this.asteroids, this.hitAsteroid, null, this);

    //overlapping between player and collectables
    this.game.physics.arcade.overlap(this.player, this.collectables, this.collect, null, this);
    this.game.physics.arcade.overlap(this.bullets, this.asteroids, this.shootAsteroid, null, this);
  },
  createBullets: function(){
    this.bullets = this.game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(50, 'bullet');
    this.bullets.setAll('checkWorldBounds', true);
    this.bullets.setAll('outOfBoundsKill', true);
  },
  fire: function(){
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
    {
        this.nextFire = this.game.time.now + this.fireRate;

        var bullet = this.bullets.getFirstDead();

        bullet.reset(this.player.x - 8, this.player.y - 8);

        this.game.physics.arcade.moveToPointer(bullet, 300);
    }
  },
  generateCollectables: function() {
    this.collectables = this.game.add.group();

    //enable physics in them
    this.collectables.enableBody = true;
    this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

    //phaser's random number generator
    var numCollectables = this.game.rnd.integerInRange(100, 150)
    var collectable;

    for (var i = 0; i < numCollectables; i++) {
      //add sprite
      collectable = this.collectables.create(this.game.world.randomX, this.game.world.randomY, 'power');
      collectable.animations.add('fly', [0, 1, 2, 3], 5, true);
      collectable.animations.play('fly');
    }

  },
  generateAsteroids: function() {
    this.asteroids = this.game.add.group();
    
    //enable physics in them
    this.asteroids.enableBody = true;

    //phaser's random number generator
    var numAsteroids = this.game.rnd.integerInRange(100, 50)
    var asteroid, scale;

    for (var i = 0; i < numAsteroids; i++) {
      //add sprite
      asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
      scale = Math.floor(this.game.rnd.integerInRange(10, 40)/10)
      asteroid.scale.setTo(scale);

      //physics properties
      asteroid.body.velocity.x = this.game.rnd.integerInRange(-20, 20);
      asteroid.body.velocity.y = this.game.rnd.integerInRange(-20, 20);
      asteroid.body.immovable = true;
      asteroid.body.collideWorldBounds = true;
      
      asteroid.hp = scale;
    }
  },
  hitAsteroid: function(player, asteroid) {
    //play explosion sound
    this.explosionSound.play();

    //make the player explode
    var emitter = this.game.add.emitter(this.player.x, this.player.y, 100);
    emitter.makeParticles('playerParticle');
    emitter.minParticleSpeed.setTo(-200, -200);
    emitter.maxParticleSpeed.setTo(200, 200);
    emitter.gravity = 0;
    emitter.start(true, 1000, null, 100);
    this.player.kill();

    this.game.time.events.add(800, this.gameOver, this);
  },
  shootAsteroid: function(bullet, target) {
    var debris, debrisCount;
    console.log('hit!');
    //play explosion sound
    this.explosionSound.play();

    bullet.kill();
    
    //make the target explode
    
    console.log(target)
    target.hp--;
    if( target.hp === 0 ){
      var emitter = this.game.add.emitter(target.x + target.width/2, target.y+target.height/2, 100);
      emitter.makeParticles('playerParticle');
      emitter.minParticleSpeed.setTo(-200, -200);
      emitter.maxParticleSpeed.setTo(200, 200);
      emitter.gravity = 0;
      emitter.start(true, 1000, null, 100);
      target.kill();
    }
    
    
    // console.log(target)
    // if( target.scale.x > 1 ){
    //   for( debrisCount = target.scale.x; debrisCount > 0; debrisCount-- ){
    //     debris = this.asteroids.create(target.position.x, target.position.x, 'rock');
    //     debris.scale.setTo(target.scale.x-1);

    //     //physics properties
    //     debris.body.velocity.x = this.game.rnd.integerInRange(-20, 20);
    //     debris.body.velocity.y = this.game.rnd.integerInRange(-20, 20);
    //     debris.body.immovable = true;
    //     debris.body.collideWorldBounds = true;
    //     console.log(debris)
    //   }
    // }
    
  },
  gameOver: function() {    
    //pass it the score as a parameter 
    this.game.state.start('MainMenu', true, false, this.playerScore);
  },
  collect: function(player, collectable) {
    //play collect sound
    this.collectSound.play();

    //update score
    this.playerScore++;
    this.scoreLabel.text = this.playerScore;

    //remove sprite
    collectable.destroy();
  },
  showLabels: function() {
    //score text
    var text = "0";
    var style = { font: "20px Arial", fill: "#fff", align: "center" };
    this.scoreLabel = this.game.add.text(this.game.width-50, this.game.height - 50, text, style);
    this.scoreLabel.fixedToCamera = true;
  }
};

/*
TODO

-audio
-asteroid bounch
*/
