"use client";

import React, { useEffect, useRef, useState } from "react";

interface PetSceneProps {
  // Called when the pet is tapped (not dragged).
  onPetTap?: () => void;
  // Change this value to make the pet celebrate.
  celebrateKey?: number;
  children?: React.ReactNode;
}

// ===== ASSET CONFIGURATION =====
const ASSETS = {
  pet: { key: "pet", url: "/pet.svg", width: 480, height: 800 },
  // floor: share of the image height taken by the floor, measured from the bottom
  wide: { key: "env-wide", url: "/scene/environment.webp", floor: 0.12 },
  tall: { key: "env-tall", url: "/scene/environment-mobile.webp", floor: 0.18 },
};
// ===== END CONFIGURATION =====

export const PetScene: React.FC<PetSceneProps> = ({ onPetTap, celebrateKey = 0, children }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const celebrateRef = useRef<(() => void) | null>(null);
  const onPetTapRef = useRef(onPetTap);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onPetTapRef.current = onPetTap;
  }, [onPetTap]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let game: Phaser.Game | null = null;
    let observer: ResizeObserver | null = null;

    // Dynamically import Phaser only on client side
    import("phaser").then((Phaser) => {
      if (cancelled) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let environment: Phaser.GameObjects.Image;
      let petHolder: Phaser.GameObjects.Container;
      let pet: Phaser.GameObjects.Image;
      let dragging = false;
      let dragDistance = 0;

      function preload(this: Phaser.Scene) {
        this.load.svg(ASSETS.pet.key, ASSETS.pet.url, { width: ASSETS.pet.width, height: ASSETS.pet.height });
        this.load.image(ASSETS.wide.key, ASSETS.wide.url);
        this.load.image(ASSETS.tall.key, ASSETS.tall.url);
      }

      // Where the pet stands for the current canvas size.
      function homePosition(scene: Phaser.Scene) {
        const { width, height } = scene.scale;
        const asset = height > width ? ASSETS.tall : ASSETS.wide;
        environment.setTexture(asset.key);
        const scale = Math.max(width / environment.width, height / environment.height);
        environment.setScale(scale).setPosition(width / 2, height);

        const floorHeight = environment.height * scale * asset.floor;
        const petHeight = Math.min(height * 0.55, width * 0.7, 440);
        pet.setScale(petHeight / ASSETS.pet.height);

        return { x: width / 2, y: height - floorHeight * 0.4 };
      }

      function layout(scene: Phaser.Scene) {
        const home = homePosition(scene);
        petHolder.setPosition(home.x, home.y);
        // Lets the speech bubble sit just above the pet's head.
        host?.parentElement?.style.setProperty("--pet-top", `${Math.round(home.y - pet.displayHeight)}px`);
      }

      function create(this: Phaser.Scene) {
        environment = this.add.image(0, 0, ASSETS.wide.key).setOrigin(0.5, 1);
        pet = this.add.image(0, 0, ASSETS.pet.key).setOrigin(0.5, 1);
        petHolder = this.add.container(0, 0, [pet]);
        layout(this);

        pet.setInteractive({ useHandCursor: true, draggable: true });

        // Add floating animation
        if (!reduceMotion) {
          this.tweens.add({
            targets: pet,
            y: -10,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        }

        // Pet drag interaction: it follows the pointer, then hops back home.
        pet.on("dragstart", () => {
          dragging = true;
          dragDistance = 0;
          this.tweens.killTweensOf(petHolder);
        });

        pet.on("drag", (pointer: Phaser.Input.Pointer) => {
          const dx = pointer.x - pointer.prevPosition.x;
          const dy = pointer.y - pointer.prevPosition.y;
          dragDistance += Math.abs(dx) + Math.abs(dy);
          petHolder.x = Phaser.Math.Clamp(petHolder.x + dx, 0, this.scale.width);
          petHolder.y = Phaser.Math.Clamp(petHolder.y + dy, pet.displayHeight * 0.6, this.scale.height);
        });

        pet.on("dragend", () => {
          dragging = false;
          const home = homePosition(this);
          if (dragDistance < 6) {
            onPetTapRef.current?.();
            squish(this);
          }
          this.tweens.add({
            targets: petHolder,
            x: home.x,
            y: home.y,
            duration: reduceMotion ? 0 : 500,
            ease: "Back.easeOut",
          });
        });

        this.scale.on("resize", () => {
          if (!dragging) layout(this);
        });

        celebrateRef.current = () => celebrate(this);
        setReady(true);
      }

      function squish(scene: Phaser.Scene) {
        if (reduceMotion) return;
        scene.tweens.add({
          targets: petHolder,
          scaleX: 1.06,
          scaleY: 0.94,
          duration: 110,
          yoyo: true,
          ease: "Sine.easeOut",
        });
      }

      // Level-up: two happy jumps.
      function celebrate(scene: Phaser.Scene) {
        if (reduceMotion || dragging) return;
        const home = homePosition(scene);
        scene.tweens.killTweensOf(petHolder);
        petHolder.setPosition(home.x, home.y).setScale(1);
        scene.tweens.add({
          targets: petHolder,
          y: home.y - Math.min(60, scene.scale.height * 0.12),
          duration: 260,
          yoyo: true,
          repeat: 1,
          ease: "Quad.easeOut",
        });
      }

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: host,
        transparent: true,
        scene: { preload, create },
        scale: {
          mode: Phaser.Scale.RESIZE,
          width: host.clientWidth,
          height: host.clientHeight,
        },
        audio: { noAudio: true },
        banner: false,
      });

      // The scene follows its container, not just the window.
      observer = new ResizeObserver(() => game?.scale.refresh());
      observer.observe(host);
    });

    // Cleanup on unmount
    return () => {
      cancelled = true;
      celebrateRef.current = null;
      observer?.disconnect();
      game?.destroy(true);
    };
  }, []);

  useEffect(() => {
    if (celebrateKey > 0) celebrateRef.current?.();
  }, [celebrateKey]);

  return (
    <section
      aria-label="Your pet"
      className="relative h-full min-h-0 w-full overflow-hidden bg-[#cfe9fb]"
    >
      <div ref={hostRef} className="absolute inset-0 touch-none" aria-hidden="true" />
      {!ready && <div className="skeleton absolute inset-0 rounded-none" />}
      <div className="scene-dim pointer-events-none absolute inset-0" />
      {children}
    </section>
  );
};
