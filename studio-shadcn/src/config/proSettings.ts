// Define the interface for the settings
export interface ProSettings {
  navTheme: "light" | "dark";
  primaryColor: string;
  layout: "sidemenu" | "topmenu";
  contentWidth: "Fluid" | "Fixed";
  fixedHeader: boolean;
  fixSiderbar: boolean;
  colorWeak: boolean;
  menu: {
    locale: boolean;
  };
  title: string;
  pwa: boolean;
  iconfontUrl: string;
}

const proSettings: ProSettings = {
  navTheme: "light",
  primaryColor: "#1890ff",
  layout: "sidemenu",
  contentWidth: "Fluid",
  fixedHeader: false,
  fixSiderbar: false,
  colorWeak: false,
  menu: {
    locale: true,
  },
  title: "Dega Admin",
  pwa: false,
  iconfontUrl: "",
};

export default proSettings;
