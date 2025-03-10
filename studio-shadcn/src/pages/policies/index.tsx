import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import PolicyList from "./components/PolicyList";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPolicies } from "../../actions/policies";
import deepEqual from "deep-equal";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Define types for our state and props
interface Policy {
  id: string;
  // Add other policy properties as needed
}

interface PolicyState {
  details: Record<string, Policy>;
  loading: boolean;
  req: Array<{
    query: PolicyFilters;
    data: string[];
    total: number;
  }>;
}

interface RootState {
  policies: PolicyState;
  spaces: any; // Define a more specific type based on your spaces structure
}

interface PolicyFilters {
  page: number;
  limit: number;
  [key: string]: any; // For any additional filters
}

const Policies: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState<PolicyFilters>({
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "20", 10),
  });

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      newParams.set(key, value.toString());
    });
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  const { policies, total, loading } = useSelector((state: RootState) => {
    const node = state.policies.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node) {
      return {
        policies: node.data.map((element) => state.policies.details[element]),
        total: node.total,
        loading: state.policies.loading,
      };
    }

    return { policies: [], total: 0, loading: state.policies.loading };
  });

  // Fetch policies when filters change
  useEffect(() => {
    fetchPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPolicies = () => {
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
          <Button variant="default">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Policy
          </Button>
        </Link>
      </div>

      <PolicyList
        data={{ policies, total, loading }}
        filters={filters}
        setFilters={setFilters}
        fetchPolicies={fetchPolicies}
      />
    </div>
  );
};

export default Policies;
