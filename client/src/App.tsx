import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRunner } from "./runner";
import { Tweet, createTweetStream } from "./twitter";
import { useMarquee } from "./marquee";

export const App: React.VFC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [tweetQueue] = useState(createTweetStream);
  const { run, contentControls } = useMarquee(containerRef, contentRef);
  const { data: tweet, containerControls } = useRunner<Tweet>(tweetQueue, run);

  return (
    <div className="flex items-stretch h-16">
      <motion.div
        animate={containerControls}
        ref={containerRef}
        className="bg-sky-400 flex-1 flex items-center overflow-hidden whitespace-nowrap"
      >
        <motion.span
          ref={contentRef}
          animate={contentControls}
          className="text-4xl text-white px-3 inline-flex items-center"
        >
          {tweet && (
            <>
              {tweet.data.text} (@{tweet.includes.users[0].username})
            </>
          )}
        </motion.span>
      </motion.div>
    </div>
  );
};
