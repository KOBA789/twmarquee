import React, { useCallback, useLayoutEffect, useState } from "react";
import { AnimationControls, useAnimation } from "framer-motion";

const useMarqueeAnimation = (controls: AnimationControls) => {
  return useCallback(
    async (containerWidth: number, contentWidth: number) => {
      controls.stop();
      controls.set({
        opacity: 1,
        translateX: `${containerWidth}px`,
      });
      await controls.start({
        translateX: 0,
        transition: {
          duration: 1,
          ease: "easeOut",
        },
      });
      if (containerWidth < contentWidth) {
        const duration = (contentWidth - containerWidth) / 400;
        await controls.start({
          translateX: `${containerWidth - contentWidth}px`,
          transition: {
            delay: 1,
            duration,
            ease: "linear",
          },
        });
      }
      await controls.start({
        opacity: 0,
        transition: {
          delay: 2,
          duration: 0.2,
          ease: "linear",
        },
      });
    },
    [controls]
  );
};

const useBoundingClientRect = <E extends HTMLElement>(
  ref: React.RefObject<E>
) => {
  return useCallback(() => {
    if (ref.current === null) {
      return new DOMRect();
    }
    return ref.current.getBoundingClientRect();
  }, [ref]);
};

export const useMarquee = <E extends HTMLElement, F extends HTMLElement>(
  containerRef: React.RefObject<E>,
  contentRef: React.RefObject<F>
) => {
  const contentControls = useAnimation();
  const [isSteady, setIsSteady] = useState(false);
  const [onEnd, setOnEnd] = useState(() => (_: void) => {});
  const measureContainer = useBoundingClientRect(containerRef);
  const measureContent = useBoundingClientRect(contentRef);
  const marquee = useMarqueeAnimation(contentControls);
  useLayoutEffect(() => {
    if (isSteady) {
      const containerWidth = measureContainer().width;
      const contentWidth = measureContent().width;
      marquee(containerWidth, contentWidth).then(onEnd);
    } else {
      setIsSteady(true);
    }
  }, [isSteady, marquee, measureContainer, measureContent, onEnd]);
  const run = useCallback(() => {
    setIsSteady(false);
    return new Promise<void>((resolve) => {
      setOnEnd(() => resolve);
    });
  }, []);

  return {
    run,
    containerRef,
    contentRef,
    contentControls,
  };
};
