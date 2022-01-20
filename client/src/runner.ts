import { useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { Queue } from "./queue";

export const useRunner = <T>(
  queue: Queue<T>,
  showContent: () => Promise<void>
) => {
  const containerControls = useAnimation();
  const [data, setData] = useState(null as null | T);

  useEffect(() => {
    (async () => {
      let isShown = false;
      containerControls.set({
        opacity: 0,
      });
      for (;;) {
        if (queue.isEmpty()) {
          await containerControls.start({
            opacity: 0,
            transition: {
              duration: 0.5,
              delay: 0.5,
            },
          });
          isShown = false;
        }
        const tweet = await queue.dequeue();
        if (!isShown) {
          await containerControls.start({
            opacity: 1,
            transition: {
              duration: 0.5,
            },
          });
          isShown = true;
        }
        setData(tweet);
        await showContent();
        setData(null);
      }
    })();

    return () => {
      queue.dispose();
    };
  }, [containerControls, showContent, queue]);

  return {
    data,
    containerControls,
  };
};
