"use client";

import { useEffect, useState } from "react";

/** True when the viewport matches a phone-sized dashboard layout. */
export function usePrefersMobileLayout(query = "(max-width: 767px)") {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}
