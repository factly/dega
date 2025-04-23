// hooks/useTagsData.tsx
import { useMemo } from "react";
import { useSelector } from "react-redux";
import deepEqual from "deep-equal";
import { TagFilters, TagListData, Tag } from "../types";

export const useTagsData = (
  filters: TagFilters,
  searchText: string
): TagListData => {
  const { tags, total, loading } = useSelector((state: any) => {
    const adjustedQuery = { ...filters };

    const node = state.tags.req.find((item: any) => {
      return deepEqual(item.query, adjustedQuery);
    });

    if (node) {
      return {
        tags: node.data.map(
          (element: string) => state.tags.details[element]
        ),
        total: node.total,
        loading: state.tags.loading,
      };
    }
    return { tags: [], total: 0, loading: state.tags.loading };
  });

  // Filter tags locally based on search text
  const filteredTags = useMemo(() => {
    if (!searchText.trim()) {
      return tags;
    }

    return tags.filter(
      (tag: Tag) => {
        const searchLower = searchText.toLowerCase();
        const nameMatch = tag.name?.toLowerCase().includes(searchLower) || false;
        const descriptionMatch = typeof tag.description === "string"
?				tag.description?.toLowerCase().includes(searchLower) : false;
        const slugMatch = tag.slug?.toLowerCase().includes(searchLower) || false;

        return nameMatch || descriptionMatch || slugMatch;
      }
    );
  }, [tags, searchText]);

  // Sort tags based on sort order
  const sortedTags = useMemo(() => {
    if (!filteredTags) return [];

    return [...filteredTags].sort((a: Tag, b: Tag) => {
      if (filters.sort === "asc") {
        return a.name?.localeCompare(b.name || "") || 0;
      } else {
        return b.name?.localeCompare(a.name || "") || 0;
      }
    });
  }, [filteredTags, filters.sort]);

  return {
    tags: sortedTags,
    total: total,
    loading: loading,
  };
};
