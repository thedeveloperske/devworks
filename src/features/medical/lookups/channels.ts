import type { LookupOption } from "./types";

export const CHANNELS = [
  { key: 1, value: "SMART" },
  { key: 2, value: "PHYSICAL CARDS" },
] as const;

export type ChannelKey = (typeof CHANNELS)[number]["key"];

export const channelOptions: LookupOption[] = CHANNELS.map((item) => ({
  value: String(item.key),
  label: item.value,
}));
