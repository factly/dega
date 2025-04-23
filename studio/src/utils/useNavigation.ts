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
    // Use the built-in react-router navigate function
    // This correctly handles both absolute and relative paths
    navigate(newPath, { replace: false });
  };

  return navigateTo;
}
