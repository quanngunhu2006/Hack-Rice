import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'

type Todo = {
  id: string | number
  title?: string
  text?: string
}

function Todos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTodos = async () => {
      setError(null)
      const { data, error } = await supabase.from('todos').select('*')
      if (error) {
        setError(error.message)
        return
      }
      setTodos(Array.isArray(data) ? data : [])
    }
    fetchTodos()
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Todos</h1>
      {error && <div className="text-red-600">{error}</div>}
      <ul className="list-disc pl-6">
        {todos.map((todo) => (
          <li key={String(todo.id)}>{todo.title ?? todo.text ?? String(todo.id)}</li>
        ))}
      </ul>
    </div>
  )
}

export default Todos


