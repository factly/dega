import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Select, Avatar } from 'antd';
import { setSelectedSpace } from '../../actions/spaces';
import degaImg from '../../assets/dega.png';

const { Option, OptGroup } = Select;

function SpaceSelector({ collapsed }) {
  const { orgs, details, selected } = useSelector((state) => state.spaces);
  const dispatch = useDispatch();

  const handleSpaceChange = (space) => {
    dispatch(setSelectedSpace(space));
  };

  return (
    <>
      {collapsed ? (
        <img
          alt="logo"
          className="menu-logo"
          src={
            details[selected]?.fav_icon?.url?.[
              window.REACT_APP_ENABLE_IMGPROXY ? 'proxy' : 'raw'
            ] || degaImg
          }
        />
      ) : (
        <Select
          style={{ width: '200px' }}
          value={selected !== 0 ? selected : orgs[0]?.title}
          onChange={handleSpaceChange}
          bordered={false}
        >
          {orgs.map((organisation) => (
            <OptGroup key={'org-' + organisation.id} label={organisation.title}>
              {organisation.spaces.map((space) => (
                <Option key={'space-' + details[space].id} value={details[space].id}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      size="small"
                      shape="square"
                      src={
                        details[space].fav_icon
                          ? details[space].fav_icon.url?.[
                              window.REACT_APP_ENABLE_IMGPROXY ? 'proxy' : 'raw'
                            ]
                          : degaImg
                      }
                    />
                    <h3 style={{ margin: 0, marginLeft: '0.5rem' }}>{details[space].name}</h3>
                  </div>
                </Option>
              ))}
            </OptGroup>
          ))}
        </Select>
      )}
    </>
  );
}
export default SpaceSelector;
