class TitleScreen extends Phaser.Scene {
    constructor() {
        super('TitleScreen');
    }

    preload() {
        // Load assets
        this.load.image('background', 'assets/shipYellow_manned.png');
        this.load.spritesheet('shipYellow_manned_animation', 'assets/shipYellow_manned.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        // Create title screen elements
        this.add.image(400, 300, 'background');

        const titleText= this.add.text(400, 200, 'Gallery Shooter', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

        this.tweens.add({
            targets: titleText,
            x: 400, 
            y: 100, 
            scaleX: 1.2, 
            scaleY: 1.2, 
            duration: 2000, 
            yoyo: true, 
            repeat: -1 
        });
        

        const startButton = this.add.text(400, 500, 'Start Game', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5); // Adjust button position
        startButton.setInteractive();
        startButton.on('pointerup', () => {
            this.scene.start('GalleryShooter');
        });
    }
}

class GalleryShooter extends Phaser.Scene {
    constructor() {
        super('GalleryShooter');
        this.init_game();
    
}

// initialize game

init_game(){
    this.playerShipSpeed = 200; 
    this.playerShipY = 600;
    this.emittedSpriteSpeed = 15; 
    this.emittedSpriteActive = false; 
    this.playerHealth = 30; 
    this.score = 0; 
    this.enemyGroup = null; 
    this.playerProjectiles = null; 
    this.enemyProjectiles = null; 
    this.scoreText = null; 
    this.healthText = null; 
    this.enemyType = ''; 
    this.healthIcons = []; 
    this.maxHeartHealth = 3; 
    this.maxScore = 1000;
    this.emittedSpriteActive = false;
    this.emittedSprite = null;
    this.powerup = null;
    this.hasCollisionOccurred = false;
}

preload() {

    // Load assets

    this.load.image('playerShip', 'assets/playerShip1_red.png');
    this.load.image('emittedSprite', 'assets/laserBlue01.png');
    this.load.image('alienBlue', 'assets/alienBlue_stand.png');
    this.load.image('alienGreen', 'assets/alienGreen_walk1.png');
    this.load.image('playerProjectile', 'assets/laserBlue01.png');
    this.load.image('enemyProjectile', 'assets/laserBlue01.png');
    this.load.image('powerup', 'assets/powerupRed_bolt.png'); 
    this.load.image('heart', 'assets/tile_heart.png'); 
    this.load.image('rock', 'assets/meteorGrey_med2.png'); 
    this.load.image('enemyShip', 'assets/enemyBlue2.png');
    this.load.audio('explosionSound', 'assets/laserLarge_003.ogg');
    this.load.audio('game_end', 'assets/computerNoise_003.ogg')
       
           
}

startgame()
{

    const controlInstructions1 = this.add.text(500, this.sys.game.config.height -600, 'Left/Right keys to move',{ fontSize: '18px', fill: '#fff' });
    const controlInstructions2 = this.add.text(500, this.sys.game.config.height -575, 'Spacebar - attack',{ fontSize: '18px', fill: '#fff' });
    const controlInstructions3 = this.add.text(500, this.sys.game.config.height - 550, 'Key P for power-up',{ fontSize: '18px', fill: '#fff' });


    this.playerShip = this.physics.add.sprite(100, this.playerShipY, 'playerShip').setOrigin(0.5, 0.5);
    
    this.playerShip.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enemyShipGroup = this.physics.add.group();
    this.playerProjectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.enemyGroup = this.physics.add.group();

    if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P), 500)) {
        this.emitObject();
    }

            this.startLevel();
            this.scoreText = this.add.text(this.sys.game.config.width - 475, this.sys.game.config.height - 50, 'Score: 0', { fontSize: '25px', fill: '#fff' });
            this.healthText = this.add.text(this.sys.game.config.width - 300, this.sys.game.config.height - 50, 'Player Health: ' + this.playerHealth, { fontSize: '25px', fill: '#fff' });
    
            // Start enemy wave
            this.spawnEnemyWave();
            this.createPath();
            this.createHealthIcons();
}

create() {

    this.startgame();

    
}

