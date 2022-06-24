import React from 'react';
import { getDatefromString } from '../../../../utils/date';
import { getTrimmedURL } from '../../../../utils/url';
import './factcheck.css';
const FactCheck = ({ factCheck, setActiveFactCheck }) => {
  return (
    // <div className={styles.FactCheckContainer} onMouseOver={() => setActiveFactCheck(factCheck)}>
    <div className={'FactCheckContainer'}>
      <h2 className={'FactCheckTitle'}>{factCheck?.title}</h2>
      <a href={factCheck?.pageurl} style={{ display: 'block', marginBottom: '16px' }}>
        {getTrimmedURL(factCheck.pageurl)}
      </a>
      <div className={'ClaimContainer'}>
        <div className={'ClaimTextContainer'}>
          <h3
            className={'ClaimTextStyle'}
          >
            Claim :
          </h3>
          <p className={'ClaimText'}>{factCheck?.claims?.[0].text}</p>
        </div>
        <div className={'ClaimDetailsContainer'}>
          {factCheck?.claims?.[0]?.claimant ? (
            <p>
              <strong>Claim by : </strong>
              <span className={'ClaimDetailsText'}>{factCheck?.claims?.[0].claimant}</span>
            </p>
          ) : null}
          <p>
            <strong>Fact Check by : </strong>
            <span className={'ClaimDetailsText'}>{factCheck?.publisher.name}</span>
          </p>
          <p>
            <strong>Rating :</strong>
            <span className={'ClaimDetailsText'}>
              {factCheck?.claims?.[0].claimreview[0].textualrating}
            </span>
          </p>
        </div>
      </div>
      <p className={'Date'}>{getDatefromString(factCheck?.date)}</p>
    </div>
  );
};

export default FactCheck;
