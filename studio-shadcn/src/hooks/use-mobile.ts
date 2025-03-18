import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
  isMobileScreen: boolean;
}

// Original hook that returns window dimensions and mobile status
const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
    isMobileScreen:
      typeof window !== "undefined" ? window.innerWidth < 768 : false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobileScreen: window.innerWidth < 768,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

// Overloaded function that accepts a media query string and returns boolean
function useWindowSizeWithQuery(mediaQuery: string): boolean {
  const [matches, setMatches] = useState<boolean>(
    typeof window !== "undefined"
      ? window.matchMedia(mediaQuery).matches
      : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(mediaQuery);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    mediaQueryList.addEventListener("change", handleChange);

    // Initial check
    setMatches(mediaQueryList.matches);

    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [mediaQuery]);

  return matches;
}

// Export both versions
export { useWindowSizeWithQuery };
export default useWindowSize;
