// hooks/useFactCheckFilters.ts
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Filters from "../../../utils/filters";
import { FilterValues, Formats } from "../types";

export const useFactCheckFilters = (query: URLSearchParams, formats: Formats) => {
  const [searchText, setSearchText] = useState(query.get("q") || "");
  const [status, setStatus] = useState(query.get("status") || "all");
  const [filters, setFilters] = useState<FilterValues>({
    page: parseInt(query.get("page") || "1", 10),
    limit: parseInt(query.get("limit") || "10", 10),
    status: query.get("status") || "all",
    q: query.get("q") || "",
    sort: query.get("sort") || "",
    format:
      formats && !formats.loading && formats.factcheck
        ? [formats.factcheck.id]
        : [],
  });

  // Initialize form
  const form = useForm({
    defaultValues: {
      format: filters.format || [],
      tag: [],
      category: [],
      author: [],
    },
  });

  // Update form when URL params change
  useEffect(() => {
    const keys = [
      "format",
      "page",
      "limit",
      "q",
      "sort",
      "tag",
      "category",
      "author",
      "status",
    ];

    const params: any = {};

    keys.forEach(key => {
      if (key === 'tag' || key === 'category' || key === 'author' || key === 'format') {
        params[key] = query.getAll(key).map(val => parseInt(val, 10));
      } else if (key === 'page' || key === 'limit') {
        params[key] = parseInt(query.get(key) || (key === 'page' ? '1' : '10'), 10);
      } else {
        params[key] = query.get(key) || '';
      }
    });

    if (formats && !formats.loading && formats.factcheck) {
      params.format = [formats.factcheck.id];
    }

    form.reset(new Filters(params));
  }, [query.toString(), formats.loading, form]);

  return {
    searchText,
    setSearchText,
    status,
    setStatus,
    filters,
    setFilters,
    form,
  };
};
