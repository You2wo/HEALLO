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
      let petState = 'idle';
      let lastInteraction = Date.now();
      let statsText: Phaser.GameObjects.Text;
      let currentStats = { ...petStats };
      let environmentImage: Phaser.GameObjects.Image;
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
        }
      };
      // ===== END CONFIGURATION =====

      // Helper function to get responsive scale with aspect ratio consideration
      const getResponsiveScale = (width: number, height: number, scaleConfig: { mobile: number, tablet: number, desktop: number }) => {
        const aspectRatio = width / height;
        let baseScale;
        
        if (width < 768) {
          baseScale = scaleConfig.mobile;
        } else if (width < 1024) {
          baseScale = scaleConfig.tablet;
        } else {
          baseScale = scaleConfig.desktop;
        }
        
        // Adjust scale based on aspect ratio
        // 16:10 = 1.6, 16:9 = 1.778
        if (aspectRatio >= 1.75) {
          // 16:9 or wider - scale down by 12%
          baseScale *= 0.88;
        }
        if (aspectRatio >= 1.85) {
          // Ultra-wide - scale down more
          baseScale *= 0.85;
        }
        
        return baseScale;
      };

      
      function preload(this: Phaser.Scene) {
        // Load assets using configuration
        this.load.svg('pet', '/Group 79.svg', ASSET_CONFIG.pet.loadSize);
        this.load.svg('environment', '/enviroment.svg', ASSET_CONFIG.environment.loadSize);
      }

      function create(this: Phaser.Scene) {
        const { width, height } = this.scale;

        // Add environment image using config with aspect ratio preservation
        const envConfig = ASSET_CONFIG.environment;
        environmentImage = this.add.image(
          width * envConfig.position.x,
          height * envConfig.position.y,
          'environment'
        );
        
        // Calculate scale to cover viewport while maintaining aspect ratio
        const imageAspect = ASSET_CONFIG.environment.loadSize.width / ASSET_CONFIG.environment.loadSize.height;
        const screenAspect = width / height;
        let scale;
        
        if (screenAspect > imageAspect) {
          // Screen is wider than image - scale to width
          scale = width / ASSET_CONFIG.environment.loadSize.width;
        } else {
          // Screen is taller than image - scale to height
          scale = height / ASSET_CONFIG.environment.loadSize.height;
        }
        
        environmentImage.setScale(scale);
        environmentImage.setDepth(envConfig.depth);

        // Create pet sprite using config
        const petConfig = ASSET_CONFIG.pet;
        pet = this.physics.add.sprite(
          width * petConfig.position.x,
          height * petConfig.position.y,
          'pet'
        );
        const petScale = getResponsiveScale(width, height, petConfig.scale);
        pet.setScale(petScale);
        pet.setDepth(petConfig.depth);
        pet.setInteractive({ useHandCursor: true });
        pet.setCollideWorldBounds(true);
        pet.setBounce(0.1);

        // Stats display removed - no longer showing on screen
        statsText = this.add.text(0, 0, '', {
          fontSize: '16px',
          color: '#1e293b',
          fontFamily: 'Poppins, sans-serif',
          backgroundColor: '#ffffff',
          padding: { x: 10, y: 10 }
        });
        statsText.setAlpha(0); // Hidden

        // Pet drag interaction
        this.input.setDraggable(pet);
        
        this.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
          if (gameObject === pet) {
            pet.x = dragX;
            pet.y = dragY;
            petState = 'dragging';
          }
        });

        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
          if (gameObject === pet) {
            petState = 'idle';
            updatePetStats('happiness', 3);
          }
        });

        // Add floating animation
        this.tweens.add({
          targets: pet,
          y: pet.y - 10,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Handle resize events
        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
          const { width, height } = gameSize;
          
          // Resize and reposition environment using config with aspect ratio preservation
          if (environmentImage) {
            const envConfig = ASSET_CONFIG.environment;
            environmentImage.setPosition(
              width * envConfig.position.x,
              height * envConfig.position.y
            );
            
            // Calculate scale to cover viewport while maintaining aspect ratio
            const imageAspect = ASSET_CONFIG.environment.loadSize.width / ASSET_CONFIG.environment.loadSize.height;
            const screenAspect = width / height;
            let scale;
            
            if (screenAspect > imageAspect) {
              // Screen is wider than image - scale to width
              scale = width / ASSET_CONFIG.environment.loadSize.width;
            } else {
              // Screen is taller than image - scale to height
              scale = height / ASSET_CONFIG.environment.loadSize.height;
            }
            
            environmentImage.setScale(scale);
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
            
            // Update pet scale based on new screen width and height using config
            const petScale = getResponsiveScale(width, height, petConfig.scale);
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
        });
      }

      function update(this: Phaser.Scene) {
        if (!pet) return;

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
