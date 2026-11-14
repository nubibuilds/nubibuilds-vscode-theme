import React, { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

/** Visual tone of a {@link Badge}. */
export enum Tone {
  Neutral = 'neutral',
  Success = 'success',
  Danger = 'danger',
}

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
}

interface User {
  readonly id: number;
  name: string;
  email?: string;
  roles: ReadonlyArray<'admin' | 'editor' | 'viewer'>;
}

type UserListProps<T extends User = User> = {
  users: T[];
  pageSize?: number;
  onSelect(user: T): void;
};

const EMAIL = /^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i;
const PAGE_SIZE = 20;

export function Badge({ tone = Tone.Neutral, children }: BadgeProps): JSX.Element {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function UserList<T extends User>({ users, pageSize = PAGE_SIZE, onSelect }: UserListProps<T>) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const term = useDebounced(query.trim().toLowerCase());

  const visible = useMemo(
    () => users.filter((user) => user.name.toLowerCase().includes(term)).slice(0, pageSize),
    [users, term, pageSize],
  );

  const handleSelect = useCallback(
    async (user: T) => {
      setSelected(user.id);
      await Promise.resolve();
      onSelect(user);
    },
    [onSelect],
  );

  if (users.length === 0) {
    return <p className="empty">No users yet.</p>;
  }

  return (
    <section id="users" aria-label="User list" data-count={visible.length}>
      <input
        type="search"
        value={query}
        placeholder="Filter by name&hellip;"
        onChange={(event) => setQuery(event.target.value)}
        autoFocus
      />
      <ul>
        {visible.map((user) => (
          <li key={user.id} className={user.id === selected ? 'is-selected' : undefined}>
            <button type="button" onClick={() => handleSelect(user)} disabled={!user.email}>
              {user.name}
            </button>
            {user.email && EMAIL.test(user.email) ? (
              <a href={`mailto:${user.email}`}>{user.email}</a>
            ) : (
              <Badge tone={Tone.Danger}>no email</Badge>
            )}
            {user.roles.includes('admin') && <Badge tone={Tone.Success}>admin</Badge>}
          </li>
        ))}
      </ul>
      <>
        {/* JSX comment */}
        <footer style={{ opacity: 0.6, marginTop: 8 }}>
          Showing {visible.length} of {users.length}
        </footer>
      </>
    </section>
  );
}
