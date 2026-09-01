/**
 * Campaign controls.
 *
 * When the list hits 3,000 wallets, set APPLICATION_OPEN to false.
 *
 * GOOGLE_FORM is the only destination for submissions.
 * Wallet → entry.1527254290. Nothing else is posted.
 */
export const CONFIG = {
  APPLICATION_OPEN: true,
  MAX_SUBMISSIONS: 3000,
  X_URL: "https://x.com/base_apocalypse",
  X_HANDLE: "base_apocalypse",
  TASK_URL: "https://x.com/base_apocalypse/status/2094847100538278280",
  TASK_ID: "2094847100538278280",
  CODE: "BA-LIST",
  SUPPLY: "Finite",
  WINDOW: "List first",
} as const;

export const GOOGLE_FORM = {
  ACTION:
    "https://docs.google.com/forms/d/e/1FAIpQLSfEIky_FeMFO_Yc1IiopfmM6Co0HNwqXXoqLnVbyWtSWFh3jw/formResponse",
  WALLET: "entry.1527254290",
} as const;

export const SIGNAL = {
  FOLLOW: `https://x.com/intent/follow?screen_name=${CONFIG.X_HANDLE}`,
  LIKE: `https://x.com/intent/like?tweet_id=${CONFIG.TASK_ID}`,
  REPOST: `https://x.com/intent/retweet?tweet_id=${CONFIG.TASK_ID}`,
  COMMENT: `https://x.com/intent/tweet?in_reply_to=${CONFIG.TASK_ID}&text=${encodeURIComponent(CONFIG.CODE)}`,
} as const;

export const CAP_LABEL = CONFIG.MAX_SUBMISSIONS.toLocaleString("en-US");
