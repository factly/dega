import { useEffect, useState } from "react";
import FormatList from "./components/FormatList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFormats } from "../../actions/formats";
import deepEqual from "deep-equal";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";

interface Format {
  id: string;
  [key: string]: any;
}

interface FormatsState {
  details: Record<string, Format>;
  loading: boolean;
  req: Array<{
    query: FiltersType;
    data: string[];
    total: number;
  }>;
}

interface RootState {
  formats: FormatsState;
}

interface FiltersType {
  page: number;
  limit: number;
}

interface PermissionProps {
  actions: string[];
}

interface FormatsProps {
  permission: PermissionProps;
}

function Formats({ permission }: FormatsProps) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const [filters, setFilters] = useState<FiltersType>({
    page: 1,
    limit: 20,
  });

  query.set("page", filters.page.toString());
  window.history.replaceState(
    {},
    "",
    `${(window as any).PUBLIC_URL}${location.pathname}?${query}`
  );

  const { formats, total, loading } = useSelector((state: RootState) => {
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

  useEffect(() => {
    fetchFormats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchFormats = () => {
    dispatch(getFormats(filters) as any);
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col space-y-4">
      <Helmet title={"Formats"} />
      <div className="flex justify-end">
        <Link to="/settings/advanced/formats/create">
          <Button
            disabled={
              !(actions.includes("admin") || actions.includes("create"))
            }
            className="flex items-center gap-2"
          >
            <Plus size={16} /> New Format
          </Button>
        </Link>
      </div>

      <FormatList
        actions={actions}
        data={{ formats, total, loading }}
        filters={filters}
        setFilters={setFilters}
        fetchFormats={fetchFormats}
      />
    </div>
  );
}

export default Formats;
