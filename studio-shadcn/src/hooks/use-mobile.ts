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


const MOBILE_BREAKPOINT = 768

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
// Export both versions
export { useWindowSizeWithQuery, useIsMobile };
export default useWindowSize;