update() {

    // Player movement
    if (this.cursors.left.isDown) {
        this.playerShip.setVelocityX(-this.playerShipSpeed);
    } else if (this.cursors.right.isDown) {
        this.playerShip.setVelocityX(this.playerShipSpeed);
    } else {
        this.playerShip.setVelocityX(0);
    }

    // Player shooting towards enemies

    if (this.input.keyboard.checkDown(this.cursors.space, 500)) {
        this.enemyGroup.getChildren().forEach((enemy) => {
            this.shootProjectile(this.playerShip, this.playerProjectiles, enemy);
        });
    }


    if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P), 500)) {
        this.emitObject();
        console.log('test');
        this.hasCollisionOccurred = false;
    }


    // Collisions

    this.physics.overlap(this.playerProjectiles, this.enemyGroup, this.projectileEnemyCollision, null, this);
    this.physics.overlap(this.enemyProjectiles, this.playerShip, this.enemyPlayerCollision, null, this);
    
       
    if (!this.emittedSpriteActive && !this.hasCollisionOccurred  && this.emittedSprite && this.powerup)   {
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.emittedSprite.getBounds(), this.powerup.getBounds())) {
            console.log("Powerup!!")
            this.emittedSpriteActive = true;
            this.hasCollisionOccurred = true;
            if (this.playerHealth+10 >= 30)
            {
                this.playerHealth=30;
            }
            else{
                this.playerHealth=this.playerHealth+10;
            }    
            this.healthText.setText('Player Health: ' + this.playerHealth);
            this.updateHeartHealth();
            this.emittedObjectPowerupCollision(this.emittedSprite, this.powerup);

        }
    }
    
     
}

startLevel() {
    this.createEnemyWave('alienGreen');
}

emitObject() {

if (!this.emittedSpriteActive && Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P))) {
    
    this.emittedSprite = this.physics.add.sprite(this.playerShip.x, this.playerShip.y, 'emittedSprite');
    this.emittedSprite.setVelocityY(-175);
    this.emittedSprite.setCollideWorldBounds(false);
    this.emittedSprite.setBounce(1);
    this.emittedSpriteActive = false;
    console.log(this.emittedSprite);
    console.log(this.powerup);
    
    this.physics.add.existing(this.emittedSprite);
}
}


emittedObjectPowerupCollision(emittedObject, powerup) {
    emittedObject.destroy();
    powerup.destroy();
    this.emittedSpriteActive = true;
    this.hasCollisionOccurred = true;
}

// Create enemy waves
createEnemyWave() {
const maxEnemies = 4;
const numEnemies = Phaser.Math.Between(1, maxEnemies); 
const enemyTypes = ['alienBlue', 'alienGreen'];
const enemyShipType = 'enemyShip'; 
const spawnPositions = [];

for (let i = 0; i < numEnemies; i++) {
    let newPosition;
    do {
        newPosition = { x: Phaser.Math.Between(100, 700), y: Phaser.Math.Between(-200, -100) };
    } while (this.isPositionOccupied(newPosition, spawnPositions)); 

    spawnPositions.push(newPosition);
}

spawnPositions.forEach((position) => {
    const { x, y } = position;
    let enemyType;
    if (Phaser.Math.Between(0, 1) === 0 && enemyTypes.length > 0) {
        enemyType = Phaser.Math.RND.pick(enemyTypes); 
    } else {
        enemyType = enemyShipType; 
    }

    const enemy = this.enemyGroup.create(x, y, enemyType);
    enemy.setVelocityY(100); 
    enemy.setCollideWorldBounds(false);
    enemy.setBounce(1); 
    enemy.setInteractive(); 

    if (enemyType === 'alienBlue' || enemyType === 'alienGreen') {
        enemy.setScale(0.7); 
    }

    this.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
        this.shootProjectile(enemy, this.enemyProjectiles, this.playerShip);
    });
});
}


isPositionOccupied(newPosition, existingPositions) {
// Check if the new position is too close to any existing position
for (const existingPosition of existingPositions) {
    const distance = Phaser.Math.Distance.Between(existingPosition.x, existingPosition.y, newPosition.x, newPosition.y);
    if (distance < 100) {
        return true;
    }
}
return false;
}



createPath() {
const points = [
    { x: 100, y: -100 },
    { x: 200, y: 100 },
    { x: 400, y: 200 },
    { x: 600, y: 100 },
    { x: 700, y: -100 }
];

const curve = new Phaser.Curves.Spline(points);

this.createPowerup(curve);
}



