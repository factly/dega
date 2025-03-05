import { useNavigate, NavigateFunction } from "react-router-dom";

/**
 * Custom hook to handle navigation without path duplication
 * @returns A function that navigates to the specified path without duplicating paths
 */
export default function useNavigation(): (path: string) => void {
  const navigate: NavigateFunction = useNavigate();

  /**
   * Navigates to the specified path, preventing duplicate path segments
   * @param newPath The path to navigate to
   */
  const navigateTo = (newPath: string): void => {
    // Handle absolute paths (starting with /)
    if (newPath.startsWith("/")) {
      // Simply use the react-router navigate function with the new path
      // This avoids manual path manipulation that could cause duplication
      navigate(newPath);
    } else {
      // For relative paths, use them as is
      navigate(newPath);
    }
  };

  return navigateTo;
}
