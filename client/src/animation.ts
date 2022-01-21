import { AnimationControls } from "framer-motion";

export const fadeIn = async (controls: AnimationControls) => {
  await controls.start({
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  });
};

export const fadeOut = async (controls: AnimationControls) => {
  await controls.start({
    opacity: 0,
    transition: {
      duration: 0.5,
    },
  });
};

export const slideInAndFadeOut = async (
  controls: AnimationControls,
  containerWidth: number,
  contentWidth: number
) => {
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
};
