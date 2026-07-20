export const FUND = {
  OFF: 0,
  ON: 1,
} as const;

export type FundValue = (typeof FUND)[keyof typeof FUND];

export const fundOn = String(FUND.ON);
