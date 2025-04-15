import { useMemo } from "react";
import { Space } from "../types";

export const useSpacesData = (
  spaces: Space[],
  searchText: string,
  sortOrder: "asc" | "desc" = "asc"
) => {
  // Filter and sort spaces locally based on search query and sort order
  const filteredAndSortedSpaces = useMemo(() => {
    // Check if spaces is an array before proceeding
    if (!Array.isArray(spaces)) {
      console.warn("Spaces is not an array", spaces);
      return [];
    }

    // First filter the spaces based on search query
    const filtered = spaces.filter(
      (space) =>
        space.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        space.id?.toLowerCase().includes(searchText.toLowerCase()) ||
        space.site_address?.toLowerCase().includes(searchText.toLowerCase()) ||
        space.site_title?.toLowerCase().includes(searchText.toLowerCase()) ||
        (space.created_at &&
          space.created_at.toLowerCase().includes(searchText.toLowerCase()))
    );

    // Then sort the filtered spaces by name
    return [...filtered].sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      const comparison = nameA.localeCompare(nameB);
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [spaces, searchText, sortOrder]);

  return filteredAndSortedSpaces;
};
