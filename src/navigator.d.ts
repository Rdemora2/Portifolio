/**
 * Augments the Navigator interface with the Network Information API
 * and Device Memory API properties used for adaptive performance.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory
 */
interface Navigator {
  /** Approximate amount of device memory in gigabytes. */
  readonly deviceMemory?: number
}
