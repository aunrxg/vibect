import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import MiniPlayer from "./mini-player";
import { cn } from "@/lib/utils";

interface DraggableCardProps {
  children: ReactNode;
  isOpen: boolean; // This could represent if it's expanded or not
  onToggle?: (expanded: boolean) => void;
}

export default function DraggableCard({
  children,
  isOpen,
  onToggle,
}: DraggableCardProps) {
  const controls = useAnimation();
  const y = useMotionValue(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const COLLAPSED_HEIGHT = 80; // Height of the mini player bar
  const height = typeof window !== "undefined" ? window.innerHeight : 1000;
  const snapCollapsed = height - COLLAPSED_HEIGHT;
  const snapExpanded = 0;

  // Opacity transforms based on y position
  const miniPlayerOpacity = useTransform(
    y,
    [snapCollapsed, snapCollapsed - 100],
    [0, 1],
  );
  const contentOpacity = useTransform(
    y,
    [snapCollapsed, snapCollapsed - 200],
    [0, 1],
  );
  const handleOpacity = useTransform(
    y,
    [snapCollapsed, snapCollapsed - 50],
    [1, 0],
  );

  const onDragEnd = (event: any, info: any) => {
    const velocity = info.velocity.y;
    const currentY = y.get();

    // Snap to top if moving up fast or passed threshold
    if (velocity < -500 || currentY < height / 2) {
      expand();
    } else {
      collapse();
    }
  };

  const expand = () => {
    controls.start({
      y: snapExpanded,
      transition: { type: "spring", damping: 30, stiffness: 300 },
    });
    setIsExpanded(true);
    onToggle?.(true);
  };

  const collapse = () => {
    controls.start({
      y: snapCollapsed,
      transition: { type: "spring", damping: 30, stiffness: 300 },
    });
    setIsExpanded(false);
    onToggle?.(false);
  };

  useEffect(() => {
    if (isOpen) {
      expand();
    } else {
      collapse();
    }
  }, [isOpen]);

  useEffect(() => {
    // Initial state
    controls.set({ y: snapCollapsed });
  }, [controls, snapCollapsed]);

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: snapCollapsed }}
      dragElastic={0.1}
      onDragEnd={onDragEnd}
      animate={controls}
      style={{ y }}
      className="fixed inset-x-0 top-0 z-50 flex flex-col bg-transparent backdrop-blur-xl border-t border-border shadow-[0_-12px_40px_rgba(0,0,0,0.5)] h-screen overflow-hidden"
    >
      {/* Header Area */}
      <div className="relative w-full">
        {/* Drag Handle - only visible when collapsed */}
        <motion.div
          style={{ opacity: handleOpacity }}
          className="flex justify-center p-3 cursor-grab active:cursor-grabbing"
        >
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </motion.div>

        {/* Mini Player - visible only when expanding/expanded */}
        <motion.div
          style={{
            opacity: miniPlayerOpacity,
            pointerEvents: isExpanded ? "auto" : "none",
          }}
          onClick={(e) => {
            if (isExpanded) {
              e.stopPropagation();
              collapse();
            }
          }}
          className="absolute top-0 inset-x-0 cursor-pointer z-10"
        >
          <MiniPlayer />
        </motion.div>
      </div>

      {/* Main Tab Content - Padded down if expanded to NOT overlap MiniPlayer */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className={cn(
          "flex-1 overflow-y-auto px-4 pb-12 transition-all duration-300",
          isExpanded ? "pt-16" : "pt-2",
        )}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
