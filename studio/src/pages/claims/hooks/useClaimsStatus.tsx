
import { useSelector } from "react-redux";

export const useClaimsStatus = () => {
  return useSelector(({ claimants, ratings }: any) => {
    return {
      claimantsCount: claimants?.req?.[0]?.data
        ? claimants?.req?.[0]?.data.length
        : 0,
      ratingsCount: Object.keys(ratings.details).length,
      claimantsLoading: claimants.loading,
      ratingsLoading: ratings.loading,
    };
  });
};
