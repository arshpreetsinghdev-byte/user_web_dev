import '@/lib/hippo/hippo.types';

const getHippoKey = () => process.env.NEXT_PUBLIC_HIPPO_KEY;

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
