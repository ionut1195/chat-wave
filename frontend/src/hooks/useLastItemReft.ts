import { useCallback, useRef } from "react";

export const useLastItemRef = (setVisibility: (visible: boolean) => void) => {
  const ref = useRef<IntersectionObserver>();

  const lastItemRef = useCallback(
    // node = dom element
    (node: any) => {
      // if there was a previous ref - it will be disconnected
      if (ref.current) ref.current.disconnect();
      // create new intersection observer on ref
      ref.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          // it won't work if there's no next page
          setVisibility(false);
        } else {
          setVisibility(true);
        }
      });
      // if there is an element, set it to be tracked by the intersection observer
      if (node) ref.current.observe(node);
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return { lastItemRef };
};