createPowerup(curve) {
const numPowerups = 1;
const powerupSpacing = 100; 

this.powerupGroup = this.physics.add.group();

for (let i = 0; i < numPowerups; i++) {
    const powerup = this.add.follower(curve, 0, 0, 'powerup');
    this.powerup=powerup;
    powerup.startFollow({
        duration: 7000, // Duration of each movement
        yoyo: true,
        repeat: -1,
        rotateToPath: true,
        rotationOffset: -Math.PI / 2,
        delay: i * powerupSpacing // Delay for each power-up
    });

    powerup.setPosition(curve.points[0].x - i * powerupSpacing, curve.points[0].y); // Adjust starting position
    this.physics.add.existing(powerup); 

    this.powerupGroup.add(powerup);
}

this.powerup.once('destroy', () => {
    this.time.delayedCall(4000, () => {
        this.createPath();
        this.emittedSpriteActive = false;
        this.hasCollisionOccurred = true;
    });
});
}



spawnEnemyWave() {
    const delay =8000; 
    this.time.delayedCall(delay, () => {
        this.createEnemyWave(this.enemyType); 
        this.spawnEnemyWave(); // Call recursively to spawn enemies continuously
    });
}

shootProjectile(source, projectileGroup, target) {
    if (target.y >= 0 && target.y <= this.sys.game.config.height) {
        const angleToTarget = Phaser.Math.Angle.Between(source.x, source.y, target.x, target.y);
        const velocityX = Math.cos(angleToTarget) * 200; 
        const velocityY = Math.sin(angleToTarget) * 200; 

        let projectileKey = 'enemyProjectile'; // Default projectile key
    
        
        if (source.texture.key === 'alienBlue' || source.texture.key === 'alienGreen') {
            projectileKey = 'rock'; 
        }

        const projectile = projectileGroup.create(source.x, source.y, projectileKey);
        projectile.setVelocity(velocityX, velocityY);
        projectile.setOrigin(0.5, 0.5);
        projectile.setData('owner', source); 
    }    
}

projectileEnemyCollision(projectile, enemy) {
    this.explosionSound = this.sound.add('explosionSound');
    this.explosionSound.play();
    projectile.destroy();
    enemy.destroy();

    let enemyType = enemy.texture.key; 

    switch (enemyType) {
        case 'alienBlue':
        case 'alienGreen':
            this.score += 50; 
            break;
        case 'enemyShip':
            this.score += 100; 
            break;
        default:
            break;
    }

    this.updateScoreText(); 
}

updateHeartHealth()
{
    for (let i = 0; i < this.maxHeartHealth; i++) {
        if (i < Math.ceil(this.playerHealth / 10)) {
            this.healthIcons[i].setVisible(true);
        } else {
            this.healthIcons[i].setVisible(false);
        }
    }
}

enemyPlayerCollision(player, projectile) {
    const owner = projectile.getData('owner');
    if (owner && this.enemyGroup.contains(owner)) {
        projectile.destroy();
        this.playerHealth--; 

        if (this.playerHealth <= 0) {
            this.gameOver();
        } else {
            // Update health text
            this.healthText.setText('Player Health: ' + this.playerHealth);
            this.updateHeartHealth();

        }
        
    } else {
        projectile.destroy(); 
    }
}

updateScoreText() {
   
    this.scoreText.setText('Score: ' +  this.score);
    if (this.score >= this.maxScore)
    {
        this.physics.pause(); 
        this.input.keyboard.enabled = false;

        const message = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 , 'Completed Level 1', { fontSize: '24px', fill: '#fff' });
        this.game_end = this.sound.add('game_end');
        this.game_end.play()
        message.setOrigin(0.5);
        this.resetgame();
    }
}

resetgame()
{

    const restartButton = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 50, 'Restart', { fontSize: '24px', fill: '#fff' })
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.restart(); 
            this.input.keyboard.enabled = true;
            this.init_game();
            this.startgame();
    });
}

createHealthIcons() {
    const startX = 500;
    const startY = this.sys.game.config.height - 100;
    const heartSpacing = 50;

    for (let i = 0; i < this.maxHeartHealth; i++) {
        const heart = this.add.sprite(startX + i * (heartSpacing + 16), startY, 'heart').setOrigin(0, 0.5);
        heart.setScale(0.9);
        this.healthIcons.push(heart);
    }
}

gameOver() {
    this.playerHealth=0;
    this.updateHeartHealth();

    
    this.healthText.setText('Player Health: ' + this.playerHealth);
    this.resetgame();
    this.game_end = this.sound.add('game_end');
    this.game_end.play();
    // Display game over message
    const gameOverText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'Game Over', { fontSize: '48px', fill: '#fff' });
    gameOverText.setOrigin(0.5);
    this.resetgame();

}
}
