// hooks/usePageFilters.ts
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Filters from "../../../utils/filters";
import { FilterParams } from "../types";

export const usePageFilters = (query: URLSearchParams) => {
  const [searchText, setSearchText] = useState<string>(query.get("q") || "");
  const [status, setStatus] = useState<string>(query.get("status") || "all");
  const [filters, setFilters] = useState<FilterParams>({
    page: Number(query.get("page")) || 1,
    limit: Number(query.get("limit")) || 10,
    q: query.get("q") || "",
    status: query.get("status") || "all",
    tag: query.getAll("tag") || [],
    category: query.getAll("category") || [],
    author: query.getAll("author") || [],
    format: query.get("format") || "",
    sortBy: query.get("sortBy") || "date",
  });

  // Create form
  const form = useForm({
    defaultValues: {
      q: filters.q || "",
      tag: filters.tag || [],
      category: filters.category || [],
      author: filters.author || [],
    },
  });

  // Reset form when URL search params change
  useEffect(() => {
    if (form) {
      form.reset(new Filters(filters));
    }
  }, [query.toString()]);

  return {
    filters,
    setFilters,
    searchText,
    setSearchText,
    status,
    setStatus,
    form,
  };
};
