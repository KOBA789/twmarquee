import { z } from "zod";

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

export const openTweetStream = (endpoint = "/api/stream") => {
  const events = new EventSource(endpoint);
  const abortController = new AbortController();
  const { signal } = abortController;
  return new ReadableStream<Tweet>({
    start(controller) {
      function handleMessage(ev: MessageEvent<string>) {
        try {
          const obj = JSON.parse(ev.data);
          const tweet = Tweet.parse(obj);
          controller.enqueue(tweet);
        } catch {
          /* do nothing */
        }
      }
      function handleError(ev: Event) {
        abortController.abort();
        events.close();
        controller.error(ev);
      }
      events.addEventListener("message", handleMessage, { signal });
      events.addEventListener("error", handleError, { signal });
    },
    cancel() {
      abortController.abort();
      events.close();
    },
  });
};

function sleep(duration: number, signal: AbortSignal) {
  return new Promise<null>((resolve, reject) => {
    const timer = setTimeout(handleTimeout, duration);
    signal.addEventListener("abort", handleAbort);
    function handleTimeout() {
      signal.removeEventListener("abort", handleAbort);
      resolve(null);
    }
    function handleAbort() {
      signal.removeEventListener("abort", handleAbort);
      clearTimeout(timer);
      reject();
    }
  });
}

export const openEndlessTweetStream = (endpoint = "/api/stream") => {
  let underlying = openTweetStream(endpoint).getReader();
  const abortController = new AbortController();
  const { signal } = abortController;
  return new ReadableStream<Tweet>({
    async start(controller) {
      for (;;) {
        let ret: ReadableStreamDefaultReadResult<Tweet>;
        try {
          ret = await underlying.read();
        } catch (e) {
          console.error(e);
          try {
            await sleep(3000, signal);
          } catch {
            return;
          }
          underlying = openTweetStream(endpoint).getReader();
          continue;
        }
        if (ret.done) {
          controller.error("BUG: tweet stream will never be closed without errors");
          return;
        }
        controller.enqueue(ret.value);
      }
    },
    cancel() {
      abortController.abort();
      underlying.cancel();
    },
  });
};
