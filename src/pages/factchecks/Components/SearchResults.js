import React from 'react';
import { List, Row } from 'antd';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import deepEqual from 'deep-equal';

function SearchResults({ getNextPage }) {
  const [page, setPage] = React.useState(1);

  const { factchecks, total, loading } = useSelector(({ factchecks }) => {
    let query = {
      page,
    };

    const node = factchecks.req.find((item) => {
      return deepEqual(item.query, query);
    });

    if (node)
      return {
        factchecks: node.data.map((element) => factchecks.details[element]),
        total: node.total,
        loading: factchecks.loading,
      };
    return { factchecks: [], total: 0, loading: factchecks.loading };
  });

  React.useEffect(() => {
    getNextPage(page);
  }, [page]);

  return (
    <List
      bordered
      className="google-factcheck-search-list"
      loading={loading}
      itemLayout="vertical"
      dataSource={factchecks}
      pagination={{
        total: total,
        current: page,
        pageSize: 5,
        onChange: (pageNumber, pageSize) => setPage(pageNumber),
      }}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta title={`Claim by ${item.title}:`} description={item.text} />
          <Row>
            <Col>
              <Row>
                <div>Claim by {item.title}:</div>
                <div>{item.text}</div>
              </Row>
              <Row>
                <div>
                  <b>{item.claimReview.publisher.name}</b> rating :{' '}
                  <b>{item.claimReview.textualRating}</b>
                </div>
                <div>
                  <Link to={item.claimReview.url}>{item.claimReview.title}</Link>
                </div>
              </Row>
            </Col>
          </Row>
        </List.Item>
      )}
    />
  );
}

export default SearchResults;

// {
//   "text": "Video shows Russian doctors celebrating the new COVID-19 vaccine.",
//   "claimant": "Facebook posts",
//   "claimDate": "2020-09-08T02:48:10Z",
//   "claimReview": [
//     {
//       "publisher": {
//         "name": "BOOM",
//         "site": "boomlive.in"
//       },
//       "url": "https://www.boomlive.in/world/video-from-saudi-arabia-shared-as-russian-doctors-celebrating-covid-19-vaccine-9654",
//       "title": "Video From Saudi Arabia Shared As Russian Doctors Celebrating COVID-19 Vaccine",
//       "reviewDate": "2020-09-08T02:48:10Z",
//       "textualRating": "False",
//       "languageCode": "en"
//     }
//   ]
// },
