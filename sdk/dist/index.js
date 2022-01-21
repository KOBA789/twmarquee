var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Tweet: () => Tweet,
  openEndlessTweetStream: () => openEndlessTweetStream,
  openTweetStream: () => openTweetStream
});
var import_zod = require("zod");
var Tweet = import_zod.z.object({
  data: import_zod.z.object({
    author_id: import_zod.z.string(),
    id: import_zod.z.string(),
    text: import_zod.z.string()
  }),
  includes: import_zod.z.object({
    users: import_zod.z.array(import_zod.z.object({
      id: import_zod.z.string(),
      name: import_zod.z.string(),
      username: import_zod.z.string()
    }))
  })
});
var openTweetStream = (endpoint = "/api/stream") => {
  const events = new EventSource(endpoint);
  const abortController = new AbortController();
  const { signal } = abortController;
  return new ReadableStream({
    start(controller) {
      function handleMessage(ev) {
        try {
          const obj = JSON.parse(ev.data);
          const tweet = Tweet.parse(obj);
          controller.enqueue(tweet);
        } catch {
        }
      }
      function handleError(ev) {
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
    }
  });
};
function sleep(duration, signal) {
  return new Promise((resolve, reject) => {
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
var openEndlessTweetStream = (endpoint = "/api/stream") => {
  let underlying = openTweetStream(endpoint).getReader();
  const abortController = new AbortController();
  const { signal } = abortController;
  return new ReadableStream({
    async start(controller) {
      for (; ; ) {
        let ret;
        try {
          ret = await underlying.read();
        } catch (e) {
          console.error(e);
          try {
            await sleep(3e3, signal);
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
    }
  });
};
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Tweet,
  openEndlessTweetStream,
  openTweetStream
});
