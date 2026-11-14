import { useReducer, useRef } from 'react';
import PropTypes from 'prop-types';

const MAX_TODOS = 50;
const initialState = { todos: [], filter: 'all', nextId: 1 };

/**
 * Reducer for the todo list.
 * @param {typeof initialState} state Current state.
 * @param {{ type: string, payload?: any }} action Dispatched action.
 */
function reducer(state, action) {
  switch (action.type) {
    case 'add':
      if (state.todos.length >= MAX_TODOS) return state;
      return {
        ...state,
        todos: [...state.todos, { id: state.nextId, text: action.payload, done: false }],
        nextId: state.nextId + 1,
      };
    case 'toggle':
      return {
        ...state,
        todos: state.todos.map((todo) => (todo.id === action.payload ? { ...todo, done: !todo.done } : todo)),
      };
    case 'filter':
      return { ...state, filter: action.payload };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function TodoItem({ todo, onToggle }) {
  return (
    <li className={todo.done ? 'todo todo--done' : 'todo'}>
      <label htmlFor={`todo-${todo.id}`}>
        <input id={`todo-${todo.id}`} type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span>{todo.text}</span>
      </label>
    </li>
  );
}

TodoItem.propTypes = {
  todo: PropTypes.shape({ id: PropTypes.number, text: PropTypes.string, done: PropTypes.bool }).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default function TodoApp({ title = 'Todos' }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const inputRef = useRef(null);

  const visible = state.todos.filter((todo) => {
    if (state.filter === 'done') return todo.done;
    if (state.filter === 'open') return !todo.done;
    return true;
  });

  const submit = (event) => {
    event.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text || /^\s*$/.test(text)) return;
    dispatch({ type: 'add', payload: text });
    inputRef.current.value = '';
  };

  return (
    <main className="app">
      <h1>{title}</h1>
      <form onSubmit={submit}>
        <input ref={inputRef} type="text" placeholder="What needs doing?" maxLength={120} required />
        <button type="submit">Add</button>
      </form>
      <nav>
        {['all', 'open', 'done'].map((name) => (
          <button key={name} aria-pressed={state.filter === name} onClick={() => dispatch({ type: 'filter', payload: name })}>
            {name}
          </button>
        ))}
      </nav>
      {visible.length > 0 ? (
        <ul>
          {visible.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={(id) => dispatch({ type: 'toggle', payload: id })} />
          ))}
        </ul>
      ) : (
        <p>Nothing here &mdash; add a todo above.</p>
      )}
    </main>
  );
}
