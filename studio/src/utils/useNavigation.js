import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Custom hook to navigate to a specified path
export default function useNavigation() {
  const navigate = useNavigate();
  const pathRef = useRef(null);

  useEffect(() => {
    if (pathRef.current) {
      navigate(pathRef.current);
      pathRef.current = null; // Reset the path after navigation
    }
  }, [pathRef, navigate]);

  const triggerNavigation = (newPath) => {
    pathRef.current = newPath;
  };

  return triggerNavigation;
}
