import axios from 'axios';
import { useCounterStore } from '../store/counterStore';
import { usePersonStore } from '../store/personStore';
import { useEffect } from 'react';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export function Counter() {
  // const { count, increment } = useCounterStore();
  const counterStore = useCounterStore();
  const { count, increment } = counterStore
  const personStore = usePersonStore()
  useEffect(() => {
    // increment()
    personStore.say({counterStore, personStore})
  }, [])
  
  

  const fetchTodo = async () => {
    try {
      const response = await axios.get<Todo>(
        'https://jsonplaceholder.typicode.com/todos/1'
      );
      console.log('Fetched todo:', response.data);
      alert(`Todo: ${response.data.title}`);
    } catch (error) {
      console.error('Failed to fetch todo:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Zustand Counter Example</h2>
      <p style={{ fontSize: '3rem', margin: '1rem 0' }}>{count}</p>
      <div className='flex'>
        <button onClick={increment}>+</button>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={fetchTodo}>Fetch Todo (Axios Demo)</button>
      </div>
    </div>
  );
}
