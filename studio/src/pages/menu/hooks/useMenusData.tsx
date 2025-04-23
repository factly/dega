import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Menu, MenuFilters, RootState } from "../types";
import deepEqual from "deep-equal";

export const useMenusData = (
  filters: MenuFilters,
  searchText: string,
  sortOrder: "asc" | "desc" = "asc"
) => {
  // Get data from Redux
  const { menus, total, loading } = useSelector((state: RootState) => {
    const node = state.menus.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node) {
      return {
        menus: node.data.map((element) => state.menus.details[element]),
        total: node.total,
        loading: state.menus.loading,
      };
    }

    return { menus: [], total: 0, loading: state.menus.loading };
  });

  // Filter and sort menus locally based on search text and sort order
  const filteredMenus = useMemo(() => {
    let filtered = menus as Menu[];

    // Apply search filter
    if (searchText.trim()) {
      filtered = menus.filter((menu) =>
        menu.name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name?.localeCompare(b.name || "") || 0;
      } else {
        return b.name?.localeCompare(a.name || "") || 0;
      }
    });
  }, [menus, searchText, sortOrder]);

  return {
    menus: filteredMenus,
    total,
    loading,
  };
};
