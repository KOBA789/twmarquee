import React, { useCallback, useLayoutEffect, useState } from "react";

export const useBoundingClientRect = <E extends HTMLElement>(
  ref: React.RefObject<E>
) => {
  return useCallback(() => {
    if (ref.current === null) {
      return new DOMRect();
    }
    return ref.current.getBoundingClientRect();
  }, [ref]);
};

export const useWaitToRender = () => {
  const [isSteady, setIsSteady] = useState(false);
  const [onRender, setOnRender] = useState(() => (_: void) => {});
  useLayoutEffect(() => {
    if (isSteady) {
      onRender();
    } else {
      setIsSteady(true);
    }
  }, [isSteady, onRender]);
  return useCallback(() => {
    setIsSteady(false);
    return new Promise<void>((resolve) => {
      setOnRender(() => resolve);
    });
  }, []);
};
