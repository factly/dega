
import { useMemo } from "react";
import { useSelector } from "react-redux";
import deepEqual from "deep-equal";
import { MediaFilters, MediaListData } from "../types";

export const useMediaData = (filters: MediaFilters): MediaListData => {
  const { media, total, loading } = useSelector((state: any) => {
    const node = state.media.req.find((item: any) => {
      return deepEqual(item.query, filters);
    });

    if (node) {
      return {
        media: node.data
          .map((id: string) => state.media.details[id])
          .filter(Boolean),
        total: node.total,
        loading: state.media.loading,
      };
    }
    return { media: [], total: 0, loading: state.media.loading };
  });

  return {
    media,
    total,
    loading,
  };
};
