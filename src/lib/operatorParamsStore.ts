import { create } from 'zustand';

export interface OperatorParamsData {
  map_browser_key?: string;
  autos_panel_theme?: string;
  default_country_code?: string;
  default_country_iso?: string;
  show_operator_logo_on_panel?: string;
  user_web_config?: any;
  operatorDetails?: Array<{
    logo_url: string;
  }>;
  [key: string]: any;
}

interface OperatorParamsState {
  data: OperatorParamsData;
  setData: (params: OperatorParamsData) => void;
  getData: () => OperatorParamsData;
  getParam: (key: string) => any;
  getLogoUrl: () => string | null;
  getPanelTheme: () => { main_color?: string; secondary_color?: string } | null;
  getUserWebConfig: () => any;
  hasData: () => boolean;
  clearData: () => void;
}

export const useOperatorParamsStore = create<OperatorParamsState>((set, get) => ({
  data: {},

  setData: (params: OperatorParamsData) => {
    // console.log('OperatorParamsStore.setData called with:', params);
    set({ data: { ...params } });
    // console.log('OperatorParamsStore data after set:', get().data);
  },

  getData: () => {
    const state = get();
    console.log('OperatorParamsStore.getData called, returning:', state.data);
    return { ...state.data };
  },

  getParam: (key: string) => {
    return get().data[key];
  },

  getLogoUrl: () => {
    const state = get();
    const details = state.data.operatorDetails;
    if (details && details.length > 0) {
      return details[0].logo_url;
    }
    return null;
  },

  getPanelTheme: () => {
    const themeStr = get().data.autos_panel_theme;
    if (themeStr) {
      try {
        return JSON.parse(themeStr);
      } catch (error) {
        console.error('Failed to parse autos_panel_theme:', error);
        return null;
      }
    }
    return null;
  },

  getUserWebConfig: () => {
    return get().data.user_web_config || {};
  },

  hasData: () => {
    return Object.keys(get().data).length > 0;
  },

  clearData: () => {
    set({ data: {} });
  },
}));
