"use client";

import React, { useEffect, useRef, useState } from "react";

interface PetGameSceneProps {
  className?: string;
}

export const PetGameScene: React.FC<PetGameSceneProps> = ({ className = "" }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [petStats, setPetStats] = useState({
    happiness: 100,
    energy: 100,
    hunger: 50,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!gameRef.current || !isClient) return;

    let mounted = true;

    // Dynamically import Phaser only on client side
    import('phaser').then((Phaser) => {
      if (!mounted || !gameRef.current) return;

      // Game configuration
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#f0f9ff',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        scene: {
          preload: preload,
          create: create,
          update: update
        },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      let pet: Phaser.Physics.Arcade.Sprite;
      let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
      let petState = 'idle';
      let lastInteraction = Date.now();
      let particles: Phaser.GameObjects.Particles.ParticleEmitter;
      let statsText: Phaser.GameObjects.Text;
      let interactionText: Phaser.GameObjects.Text;
      let currentStats = { ...petStats };
      let environmentImage: Phaser.GameObjects.Image;
      let vignetteGraphics: Phaser.GameObjects.Graphics | null;
      let previousWidth = window.innerWidth;
      let previousHeight = window.innerHeight;

      // ===== ASSET CONFIGURATION =====
      // Easy configuration for all game assets
      const ASSET_CONFIG = {
        // Pet configuration
        pet: {
          loadSize: { width: 800, height: 800 },
          scale: {
            mobile: 0.3,    // < 768px
            tablet: 0.4,    // 768px - 1023px
            desktop: 0.8    // >= 1024px
          },
          position: {
            x: 0.5,  // 0.5 = center (percentage of screen width)
            y: 0.76   // 0.5 = center (percentage of screen height)
          },
          depth: 3
        },
        // Environment configuration (includes background, floor, and pot)
        environment: {
          loadSize: { width: 1920, height: 1080 },
          position: {
            x: 0.5,  // center horizontally
            y: 0.5   // center vertically
          },
          depth: 0
        },
        // Vignette configuration
        vignette: {
          enabled: true,
          maxRadiusMultiplier: 0.8,  // Multiplier for max radius (0.8 = 80% of screen)
          minRadiusMultiplier: 0.3,  // Multiplier for min radius (0.3 = 30% of screen)
          steps: 5,                  // Number of gradient steps (higher = smoother)
          maxAlpha: 0.6,              // Maximum opacity at edges (0-1)
          depth: 1000,                // Render depth (higher = on top)
          blendMode: 'NORMAL'       // Blend mode: 'MULTIPLY', 'NORMAL', 'ADD', etc.
        }
      };
      // ===== END CONFIGURATION =====

      // Helper function to get responsive scale
      const getResponsiveScale = (width: number, scaleConfig: { mobile: number, tablet: number, desktop: number }) => {
        if (width < 768) return scaleConfig.mobile;
        if (width < 1024) return scaleConfig.tablet;
        return scaleConfig.desktop;
      };

      // Helper function to create vignette effect
      const createVignette = (scene: Phaser.Scene, width: number, height: number) => {
        const vignetteConfig = ASSET_CONFIG.vignette;
        
        // Check if vignette is enabled
        if (!vignetteConfig.enabled) {
          return null;
        }
        
        const graphics = scene.add.graphics();
        
        // Create radial gradient vignette effect using config
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.max(width, height) * vignetteConfig.maxRadiusMultiplier;
        const minRadius = Math.max(width, height) * vignetteConfig.minRadiusMultiplier;
        
        // First fill the entire screen with white at max alpha
        graphics.fillStyle(0xffffff, vignetteConfig.maxAlpha);
        graphics.fillRect(0, 0, width, height);
        
        // Then draw circles from outside to inside, decreasing alpha to create clear center
        for (let i = vignetteConfig.steps - 1; i >= 0; i--) {
          const progress = i / vignetteConfig.steps;
          const radius = minRadius + (maxRadius - minRadius) * progress;
          const alpha = (1 - Math.pow(progress, 2)) * vignetteConfig.maxAlpha; // Inverted for clear center
          
          graphics.fillStyle(0xffffff, alpha);
          graphics.fillCircle(centerX, centerY, radius);
        }
        
        // Set depth and blend mode from config
        graphics.setDepth(vignetteConfig.depth);
        
        // Map blend mode string to Phaser blend mode
        const blendModes: { [key: string]: number } = {
          'MULTIPLY': Phaser.BlendModes.MULTIPLY,
          'NORMAL': Phaser.BlendModes.NORMAL,
          'ADD': Phaser.BlendModes.ADD,
          'SCREEN': Phaser.BlendModes.SCREEN,
          'OVERLAY': Phaser.BlendModes.OVERLAY
        };
        graphics.setBlendMode(blendModes[vignetteConfig.blendMode] || Phaser.BlendModes.MULTIPLY);
        
        return graphics;
      };

      function preload(this: Phaser.Scene) {
        // Load assets using configuration
        this.load.svg('pet', '/Group 79.svg', ASSET_CONFIG.pet.loadSize);
        this.load.svg('environment', '/enviroment.svg', ASSET_CONFIG.environment.loadSize);
        
        // Create a simple particle texture
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);
        graphics.destroy();
      }

      function create(this: Phaser.Scene) {
        const { width, height } = this.scale;

        // Add environment image using config
        const envConfig = ASSET_CONFIG.environment;
        environmentImage = this.add.image(
          width * envConfig.position.x,
          height * envConfig.position.y,
          'environment'
        );
        environmentImage.setDisplaySize(width, height);
        environmentImage.setDepth(envConfig.depth);

        // Create pet sprite using config
        const petConfig = ASSET_CONFIG.pet;
        pet = this.physics.add.sprite(
          width * petConfig.position.x,
          height * petConfig.position.y,
          'pet'
        );
        const petScale = getResponsiveScale(width, petConfig.scale);
        pet.setScale(petScale);
        pet.setDepth(petConfig.depth);
        pet.setInteractive({ useHandCursor: true });
        pet.setCollideWorldBounds(true);
        pet.setBounce(0.1);

        // Create particle emitter for interactions
        particles = this.add.particles(0, 0, 'particle', {
          speed: { min: 50, max: 150 },
          scale: { start: 1, end: 0 },
          alpha: { start: 1, end: 0 },
          lifespan: 600,
          tint: [0xfbbf24, 0x60a5fa, 0xf472b6],
          emitting: false
        });

        // Add interaction text (hidden by default since we have UI overlay)
        interactionText = this.add.text(width / 2, 100, '', {
          fontSize: '24px',
          color: '#3b82f6',
          fontFamily: 'Poppins, sans-serif',
          align: 'center'
        });
        interactionText.setOrigin(0.5);
        interactionText.setAlpha(0);

        // Stats display removed - no longer showing on screen
        statsText = this.add.text(0, 0, '', {
          fontSize: '16px',
          color: '#1e293b',
          fontFamily: 'Poppins, sans-serif',
          backgroundColor: '#ffffff',
          padding: { x: 10, y: 10 }
        });
        statsText.setAlpha(0); // Hidden

        // Pet click interaction
        pet.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          petState = 'excited';
          pet.setVelocity(
            Phaser.Math.Between(-100, 100),
            Phaser.Math.Between(-200, -100)
          );
          
          // Emit particles
          particles.setPosition(pet.x, pet.y);
          particles.explode(20);

          // Update stats
          updatePetStats('happiness', 5);
          updatePetStats('energy', -2);
          
          lastInteraction = Date.now();
          interactionText.setText('Yay! 🎉');
          
          setTimeout(() => {
            petState = 'idle';
            interactionText.setText('Click or drag your pet!');
          }, 1000);
        });

        // Pet drag interaction
        this.input.setDraggable(pet);
        
        this.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
          if (gameObject === pet) {
            pet.x = dragX;
            pet.y = dragY;
            petState = 'dragging';
            
            // Trail effect while dragging
            particles.setPosition(pet.x, pet.y);
            particles.emitParticle(2);
          }
        });

        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
          if (gameObject === pet) {
            petState = 'idle';
            updatePetStats('happiness', 3);
          }
        });

        // Keyboard controls
        if (this.input.keyboard) {
          cursors = this.input.keyboard.createCursorKeys();
        }

        // Add floating animation
        this.tweens.add({
          targets: pet,
          y: pet.y - 10,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Add idle blinking animation
        this.time.addEvent({
          delay: 3000,
          callback: () => {
            if (petState === 'idle') {
              this.tweens.add({
                targets: pet,
                alpha: 0.7,
                duration: 100,
                yoyo: true,
                repeat: 1
              });
            }
          },
          loop: true
        });

        // Create vignette effect
        vignetteGraphics = createVignette(this, width, height);

        // Handle resize events
        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
          const { width, height } = gameSize;
          
          // Resize and reposition environment using config
          if (environmentImage) {
            const envConfig = ASSET_CONFIG.environment;
            environmentImage.setPosition(
              width * envConfig.position.x,
              height * envConfig.position.y
            );
            environmentImage.setDisplaySize(width, height);
          }
          
          // Reposition and rescale pet when resolution changes
          if (pet) {
            const petConfig = ASSET_CONFIG.pet;
            
            // Calculate the pet's relative position as a percentage
            const relativeX = pet.x / previousWidth;
            const relativeY = pet.y / previousHeight;
            
            // Apply the relative position to the new dimensions
            pet.x = relativeX * width;
            pet.y = relativeY * height;
            
            // Update pet scale based on new screen width using config
            const petScale = getResponsiveScale(width, petConfig.scale);
            pet.setScale(petScale);
            
            // Ensure pet stays within bounds with margin
            const margin = 150; // Safety margin from edges
            const petBounds = pet.getBounds();
            const halfWidth = petBounds.width / 2;
            const halfHeight = petBounds.height / 2;
            
            // Clamp position to keep pet fully visible
            if (pet.x - halfWidth < margin) pet.x = margin + halfWidth;
            if (pet.x + halfWidth > width - margin) pet.x = width - margin - halfWidth;
            if (pet.y - halfHeight < margin) pet.y = margin + halfHeight;
            if (pet.y + halfHeight > height - margin) pet.y = height - margin - halfHeight;
          }
          
          // Update previous dimensions for next resize
          previousWidth = width;
          previousHeight = height;
          
          // Update interaction text position
          if (interactionText) {
            interactionText.setPosition(width / 2, 100);
          }

          // Recreate vignette on resize
          if (vignetteGraphics) {
            vignetteGraphics.destroy();
            vignetteGraphics = createVignette(this, width, height);
          }
        });
      }

      function update(this: Phaser.Scene) {
        if (!pet) return;

        // Keyboard movement
        if (cursors) {
          if (cursors.left.isDown) {
            pet.setVelocityX(-200);
            pet.setFlipX(true);
          } else if (cursors.right.isDown) {
            pet.setVelocityX(200);
            pet.setFlipX(false);
          } else if (petState !== 'dragging') {
            pet.setVelocityX(pet.body!.velocity.x * 0.95);
          }

          if (cursors.up.isDown && pet.body!.touching.down) {
            pet.setVelocityY(-300);
          }
        }

        // Gradually decrease stats over time
        const now = Date.now();
        if (now - lastInteraction > 5000) {
          if (Math.random() < 0.001) {
            updatePetStats('hunger', 1);
            updatePetStats('energy', -0.5);
          }
        }

        // Update stats display
        updateStatsDisplay();
      }

      function updatePetStats(stat: 'happiness' | 'energy' | 'hunger', change: number) {
        currentStats = {
          ...currentStats,
          [stat]: Math.max(0, Math.min(100, currentStats[stat] + change))
        };
        setPetStats(currentStats);
      }

      function updateStatsDisplay() {
        if (statsText) {
          statsText.setText(
            `😊 Happiness: ${Math.round(currentStats.happiness)}%\n` +
            `⚡ Energy: ${Math.round(currentStats.energy)}%\n` +
            `🍔 Hunger: ${Math.round(currentStats.hunger)}%`
          );
        }
      }

      // Initialize Phaser game
      phaserGameRef.current = new Phaser.Game(config);
    });

    // Cleanup on unmount
    return () => {
      mounted = false;
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [isClient, petStats]);

  if (!isClient) {
    return (
      <div className={`w-full h-full bg-gradient-to-b from-blue-50 to-white flex items-center justify-center ${className}`}>
        <p className="text-gray-400 text-lg">Loading game...</p>
      </div>
    );
  }

  return (
    <div 
      ref={gameRef} 
      className={`w-full h-full ${className}`}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
};
