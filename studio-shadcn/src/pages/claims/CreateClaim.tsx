import { FC, useEffect, useState } from "react";
import ClaimCreateForm from "./components/ClaimForm";
import { useSelector } from "react-redux";
import { createClaim } from "../../actions/claims";
import { getClaimants } from "../../actions/claimants";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { RootState } from "../../store/index";
import { useAppDispatch } from "@/hooks/reduxHooks";

const CreateClaim: FC = () => {
  const history = useNavigation();
  const dispatch = useAppDispatch();
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(getClaimants({ limit: 5 }));
      } finally {
        setInitialLoadDone(true);
      }
    };

    loadData();
  }, [dispatch]);

  const { claimantsCount, loading } = useSelector((state: RootState) => {
    const req = state.claimants?.req || [];
    const detailsLength = Object.keys(state.claimants?.details || {}).length;

    return {
      claimantsCount:
        req.length > 0 && req[0]?.total ? req[0].total : detailsLength,
      loading: state.claimants?.loading,
    };
  });

  const onCreate = (values: any) => {
    Promise.resolve(dispatch(createClaim(values))).then(() => {
      history("/claims");
    });
  };

  return (
    <>
      <Helmet title={"Create Claim"} />
      <ClaimCreateForm onCreate={onCreate} />
    </>
  );
};

export default CreateClaim;
