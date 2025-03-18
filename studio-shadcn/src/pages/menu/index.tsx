import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import MenuList from "./components/MenuList";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getMenus } from "../../actions/menu";
import deepEqual from "deep-equal";
import getUserPermission from "../../utils/getUserPermission";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Define types for our state and props
interface Menu {
  id: string;
  // Add other menu properties as needed
}

interface MenuState {
  details: Record<string, Menu>;
  loading: boolean;
  req: Array<{
    query: MenuFilters;
    data: string[];
    total: number;
  }>;
}

interface RootState {
  menus: MenuState;
  spaces: any; // Define a more specific type based on your spaces structure
}

interface MenuFilters {
  page: number;
  limit: number;
  [key: string]: any; // For any additional filters
}

const Menu: React.FC = () => {
  const spaces = useSelector((state: RootState) => state.spaces);
  const actions = getUserPermission({
    resource: "menus",
    action: "get",
    spaces,
  });
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState<MenuFilters>({
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "20", 10),
  });

  // Update URL when filters change, but don't manipulate history directly
  useEffect(() => {
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      newParams.set(key, value.toString());
    });
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

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

  // Fetch menus when filters change
  useEffect(() => {
    dispatch(getMenus(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, dispatch]);

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
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Menu
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
};

export default Menu;
