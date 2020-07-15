import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Select, Avatar } from 'antd';
import { setSelectedSpace } from '../../actions/spaces';

const { Option, OptGroup } = Select;

function SpaceSelector() {
  const { orgs, details, selected } = useSelector((state) => state.spaces);
  const dispatch = useDispatch();

  const handleSpaceChange = (space) => {
    dispatch(setSelectedSpace(space));
  };

  const DEFAULT_IMAGE = 'https://www.tibs.org.tw/images/default.jpg';

  return (
    <Select
      style={{ width: '200px' }}
      value={selected}
      onChange={handleSpaceChange}
      bordered={false}
    >
      {orgs.map((organisation) => (
        <OptGroup key={'org-' + organisation.id} label={organisation.title}>
          {organisation.spaces.map((space) => (
            <Option key={'space-' + details[space].id} value={details[space].id}>
              <Avatar
                size="small"
                src={details[space].logo ? details[space].logo.url : DEFAULT_IMAGE}
              />{' '}
              {details[space].name}
            </Option>
          ))}
        </OptGroup>
      ))}
    </Select>
  );
}

export default SpaceSelector;
