import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date(),
      };
      setTodos([newTodo, ...todos]);
      setInputValue("");
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-primary p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            ✨ Todo List
          </h1>
          <p className="text-white/80">
            Управляйте своими задачами красиво
          </p>
        </div>

        {/* Stats */}
        {totalCount > 0 && (
          <Card className="mb-6 bg-gradient-glass backdrop-blur-md border-white/20 shadow-glass">
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-white">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">
                  {completedCount} из {totalCount} выполнено
                </span>
              </div>
              {completedCount === totalCount && totalCount > 0 && (
                <div className="mt-2 text-sm text-green-300 animate-pulse">
                  🎉 Все задачи выполнены!
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Add Todo */}
        <Card className="mb-6 bg-gradient-glass backdrop-blur-md border-white/20 shadow-glass">
          <div className="p-6">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Добавить новую задачу..."
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20"
              />
              <Button
                onClick={addTodo}
                className="bg-gradient-secondary hover:shadow-glow transition-all duration-300 hover:scale-105"
                size="icon"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <Card className="bg-gradient-glass backdrop-blur-md border-white/20 shadow-glass">
              <div className="p-8 text-center text-white/60">
                <div className="text-4xl mb-4">📝</div>
                <p>Пока нет задач</p>
                <p className="text-sm mt-1">Добавьте первую задачу выше</p>
              </div>
            </Card>
          ) : (
            todos.map((todo, index) => (
              <Card
                key={todo.id}
                className={cn(
                  "bg-gradient-glass backdrop-blur-md border-white/20 shadow-glass transition-all duration-300 hover:shadow-glow hover:scale-[1.02]",
                  todo.completed && "opacity-75"
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="p-4 flex items-center gap-3">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                    className="data-[state=checked]:bg-gradient-secondary data-[state=checked]:border-transparent"
                  />
                  <span
                    className={cn(
                      "flex-1 text-white transition-all duration-300",
                      todo.completed && "line-through text-white/60"
                    )}
                  >
                    {todo.text}
                  </span>
                  <Button
                    onClick={() => deleteTodo(todo.id)}
                    variant="ghost"
                    size="icon"
                    className="text-white/60 hover:text-red-400 hover:bg-red-500/20 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-white/40 text-sm">
          Сделано с ❤️ на Lovable
        </div>
      </div>
    </div>
  );
}