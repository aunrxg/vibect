"use client";

import { motion, useDragControls, useAnimation } from "framer-motion";
import { ReactNode, useEffect } from "react";

interface DraggableCardProps {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
}

export default function DraggableCard({ children }: DraggableCardProps) {
  const controls = useAnimation();

  // Snap points (y-coordinates relative to screen height)
  // 0: Full screen (top)
  // 0.5: Half screen
  // 0.9: Minimized (bottom)

  const snapPoints = [0, 0.4, 0.85]; // Proportions from top

  const onDragEnd = (event: any, info: any) => {
    const currentY = info.point.y;
    const height = window.innerHeight;
    const relativeY = currentY / height;

    // Find closest snap point
    let closest = snapPoints[0];
    let minDiff = Math.abs(relativeY - snapPoints[0]);

    for (let i = 1; i < snapPoints.length; i++) {
      const diff = Math.abs(relativeY - snapPoints[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closest = snapPoints[i];
      }
    }

    controls.start({
      y: closest * height,
      transition: { type: "spring", damping: 30, stiffness: 300 },
    });
  };

  useEffect(() => {
    // Initial position: minimized
    controls.set({ y: snapPoints[2] * window.innerHeight });
  }, [controls]);

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: window.innerHeight * 0.9 }}
      onDragEnd={onDragEnd}
      animate={controls}
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-card/95 backdrop-blur-xl border-t border-border rounded-t-[32px] shadow-[0_-8px_32px_rgba(0,0,0,0.4)] h-full overflow-hidden"
      style={{ top: 0 }} // Start from top, use y for offset
    >
      <div className="flex justify-center p-4">
        <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-12">{children}</div>
    </motion.div>
  );
}
