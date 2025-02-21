import { useEffect, useRef } from "react";
import { useNavigate, NavigateFunction } from "react-router-dom";

// Custom hook to navigate to a specified path
export default function useNavigation(): (path: string) => void {
  const navigate: NavigateFunction = useNavigate();
  const pathRef = useRef<string | null>(null);

  useEffect(() => {
    if (pathRef.current) {
      navigate(pathRef.current);
      pathRef.current = null; // Reset the path after navigation
    }
  }, [pathRef, navigate]);

  const triggerNavigation = (newPath: string): void => {
    pathRef.current = newPath;
  };

  return triggerNavigation;
}
