export {};

declare global {
  interface Window {
    initHippo?: (config: any) => void;
    updateHippo?: (config: any) => void;
    expandHippoWidget?: () => void;
    collapseHippoWidget?: () => void;
  }
}
