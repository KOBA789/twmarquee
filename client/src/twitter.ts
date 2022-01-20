import { useCallback } from "react";
import { z } from "zod";
import { Queue } from "./queue";

function filterTweet(tweet: Tweet): boolean {
  if (tweet.includes.users.length !== 1) {
    // the tweet is a RT or it contains mentions
    return false;
  }
  if (tweet.data.text.startsWith("RT ")) {
    // the tweet is a RT
    return false;
  }
  return true;
}

export const Tweet = z.object({
  data: z.object({
    author_id: z.string(),
    id: z.string(),
    text: z.string(),
  }),
  includes: z.object({
    users: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        username: z.string(),
      })
    ),
  }),
});

export type Tweet = z.infer<typeof Tweet>;

export const createTweetStream = () => {
  const queue = new Queue<Tweet>();
  const runStream = () => {
    const events = new EventSource("/api/stream");
    events.onmessage = (e: MessageEvent<string>) => {
      if (e.data.trim().length === 0) {
        return;
      }
      try {
        const obj = JSON.parse(e.data);
        const result = Tweet.safeParse(obj);
        if (result.success && filterTweet(result.data)) {
          queue.enqueue(result.data);
        }
      } catch {
        /* do nothing */
      }
    };
    events.onerror = (e) => {
      console.error(e);
      events.close();
      runStream();
    };
  };
  runStream();
  return queue;
};
