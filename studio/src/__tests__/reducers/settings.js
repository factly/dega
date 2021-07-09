import reducer from '../../reducers/settingsReducer';
import * as types from '../../constants/settings';

const initialState = {
  navTheme: 'dark',
  primaryColor: '#1890ff',
  layout: 'sidemenu',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: false,
  colorWeak: false,
  menu: {
    locale: true,
  },
  title: 'Dega Admin',
  pwa: false,
  iconfontUrl: '',
  sider: {
    collapsed: true,
  },
};

describe('settings reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        navTheme: 'dark',
        primaryColor: '#1890ff',
        layout: 'sidemenu',
        contentWidth: 'Fluid',
        fixedHeader: false,
        fixSiderbar: false,
        colorWeak: false,
        menu: {
          locale: false,
        },
        title: 'Dega',
        pwa: false,
        iconfontUrl: '',
        sider: {
          collapsed: false,
        },
      }),
    ).toEqual({
      navTheme: 'dark',
      primaryColor: '#1890ff',
      layout: 'sidemenu',
      contentWidth: 'Fluid',
      fixedHeader: false,
      fixSiderbar: false,
      colorWeak: false,
      menu: {
        locale: false,
      },
      title: 'Dega',
      pwa: false,
      iconfontUrl: '',
      sider: {
        collapsed: false,
      },
    });
  });
  it('should change sider to true when false', () => {
    expect(
      reducer(
        {
          navTheme: 'dark',
          primaryColor: '#1890ff',
          layout: 'sidemenu',
          contentWidth: 'Fluid',
          fixedHeader: false,
          fixSiderbar: false,
          colorWeak: false,
          menu: {
            locale: true,
          },
          title: 'Dega Admin',
          pwa: false,
          iconfontUrl: '',
          sider: {
            collapsed: false,
          },
        },
        {
          type: types.TOGGLE_SIDER,
        },
      ),
    ).toEqual({
      navTheme: 'dark',
      primaryColor: '#1890ff',
      layout: 'sidemenu',
      contentWidth: 'Fluid',
      fixedHeader: false,
      fixSiderbar: false,
      colorWeak: false,
      menu: {
        locale: true,
      },
      title: 'Dega Admin',
      pwa: false,
      iconfontUrl: '',
      sider: {
        collapsed: true,
      },
    });
  });
  it('should change sider to false when true', () => {
    expect(
      reducer(
        {
          navTheme: 'dark',
          primaryColor: '#1890ff',
          layout: 'sidemenu',
          contentWidth: 'Fluid',
          fixedHeader: false,
          fixSiderbar: false,
          colorWeak: false,
          menu: {
            locale: true,
          },
          title: 'Dega Admin',
          pwa: false,
          iconfontUrl: '',
          sider: {
            collapsed: true,
          },
        },
        {
          type: types.TOGGLE_SIDER,
        },
      ),
    ).toEqual({
      navTheme: 'dark',
      primaryColor: '#1890ff',
      layout: 'sidemenu',
      contentWidth: 'Fluid',
      fixedHeader: false,
      fixSiderbar: false,
      colorWeak: false,
      menu: {
        locale: true,
      },
      title: 'Dega Admin',
      pwa: false,
      iconfontUrl: '',
      sider: {
        collapsed: false,
      },
    });
  });
});
