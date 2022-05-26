import { wait } from './wait.js';
import { until } from './until.js';

export * from './blame.js';
export * from './check.js';
export * from './find.js';
export * from './kill.js';

// alias methods for clarity
export { wait, until };
export const waitUntilBusy = wait;
export const waitUntilFree = until;
