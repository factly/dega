import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { addDefaultFormats, getFormats } from "../../../actions/formats";
import { addDefaultPolicies, getPolicies } from "../../../actions/policies";
import { addDefaultRatings, getRatings } from "../../../actions/ratings";
import useNavigation from "../../../utils/useNavigation";

// Define TypeScript interfaces for Redux state
interface RootState {
  ratings: {
    details: Record<string, any>;
    loading: boolean;
  };
  formats: {
    details: Record<string, any>;
    loading: boolean;
  };
  policies: {
    details: Record<string, any>;
    loading: boolean;
  };
  events: {
    details: Record<string, any>;
    loading: boolean;
  };
  spaces: {
    selected: string;
    loading: boolean;
  };
}

interface SelectedSpace {
  space_id: string;
}

const Features: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigation();

  const selectedSpace = useSelector<RootState, SelectedSpace>((state) => ({
    space_id: state.spaces.selected,
  }));

  const {
    ratings,
    ratingsLoading,
    formats,
    formatsLoading,
    policies,
    policiesLoading,
    loadingServices,
  } = useSelector((state: RootState) => {
    return {
      ratings: Object.keys(state.ratings.details).length,
      ratingsLoading: state.ratings.loading,
      formats: Object.keys(state.formats.details).length,
      formatsLoading: state.formats.loading,
      policies: Object.keys(state.policies.details).length,
      policiesLoading: state.policies.loading,
      loadingServices: state.spaces.loading,
    };
  });

  const fetchEntities = () => {
    if (!loadingServices) {
      dispatch(getRatings());
      dispatch(getFormats());
      dispatch(getPolicies());
    }
  };

  useEffect(() => {
    fetchEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {!ratingsLoading &&
      !policiesLoading &&
      !formatsLoading &&
      (ratings < 1 || formats < 1 || policies < 1) ? (
        <h3>Add default features</h3>
      ) : null}

      <div className="flex flex-wrap gap-4">
        {ratingsLoading && loadingServices ? null : ratings > 0 ? null : (
          <Card className="w-72">
            <CardTitle className="p-4">Ratings</CardTitle>
            <CardContent>
              <p>
                Five ratings will be created True, Partly True, Misleading,
                Partly False and False. Click below Button to create
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  dispatch(addDefaultRatings()).then(() =>
                    navigate("/ratings")
                  );
                }}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" /> CREATE RATINGS
              </Button>
            </CardFooter>
          </Card>
        )}

        {formatsLoading ? null : formats > 0 ? null : (
          <Card className="w-72">
            <CardTitle className="p-4">Formats</CardTitle>
            <CardContent>
              <p>
                Two formats will be created Fact Check and Article. Click below
                Button to create
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  dispatch(addDefaultFormats(selectedSpace));
                }}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" /> CREATE FORMATS
              </Button>
            </CardFooter>
          </Card>
        )}

        {policiesLoading ? null : policies > 0 ? null : (
          <Card className="w-72">
            <CardTitle className="p-4">Policies</CardTitle>
            <CardContent>
              <p>
                Three policies will be created Editor, Author and Contributor.
                Click below Button to create
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  dispatch(addDefaultPolicies()).then(() =>
                    navigate("settings/members/policies")
                  );
                }}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" /> CREATE POLICIES
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
};

export default Features;
