import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import PolicyList from "./components/PolicyList";
import getUserPermission from "../../utils/getUserPermission";
import { useSelector } from "react-redux";
import { getPolicies } from "../../actions/policies";
import deepEqual from "deep-equal";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";

interface Policy {
  id: string;
  [key: string]: any;
}

interface PolicyState {
  details: Record<string, Policy>;
  loading: boolean;
  req: Array<{
    query: {
      page: number;
      limit: number;
      [key: string]: any;
    };
    data: string[];
    total: number;
  }>;
}

interface RootState {
  policies: PolicyState;
  spaces: any;
}

interface Filters {
  page: number;
  limit: number;
  [key: string]: any;
}

function Policies(): React.ReactElement {
  const spaces = useSelector((state: RootState) => state.spaces);
  const actions = getUserPermission({
    resource: "policies",
    action: "get",
    spaces,
  });
  const dispatch = useAppDispatch();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 20,
  });

  query.set("page", filters.page.toString());
  window.history.replaceState(
    {},
    "",
    `${import.meta.env.PUBLIC_URL}${location.pathname}?${query}`
  );

  const { policies, total, loading } = useSelector((state: RootState) => {
    const node = state.policies.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        policies: node.data.map((element) => state.policies.details[element]),
        total: node.total,
        loading: state.policies.loading,
      };
    return { policies: [], total: 0, loading: state.policies.loading };
  });

  useEffect(() => {
    fetchPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPolicies = (): void => {
    dispatch(getPolicies(filters));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col space-y-4">
      <Helmet title={"Policies"} />
      <div className="flex justify-end">
        <Link to="/settings/members/policies/create">
          <Button
            disabled={
              !(actions.includes("admin") || actions.includes("create"))
            }
            variant="default"
          >
            <Plus className="mr-2 h-4 w-4" /> New Policy
          </Button>
        </Link>
      </div>
      <PolicyList
        actions={actions}
        data={{ policies, total, loading }}
        filters={filters}
        setFilters={setFilters}
        fetchPolicies={fetchPolicies}
      />
    </div>
  );
}

export default Policies;
