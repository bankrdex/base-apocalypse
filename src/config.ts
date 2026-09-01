/**
 * Campaign controls.
 *
 * When the list hits 3,000 wallets, set APPLICATION_OPEN to false.
 * TASK_URL: paste the signal post later. Leave blank until it exists.
 */
export const CONFIG = {
  APPLICATION_OPEN: true,
  MAX_SUBMISSIONS: 3000,
  X_URL: "https://x.com/presdency_",
  X_HANDLE: "presdency_",
  TASK_URL: "",
  CODE: "BA-LIST",
  SUPPLY: "Finite",
  WINDOW: "List first",
} as const;

export const CAP_LABEL = CONFIG.MAX_SUBMISSIONS.toLocaleString("en-US");
