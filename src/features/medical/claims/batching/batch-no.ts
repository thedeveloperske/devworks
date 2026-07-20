const BATCH_NO_PREFIX = "BAT-";

export function formatNextBatchNo(recordCount: number) {
  return `${BATCH_NO_PREFIX}${recordCount + 1}`;
}

export async function nextBatchNo(countRecords: () => Promise<number>) {
  const count = await countRecords();
  return formatNextBatchNo(count);
}
