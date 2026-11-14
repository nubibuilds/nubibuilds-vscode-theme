/**
 * Inventory service: exercises most TypeScript token categories.
 *
 * @param T The entity type stored in the repository.
 * @see {@link Repository}
 */
import { EventEmitter } from 'node:events';
import type { IncomingMessage } from 'node:http';
import * as path from 'node:path';

export namespace Units {
  export const KILOGRAM = 'kg';
  export function format(value: number, unit: string = KILOGRAM): string {
    return `${value.toFixed(2)} ${unit}`;
  }
}

export enum Status {
  Draft = 0,
  Active = 1,
  Archived = 2,
}

export type Id = string | number;
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export interface Entity {
  readonly id: Id;
  name: string;
  tags?: string[];
  status: Status;
}

function logged(target: object, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const original = descriptor.value;
  descriptor.value = function (...args: unknown[]) {
    console.log(`[${key}] called with`, args);
    return original.apply(this, args);
  };
  return descriptor;
}

function sealed<T extends new (...args: any[]) => object>(ctor: T): T {
  Object.seal(ctor.prototype);
  return ctor;
}

const SKU_PATTERN = /^(?<prefix>[A-Z]{3})-\d{4,6}(?:\/[a-z]+)?$/giu;
const MAX_ITEMS = 1_000;
const HEX_MASK = 0xff_ff;
const RATIO = 1.5e-3;
let counter = 0;

@sealed
export abstract class Repository<T extends Entity> extends EventEmitter {
  static instances = 0;
  protected readonly items = new Map<Id, T>();
  #secret: symbol = Symbol('repo');

  constructor(private readonly label: string) {
    super();
    Repository.instances += 1;
  }

  abstract validate(item: T): boolean;

  @logged
  async save(item: T, options?: { overwrite: boolean }): Promise<Result<T>> {
    if (!this.validate(item) || this.items.size >= MAX_ITEMS) {
      return { ok: false, error: new RangeError(`Cannot save "${item.name}"\n`) };
    }
    if (this.items.has(item.id) && options?.overwrite !== true) {
      return { ok: false, error: new Error('Duplicate id') };
    }
    this.items.set(item.id, item);
    this.emit('saved', item);
    counter++;
    return { ok: true, value: item };
  }

  /** @deprecated Use {@link Repository.find} instead. */
  get(id: Id): T | undefined {
    return this.items.get(id);
  }

  find(predicate: (item: T) => boolean): T[] {
    return [...this.items.values()].filter(predicate);
  }

  get size(): number {
    return this.items.size;
  }
}

class ProductRepository extends Repository<Entity> {
  validate(item: Entity): boolean {
    return SKU_PATTERN.test(String(item.id)) && item.name.trim().length > 0;
  }
}

export async function main(request?: IncomingMessage): Promise<void> {
  const repo = new ProductRepository('products');
  const draft: Entity = { id: 'ABC-1234', name: 'Widget', status: Status.Draft, tags: ['new'] };
  const result = await repo.save(draft, { overwrite: false });

  if (result.ok) {
    const { name, tags = [] } = result.value;
    const file = path.join(__dirname, `${name.toLowerCase()}.json`);
    console.info(Units.format(RATIO * HEX_MASK), file, tags.length, typeof request);
  } else {
    throw result.error;
  }

  const legacy = repo.get('ABC-1234'); // deprecated call: should be struck through
  const nothing: null | undefined = legacy ? null : undefined;
  void nothing;
}
