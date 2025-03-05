import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import MenuList from "./components/MenuList";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMenus } from "../../actions/menu";
import deepEqual from "deep-equal";
import getUserPermission from "../../utils/getUserPermission";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { AppDispatch } from "../../store";

// Define types for our state and props
interface MenuState {
  details: Record<string, MenuData>;
  loading: boolean;
  req: Array<{
    query: FilterParams;
    data: string[];
    total: number;
  }>;
}

interface MenuData {
  id: string;
  // Add other menu properties here
}

interface FilterParams {
  page: number;
  limit: number;
  [key: string]: any;
}

interface RootState {
  spaces: any;
  menus: MenuState;
}

function Menu() {
  const spaces = useSelector((state: RootState) => state.spaces);
  const actions = getUserPermission({
    resource: "menus",
    action: "get",
    spaces,
  });
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 20,
  });

  query.set("page", filters.page.toString());
  window.history.replaceState(
    {},
    "",
    `${(window as any).PUBLIC_URL}${location.pathname}?${query}`
  );

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

  useEffect(() => {
    fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchMenus = () => {
    dispatch(getMenus(filters));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col space-y-4">
      <Helmet title={"Menu"} />

      <div className="flex justify-end">
        <Link to="/settings/website/menus/create">
          <Button
            disabled={
              !(actions.includes("admin") || actions.includes("create"))
            }
            variant="default"
            className="flex items-center gap-2"
          >
            <Plus size={16} /> New Menu
          </Button>
        </Link>
      </div>

      <MenuList
        actions={actions}
        data={{ menus, total, loading }}
        filters={filters}
        setFilters={setFilters}
        fetchMenus={fetchMenus}
      />
    </div>
  );
}

export default Menu;
