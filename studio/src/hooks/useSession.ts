import { useSelector } from "react-redux";
import { RootState } from "@/types";

/**
 * Hook to access session information and check user permissions
 */
export const useSession = () => {
  const session = useSelector((state: RootState) => state.session.details);
  const spaceId = useSelector((state: RootState) => state.spaces.selected);
  const userInfoRoleKey = "urn:zitadel:iam:org:project:roles";

  /**
   * Check if the current user has admin role
   * - Either for the current space
   * - Or as a fallback, has any admin role at all
   */
  const checkIsAdmin = (): boolean => {
    // Return false if no session data exists
    if (!session) return false;

    // First check: look for admin role in the specific format
    if (session[userInfoRoleKey]?.admin) {
      // If spaceId is available, check for that specific space
      if (spaceId && session[userInfoRoleKey].admin[spaceId]) {
        return true;
      }

      // Fallback: Check if user has any admin role at all
      return Object.keys(session[userInfoRoleKey].admin).length > 0;
    }

    return false;
  };

  return {
    session,
    isAdmin: checkIsAdmin(),
    // Return the function as well in case it needs to be called with different parameters
    checkIsAdmin,
  };
};
