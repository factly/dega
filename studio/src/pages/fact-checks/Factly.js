import React from 'react';
import { Typography, Space, Input, Form, Select, Button, List } from 'antd';
import { useState, useEffect } from 'react'
import {useDispatch, useSelector} from 'react-redux'
import { getSachFactChecks, getSachFilters } from '../../actions/sachFactChecks';

function Factly() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [language, setLanguage] = useState([]);
	const [publisher, setPublisher] = useState([]);
	const [country, setCountry] = useState([]);
	const [dateOrder, setDateOrder] = useState("");
  const [publisherList, setPublishersList] = useState([]);
	const [publisherCountries, setPublisherCountries] = useState([]);
	const [languages, setLanguages] = useState([]);
  const [query, setQuery] = useState("");
  const [pageNum, setPageNum] =  useState(1);
  const [totalMatches, setTotalMatches] = useState(0);
	let languageNames = new Intl.DisplayNames(['en'], {type: 'language'});

  const fetchFilters = () => {
    dispatch(getSachFilters(setLanguages, setPublishersList, setPublisherCountries));
  }

  const fetchFactChecks = () => {
    dispatch(getSachFactChecks(
                      {
                        q: query,
                        selectedLanguage: language,
                        selectedPublisher: publisher,
                        selectedCountry: country,
                        limit: 20,
                        sortByDate: dateOrder,
                        offset: (pageNum-1) * 20
                      }, setTotalMatches
                      ))
  }

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchFactChecks()
  }, [ language, publisher, country, dateOrder, query, pageNum])

  useEffect(() => {
		setPageNum(1)
	}, [query])
  
  const handleFinish = (formData) => {
    setQuery(formData.query)
  }

  const handleDateChange = (date) => {
    setDateOrder(date)
  }

  const handleCountryChange = (country) => {
    setCountry(country)
  }

  const handlePublisherChange = (publisher) => {
    setPublisher(publisher)
  }

  const handleLanguageChange = (language) => {
    setLanguage(language)
  }

  const { factChecks, loading } = useSelector(({sachFactChecks}) => {
    return {
      factChecks: sachFactChecks.details,
      loading: sachFactChecks.loading
    }
  })  
  
  const loadPrevious = () => {
    if(pageNum>1){
			setPageNum((previousPageNum) => previousPageNum - 1)
		}
  }

  const onLoadMore = () => {
    setPageNum((previousPageNum) => previousPageNum + 1)
  }

  const loadMore = !loading ? (
    <div
      style={{
        float: 'right',
        paddingBlock: '10px',
      }}
    >
      <Space direction="horizontal">
        <Button disabled={pageNum <= 1} onClick={loadPrevious}>
          Back
        </Button>
        <Button disabled={20*pageNum >= totalMatches} onClick={onLoadMore}>
          Next
        </Button>
      </Space>
    </div>
  ) : null;


  return (
    <Space
      direction="vertical"
      size="large"  
    >
      <Typography.Title> Sach </Typography.Title>
      <Form
        name="sach-form"
        form={form}
        onFinish={handleFinish}
        layout={"inline"}
      >
        <Form.Item
          name="query"
          label="Search"
            // rules={[
            //   {
            //     required: true,
            //     message: 'Please enter your search query!',
            //   },
            // ]}
          style={{ width: '40%' }}
        >
          <Input placeholder={"Search for Fact-Checks about a person or topic or a specific claim"} allowClear/>
        </Form.Item>
        <Button type="primary" htmlType="submit"> Search </Button>
      </Form>
      <div
        style={{
          display:'flex',
          gap:'8px',
        }}

      >
        <Form.Item
          label="Language"
          style={{width:'15%'}}
        >
          <Select
            name="selectedLanguage"
            placeholder={"Select Language"}
            mode="multiple"
            onChange={handleLanguageChange}
          > 
          {
            languages.map((lang) => <Select.Option value={lang} key={lang}>{languageNames.of(lang)}</Select.Option>)
          }
          </Select>
        </Form.Item>
        <Form.Item
          style={{width:'15%'}}
          label="Country"
        >
          <Select
            name="selectedCountry"
            placeholder={"Select Country"}
            mode="multiple"
            onChange={handleCountryChange}
          > 
          {
            publisherCountries.map((country) => <Select.Option value={country} key={country}>{country}</Select.Option>)
          }
          </Select>
        </Form.Item>
        <Form.Item
            style={{width:'15%'}}
            label="Publisher"
        >
          <Select
            name="selectedPublisher"
            placeholder={"Select Publisher"}
            mode="multiple"
            onChange={handlePublisherChange}
          > 
          {
            publisherList.map((publisher) => <Select.Option value={publisher} key={publisher}>{publisher}</Select.Option>)
          }
          </Select>
        </Form.Item>
        <Form.Item
          style={{width:'15%'}}
          label="Sort by date"
        >
          <Select
            name="selectedDateOrder"
            placeholder={"Sort by date"}
            mode="multiple"
            onChange={handleDateChange}
            allowClear
          > 
            <Select.Option value={'desc'}> latest </Select.Option>
            <Select.Option value={'asc'}> oldest</Select.Option>
          </Select>
        </Form.Item>
      </div>
      <List
        bordered
        className="google-fact-check-search-list"
        loading={loading}
        itemLayout="vertical"
        dataSource={factChecks}
        loadMore={loadMore}
        renderItem={(factCheck) => (
          <List.Item key={factCheck.title}>
            {
              factCheck?.claims?.[0]?.claimant ? <Typography.Title level={5}>{`Claim by ${factCheck?.claims?.[0]?.claimant}:`}</Typography.Title> : null
            }
            <Typography.Title level={4}>{factCheck.title}</Typography.Title>
            <>
              <Typography>
                <b>{factCheck?.publisher?.name}</b> rating : <b>{factCheck?.claims?.[0].claimreview[0].textualrating}</b>
              </Typography>
              <a href={factCheck?.pageurl} target={'blank'}>
                {factCheck.pageurl}
              </a>
            </>
          </List.Item>
        )}
      />
    </Space>
    )
    ;
}

export default Factly;
