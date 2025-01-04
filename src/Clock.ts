/**
 * A utility class for measuring and logging execution time
 */
export class Clock {
  private startTime: number = performance.now();

  /**
   * Creates a new Clock instance
   * @param name - The name to use in log messages
   */
  constructor(private readonly name: string) {}

  /**
   * Resets the clock's start and log times to now
   */
  start(): void {
    this.startTime = performance.now();
  }

  /**
   * Logs the time elapsed since the start
   * @param message - Optional message to include in the log
   */
  log(message?: string): void {
    const now = performance.now();
    const elapsed = now - this.startTime;
    const decoratedMessage = message ? `(${message})` : "";
    console.error(`[${this.name}] ${elapsed.toFixed(3)}ms ${decoratedMessage}`);
  }

  /**
   * Logs the total time elapsed since start
   * @param message - Optional message to include in the log
   * @returns The total elapsed time in milliseconds
   */
  stop(message = ""): number {
    this.log(message);
    const now = performance.now();
    const total = now - this.startTime;
    return total;
  }
}
