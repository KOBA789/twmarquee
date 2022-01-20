export class Queue<T> {
  private isDisposed: boolean = false;
  private buffer: T[] = [];
  private wakers: ((v: T) => void)[] = [];

  enqueue(value: T): boolean {
    if (this.isDisposed) {
      return false;
    }
    if (this.wakers.length === 0) {
      this.buffer.push(value);
    } else {
      const wake = this.wakers.shift()!;
      wake(value);
    }
    return true;
  }

  async dequeue(): Promise<T> {
    if (this.buffer.length === 0) {
      return new Promise((resolve) => {
        this.wakers.push(resolve);
      });
    } else {
      return this.buffer.shift()!;
    }
  }

  isEmpty(): boolean {
    return this.buffer.length === 0;
  }

  dispose() {
    this.isDisposed = true;
    this.buffer = [];
    this.wakers = [];
  }
}
