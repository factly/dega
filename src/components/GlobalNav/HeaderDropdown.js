import { Dropdown } from 'antd';
import React from 'react';
import classNames from 'classnames';

const HeaderDropdown = ({ overlayClassName: cls, ...restProps }) => (
  <Dropdown overlayClassName={classNames('container', cls)} {...restProps} />
);

export default HeaderDropdown;
