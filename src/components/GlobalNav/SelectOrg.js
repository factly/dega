import { GlobalOutlined, DownOutlined } from '@ant-design/icons';
import { Menu, Dropdown } from 'antd';
import React from 'react';
import classNames from 'classnames';

const SelectOrg = (props) => {
  const { className } = props;

  const locales = ['zh-CN', 'zh-TW', 'en-US', 'pt-BR'];
  const languageLabels = {
    'zh-CN': '简体中文',
    'zh-TW': '繁体中文',
    'en-US': 'English',
    'pt-BR': 'Português',
  };
  const languageIcons = {
    'zh-CN': '🇨🇳',
    'zh-TW': '🇭🇰',
    'en-US': '🇺🇸',
    'pt-BR': '🇧🇷',
  };
  const langMenu = (
    <Menu selectedKeys={['en-US']}>
      {locales.map((locale) => (
        <Menu.Item key={locale}>
          <span role="img" aria-label={languageLabels[locale]}>
            {languageIcons[locale]}
          </span>{' '}
          {languageLabels[locale]}
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <Dropdown overlay={langMenu} placement="topRight">
      <span className="dropdown">
        <GlobalOutlined title="Spaces" />
        {` `}
        <DownOutlined />
      </span>
    </Dropdown>
  );
};

export default SelectOrg;
