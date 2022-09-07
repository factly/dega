import React from 'react';
import { Typography, Space, Input, Form, Select, Button, Skeleton, Row } from 'antd';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSachFactChecks, getSachFilters } from '../../actions/sachFactChecks';
import FactCheck from './components/sach-fact-check';
import { getResultStringFromStats } from '../../utils/getStats';

function Factly() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [language, setLanguage] = useState([]);
  const [publisher, setPublisher] = useState([]);
  const [country, setCountry] = useState([]);
  const [dateOrder, setDateOrder] = useState('');
  const [publisherList, setPublishersList] = useState([]);
  const [publisherCountries, setPublisherCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [query, setQuery] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);
  const [resultStats, setResultStats] = useState({});
  const [isResultTextVisible, setIsResultTextVisible] = useState(false);
  let languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

  const pageLimit = 20;
  const fetchFilters = () => {
    dispatch(getSachFilters(setLanguages, setPublishersList, setPublisherCountries));
  };

  const fetchFactChecks = () => {
    dispatch(
      getSachFactChecks(
        {
          q: query,
          selectedLanguage: language,
          selectedPublisher: publisher,
          selectedCountry: country,
          limit: pageLimit,
          sortByDate: dateOrder,
          offset: (pageNum - 1) * pageLimit,
        },
        setTotalMatches,
        setResultStats,
      ),
    );
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchFactChecks();
    setIsResultTextVisible(true);
  }, [language, publisher, country, dateOrder, query, pageNum]);

  useEffect(() => {
    setPageNum(1);
    setIsResultTextVisible(false);
  }, [query]);

  useEffect(() => {
    if (query === '' || query === undefined) {
      setDateOrder('desc');
    } else {
      setDateOrder('');
    }
  }, [query]);

  useEffect(() => {
    setDateOrder((prevDateOrder) => prevDateOrder);
  }, [dateOrder]);

  const handleFinish = (formData) => {
    setQuery(formData.query);
  };

  const handleDateChange = (date) => {
    setDateOrder(date);
  };

  const handleCountryChange = (country) => {
    setCountry(country);
  };

  const handlePublisherChange = (publisher) => {
    setPublisher(publisher);
  };

  const handleLanguageChange = (language) => {
    setLanguage(language);
  };

  const handleNext = () => {
    setPageNum((previousPageNum) => previousPageNum + 1);
    window.scrollTo({ top: 0, left: 0 });
  };

  const handlePrevious = () => {
    if (pageNum > 1) {
      setPageNum((previousPageNum) => previousPageNum - 1);
      window.scrollTo({ top: 0, left: 0 });
    }
  };

  const { factChecks, loading } = useSelector(({ sachFactChecks }) => {
    return {
      factChecks: sachFactChecks.details,
      loading: sachFactChecks.loading,
    };
  });

  return (
    <Space direction="vertical" size="medium">
      <Typography.Title> Sach </Typography.Title>
      <Form name="sach-form" form={form} onFinish={handleFinish} layout={'inline'}>
        <Form.Item name="query" style={{ width: '40%' }}>
          <Input
            placeholder={'Search for Fact-Checks about a person or topic or a specific claim'}
            allowClear
          />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          {' '}
          Search{' '}
        </Button>
      </Form>
      <div
        style={{
          display: 'flex',
          marginTop: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '30%',
            gap: '8px',
          }}
        >
          Languages:
          <Select
            name="selectedLanguage"
            placeholder={'Select Language'}
            mode="multiple"
            style={{
              maxWidth: '260px',
              maxHeight: '40px',
            }}
            onChange={handleLanguageChange}
          >
            {languages.map((lang) => (
              <Select.Option value={lang} key={lang}>
                {languageNames.of(lang)}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '30%',
            gap: '8px',
          }}
        >
          Countries:
          <Select
            name="selectedCountry"
            placeholder={'Select Country'}
            mode="multiple"
            style={{ width: '80%' }}
            onChange={handleCountryChange}
          >
            {publisherCountries.map((country) => (
              <Select.Option value={country} key={country}>
                {country}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '30%',
            gap: '8px',
          }}
        >
          Publishers:
          <Select
            name="selectedPublisher"
            placeholder={'Select Publisher'}
            mode="multiple"
            style={{ width: '80%' }}
            onChange={handlePublisherChange}
          >
            {publisherList.map((publisher) => (
              <Select.Option value={publisher} key={publisher}>
                {publisher}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '30%',
            gap: '8px',
          }}
        >
          Sort by date:
          <Select
            name="selectedDateOrder"
            placeholder={'Sort by date'}
            onChange={handleDateChange}
            style={{ width: '80%' }}
            value={dateOrder === '' ? null : dateOrder}
            allowClear
          >
            <Select.Option value={'desc'}> latest </Select.Option>
            <Select.Option value={'asc'}> oldest</Select.Option>
          </Select>
        </div>
      </div>
      {loading ? (
        <Skeleton />
      ) : (
        <div
          style={{
            marginTop: '20px',
          }}
        >
          {isResultTextVisible && factChecks?.length ? (
            <p
              style={{
                color: ' #4b5563',
                fontSize: '16px',
              }}
            >
              {getResultStringFromStats(resultStats, totalMatches)}
            </p>
          ) : null}
          {factChecks?.length
            ? factChecks.map((factCheck, index) => (
                <FactCheck
                  factCheck={factCheck}
                  key={index}
                  // active={true}
                  // setActiveFactCheck={setActiveFactCheck}
                />
              ))
            : null}
          {totalMatches > pageLimit ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '20px',
                gap: '10px',
              }}
            >
              {pageNum > 1 ? (
                <Button
                  onClick={handlePrevious}
                  type="primary"
                  style={{
                    marginRight: 'auto',
                  }}
                >
                  Previous
                </Button>
              ) : null}
              {pageNum * pageLimit < totalMatches ? (
                <Button
                  onClick={handleNext}
                  type="primary"
                  style={{
                    marginLeft: 'auto',
                  }}
                >
                  Next
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </Space>
  );
}

export default Factly;
