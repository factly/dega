import { useEffect, useState, useRef } from "react";
import FormatList from "./components/FormatList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getFormats } from "../../actions/formats";
import deepEqual from "deep-equal";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Define types for the component props and state
interface Format {
  id: string;
  name: string;
  description: string;
  // Add other format properties as needed
}

interface FiltersState {
  page: number;
  limit: number;
}

interface FormatState {
  formats: {
    req: {
      query: FiltersState;
      data: string[];
      total: number;
    }[];
    details: Record<string, Format>;
    loading: boolean;
  };
}

function Formats() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRenderDone = useRef(false);

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<FiltersState>({
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "20", 10),
  });

  const { formats, total, loading } = useSelector((state: FormatState) => {
    const node = state.formats.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        formats: node.data.map((element) => state.formats.details[element]),
        total: node.total,
        loading: state.formats.loading,
      };
    return { formats: [], total: 0, loading: state.formats.loading };
  });

  // Update URL when filters change, but don't cause a re-render
  useEffect(() => {
    if (initialRenderDone.current) {
      const newSearchParams = new URLSearchParams();
      newSearchParams.set("page", filters.page.toString());
      newSearchParams.set("limit", filters.limit.toString());
      setSearchParams(newSearchParams, { replace: true });
    } else {
      initialRenderDone.current = true;
    }
  }, [filters, setSearchParams]);

  // Fetch formats when filters change
  useEffect(() => {
    fetchFormats();
  }, [filters]);

  const fetchFormats = () => {
    dispatch(getFormats(filters));
  };

  // Function to handle partial updates to the filters
  const handleSetFilters = (newFilters: Partial<FiltersState>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  };

  if (loading && formats.length === 0) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col space-y-4">
      <Helmet title={"Formats"} />
      <div className="flex justify-end">
        <Link to="/settings/advanced/formats/create">
          <Button variant="default">
            <Plus className="mr-2 h-4 w-4" /> New Format
          </Button>
        </Link>
      </div>

      <FormatList
        data={{ formats, total, loading }}
        filters={filters}
        setFilters={handleSetFilters}
        fetchFormats={fetchFormats}
      />
    </div>
  );
}

export default Formats;
