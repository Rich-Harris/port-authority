import { wait } from './wait';
import { until } from './until';

export * from './blame';
export * from './check';
export * from './find';
export * from './kill';

// alias methods for clarity
export { wait, until };
export const waitUntilBusy = wait;
export const waitUntilFree = until;