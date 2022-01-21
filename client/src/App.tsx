import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { openEndlessTweetStream, Tweet } from "twmarquee-sdk";
import { fadeIn, fadeOut, slideInAndFadeOut } from "./animation";
import { useBoundingClientRect, useWaitToRender } from "./utils";

export const App: React.VFC = () => {
  const containerControls = useAnimation();
  const contentControls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const measureContainer = useBoundingClientRect(containerRef);
  const measureContent = useBoundingClientRect(contentRef);
  const waitToRender = useWaitToRender();
  const [tweet, setTweet] = useState(null as Tweet | null);

  useEffect(() => {
    const stream = openEndlessTweetStream();
    const reader = stream.getReader();

    containerControls.set({
      opacity: 0,
    });

    (async () => {
      for (;;) {
        const promise = reader.read();
        const isEmpty = null == await Promise.race([promise, null]);
        if (isEmpty) {
          await fadeOut(containerControls);
        }
        const readResult = await promise;
        if (isEmpty) {
          await fadeIn(containerControls);
        }
        if (readResult.done) {
          return;
        }
        setTweet(readResult.value);
        await waitToRender();
        await slideInAndFadeOut(contentControls, measureContainer().width, measureContent().width);
        setTweet(null);
      }
    })();

    return () => {
      stream.cancel();
    };
  }, [containerControls, contentControls, measureContainer, measureContent, waitToRender]);

  return (
    <motion.div animate={containerControls} ref={containerRef} className="container">
      <motion.span ref={contentRef} animate={contentControls} className="content">
        {tweet && (
          <>
            <span className="tweet-text">{tweet.data.text}</span>
            <span className="tweet-username">{tweet.includes.users[0].username}</span>
          </>
        )}
      </motion.span>
    </motion.div>
  );
};
