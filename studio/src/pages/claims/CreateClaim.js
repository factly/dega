import ClaimCreateForm from './components/ClaimForm';
import { useDispatch, useSelector } from 'react-redux';
import { createClaim } from '../../actions/claims';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button, Result } from 'antd';
import useNavigation from '../../utils/useNavigation';

function CreateClaim() {
  const history = useNavigation();
 
  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createClaim(values)).then(() => {history("/claims")});
  };

  const { claimantsCount } = useSelector(({ claimants }) => {
    return {
      claimantsCount: claimants?.req?.[0]?.data ? claimants?.req?.[0]?.data : 0,
    };
  });

  return (
    <>
      <Helmet title={'Create Claim'} />
      {claimantsCount ? (
        <ClaimCreateForm onCreate={onCreate} />
      ) : (
        <Result
          status={'403'}
          title={'Please create a claimant.'}
          subTitle="You cannot create a claim without a claimant."
          extra={
            <Link to="/claimants/create">
              <Button type="primary">Create claimant</Button>
            </Link>
          }
        />
      )}
    </>
  );
}

export default CreateClaim;
