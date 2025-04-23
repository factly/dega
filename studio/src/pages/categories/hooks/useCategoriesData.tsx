// hooks/useCategoriesData.tsx
import { useMemo } from "react";
import { useSelector } from "react-redux";
import deepEqual from "deep-equal";
import { CategoryFilters, CategoryListData, Category } from "../types";

export const useCategoriesData = (
  filters: CategoryFilters,
  searchText: string
): CategoryListData => {
  const { categories, total, loading } = useSelector((state: any) => {
    const adjustedQuery = { ...filters };

    const node = state.categories.req.find((item: any) => {
      return deepEqual(item.query, adjustedQuery);
    });

    if (node) {
      return {
        categories: node.data.map(
          (element: string) => state.categories.details[element]
        ),
        total: node.total,
        loading: state.categories.loading,
      };
    }
    return { categories: [], total: 0, loading: state.categories.loading };
  });

  // Filter categories locally based on search text
  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) {
      return categories;
    }

    return categories.filter(
      (category: Category) =>
        category.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        category.slug?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [categories, searchText]);

  // Sort categories based on sort order
  const sortedCategories = useMemo(() => {
    if (!filteredCategories) return [];

    return [...filteredCategories].sort((a: Category, b: Category) => {
      if (filters.sort === "asc") {
        return a.name?.localeCompare(b.name || "") || 0;
      } else {
        return b.name?.localeCompare(a.name || "") || 0;
      }
    });
  }, [filteredCategories, filters.sort]);

  return {
    categories: sortedCategories,
    total: total,
    loading: loading,
  };
};
