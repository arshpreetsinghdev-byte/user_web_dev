import '@/lib/hippo/hippo.types';
import { useOperatorParamsStore } from '@/lib/operatorParamsStore';

const getHippoKey = () => {
  // Try to get from operator params config first
  const { getUserWebConfig } = useOperatorParamsStore.getState();
  const config = getUserWebConfig();
  console.log("chat support key: ", config?.chat_support);
  return config?.chat_support;
};

/**
 * Initialize Hippo silently (no widget icon)
 */
export const initHippo = () => {
  if (typeof window === "undefined" || !window.initHippo) return;

  window.initHippo({
    appSecretKey: getHippoKey(),
    collapseType: "completeHide", // fully hidden widget
    hideNewConversation: "1",
    ignore_auto_msgs: "true",
    notification_sound: "0",
    alwaysSkipBot: true,
    force_assign: "1",
    color: "#000000",
    language: "en",
  });
};

/**
 * Sync authenticated user with Hippo
 */
export const identifyHippoUser = (user: {
  id: string;
  name: string;
  email: string;
  phone?: string;
}) => {
  if (typeof window === "undefined" || !window.updateHippo) return;

  window.updateHippo({
    appSecretKey: getHippoKey(),
    uniqueId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
  });
};

/**
 * Open chat programmatically
 */
export const openHippoChat = () => {
  if (typeof window === "undefined" || !window.expandHippoWidget) return;
  window.expandHippoWidget();
};

/**
 * Close chat programmatically (optional)
 */
export const closeHippoChat = () => {
  if (typeof window === "undefined" || !window.collapseHippoWidget) return;
  window.collapseHippoWidget();
};
