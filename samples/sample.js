// @ts-check
'use strict';

/**
 * A small task queue with retries.
 *
 * @typedef {Object} Task
 * @property {string} id Unique task id.
 * @property {() => Promise<unknown>} run Work to perform.
 * @property {number} [retries] How many times to retry.
 */

import fs from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import defaultExport, * as utils from './utils.js';

export const DEFAULT_RETRIES = 3;
const BACKOFF_MS = 250;
const ID_PATTERN = /^task-(\d+)\.(?:json|ya?ml)$/i;

/** @enum {string} */
export const State = Object.freeze({
  Pending: 'pending',
  Running: 'running',
  Failed: 'failed',
});

export class TaskQueue {
  static #created = 0;
  #tasks = [];
  state = State.Pending;

  /**
   * @param {string} name Queue name.
   * @param {{ concurrency?: number }} [options] Queue options.
   */
  constructor(name, { concurrency = 2 } = {}) {
    this.name = name;
    this.concurrency = concurrency;
    TaskQueue.#created++;
  }

  get length() {
    return this.#tasks.length;
  }

  /** @param {Task} task */
  add(task) {
    if (!ID_PATTERN.test(task.id)) {
      throw new TypeError(`Invalid task id: ${task.id}`);
    }
    this.#tasks.push({ retries: DEFAULT_RETRIES, ...task });
    return this;
  }

  async *results() {
    for (const task of this.#tasks) {
      yield await this.#attempt(task);
    }
  }

  async #attempt(task, attempt = 1) {
    try {
      this.state = State.Running;
      return await task.run();
    } catch (error) {
      if (attempt >= task.retries) {
        this.state = State.Failed;
        console.error('Task failed\t%s', task.id, error);
        return undefined;
      }
      await sleep(BACKOFF_MS * 2 ** attempt);
      return this.#attempt(task, attempt + 1);
    }
  }
}

const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));

export default async function main(argv = process.argv.slice(2)) {
  const queue = new TaskQueue('io', { concurrency: 4 });
  const [first = 'task-1.json', ...rest] = argv;

  queue.add({ id: first, run: () => readJson(first) });
  rest.forEach((file, index) => queue.add({ id: file, run: () => readJson(file), retries: index + 1 }));

  let total = 0;
  for await (const result of queue.results()) {
    total += result == null ? 0 : Object.keys(result).length;
  }

  const summary = {
    name: queue.name,
    total,
    ok: queue.state !== State.Failed,
    'max-size': Number.MAX_SAFE_INTEGER,
    ratio: Math.round((total / (queue.length || 1)) * 100) / 100,
    nothing: null,
    missing: undefined,
    big: 9007199254740993n,
  };
  console.table(summary);
  return typeof defaultExport === 'function' && utils != null ? summary : void 0;
}
