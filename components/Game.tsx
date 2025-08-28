// "use client";

// import { useEffect, useRef } from "react";
// import * as Phaser from "phaser";

// export default function GamePage() {
//   const gameRef = useRef<Phaser.Game | null>(null);

//   useEffect(() => {
//     if (gameRef.current) return;

//     // --- Main Scene ---
//     class MainScene extends Phaser.Scene {
//       player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
//       cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
//       coins!: Phaser.Physics.Arcade.Group;
//       score: number = 0;
//       scoreText!: Phaser.GameObjects.Text;

//       preload() {
//         // Sprites
//         this.load.image("tiles", "/assets/tiles/tileset.png");
//         this.load.tilemapTiledJSON("map", "/assets/maps/level1.json");
//         this.load.spritesheet("player", "/assets/sprites/player.png", {
//           frameWidth: 32,
//           frameHeight: 32,
//         });
//         this.load.spritesheet("coin", "/assets/sprites/coin.png", {
//           frameWidth: 16,
//           frameHeight: 16,
//         });
//         this.load.image("enemy", "/assets/sprites/enemy.png");

//         // Background layers
//         this.load.image("bg1", "/assets/sprites/bg-layer1.png");
//         this.load.image("bg2", "/assets/sprites/bg-layer2.png");

//         // Sounds
//         this.load.audio("jump", "/assets/sounds/jump.wav");
//         this.load.audio("coinSound", "/assets/sounds/coin.wav");
//       }

//       create() {
//         // Background parallax
//         this.add.image(0, 0, "bg1").setOrigin(0, 0).setScrollFactor(0.2);
//         this.add.image(0, 0, "bg2").setOrigin(0, 0).setScrollFactor(0.5);

//         // Tilemap
//         const map = this.make.tilemap({ key: "map" });
//         const tileset = map.addTilesetImage("tileset", "tiles");
//         const ground = map.createLayer("Ground", tileset, 0, 0);
//         ground.setCollisionByProperty({ collides: true });

//         // Player
//         this.player = this.physics.add.sprite(100, 200, "player");
//         this.player.setCollideWorldBounds(true);

//         // Animations
//         this.anims.create({
//           key: "run",
//           frames: this.anims.generateFrameNumbers("player", { start: 1, end: 3 }),
//           frameRate: 10,
//           repeat: -1,
//         });
//         this.anims.create({ key: "idle", frames: [{ key: "player", frame: 0 }] });
//         this.anims.create({ key: "jump", frames: [{ key: "player", frame: 2 }] });
//         this.anims.create({
//           key: "coinSpin",
//           frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 3 }),
//           frameRate: 6,
//           repeat: -1,
//         });

//         // Coins
//         this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
//         const coinLayer = map.getObjectLayer("Coins");
//         if (coinLayer) {
//           coinLayer.objects.forEach((obj: any) => {
//             const coin = this.coins.create(obj.x, obj.y - 16, "coin");
//             (coin as Phaser.Physics.Arcade.Sprite).anims.play("coinSpin");
//           });
//         }

//         // Collisions
//         this.physics.add.collider(this.player, ground);
//         this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);

//         // Input
//         this.cursors = this.input.keyboard.createCursorKeys();

//         // Score
//         this.scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "18px", color: "#fff" }).setScrollFactor(0);

//         // Camera follow
//         this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
//       }

//       update() {
//         const body = this.player.body as Phaser.Physics.Arcade.Body;
//         const onGround = body.blocked.down || body.touching.down;

//         // Movement
//         if (this.cursors.left?.isDown) {
//           this.player.setVelocityX(-160);
//           this.player.anims.play("run", true);
//           this.player.setFlipX(true);
//         } else if (this.cursors.right?.isDown) {
//           this.player.setVelocityX(160);
//           this.player.anims.play("run", true);
//           this.player.setFlipX(false);
//         } else {
//           this.player.setVelocityX(0);
//           this.player.anims.play("idle", true);
//         }

//         // Jump
//         if (Phaser.Input.Keyboard.JustDown(this.cursors.up!) && onGround) {
//           this.player.setVelocityY(-300);
//           this.sound.play("jump");
//         }

//         if (!onGround) this.player.anims.play("jump", true);
//       }

//       collectCoin(player: any, coin: any) {
//         coin.destroy();
//         this.sound.play("coinSound");
//         this.score += 10;
//         this.scoreText.setText("Score: " + this.score);
//       }
//     }

//     // --- Phaser Game ---
//     gameRef.current = new Phaser.Game({
//       type: Phaser.AUTO,
//       width: window.innerWidth,
//       height: window.innerHeight,
//       parent: "game-container",
//       physics: { default: "arcade", arcade: { gravity: { y: 600 }, debug: false } },
//       scene: MainScene,
//     });

//     return () => {
//       gameRef.current?.destroy(true);
//       gameRef.current = null;
//     };
//   }, []);

//   return <div id="game-container" style={{ width: "100%", height: "100vh" }} />;
// }
