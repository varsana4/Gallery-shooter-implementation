// Varsana Ilango Gomathynaveena
// Created: 4/24/2024
// Phaser: 3.70.0
//
// L11: 1-D movement
//
// A template for building a monster using a series of assets from
// a sprite atlas.
// 
// Art assets from Kenny Assets "Scribble-platformer" set:
// https://kenney.nl/assets/scribble-platformer

"use strict"

// game config
// Configure the game
const config = {
    
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [TitleScreen, GalleryShooter],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
    

};

const game = new Phaser.Game(config);
