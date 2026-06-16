"use client";

import { useEffect } from "react";

const AWAY_TITLE = "Hey! Come back...";
const EYES_FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="88">👀</text></svg>'
  );

// Swaps the tab title + favicon to a "come back" teaser while the tab is
// hidden, restores the originals when the user returns.
export default function TabTeaser() {
  useEffect(() => {
    const icons = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]')
    );
    const originalTitle = document.title;
    const originalHrefs = icons.map((l) => l.href);

    let timer: ReturnType<typeof setTimeout> | undefined;

    const restore = () => {
      document.title = originalTitle;
      icons.forEach((l, i) => (l.href = originalHrefs[i]));
    };

    const onVisibility = () => {
      if (document.hidden) {
        // Only tease once they've been away 5s.
        timer = setTimeout(() => {
          document.title = AWAY_TITLE;
          icons.forEach((l) => (l.href = EYES_FAVICON));
        }, 5000);
      } else {
        clearTimeout(timer);
        restore();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(timer);
      restore();
    };
  }, []);

  return null;
}
