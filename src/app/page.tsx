"use client";
import { NewToDoForm } from "./components/new-todo-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export default function Home() {
  
  const todos = useQuery(api.functions.listTodos)

  return (
    <div className="max-w-screen-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">To Do List</h1>
      <ul className="space-y-2">
      {todos?.map(({_id, title, description, completed}, index) => (
       <ToDoItem
       key={index} 
       id={_id}
       title={title}
       description={description}
       completed={completed}
       />
      ))}
      </ul>
      <ul>
          <NewToDoForm/>
      </ul>
    </div>
  );
}

function ToDoItem({id, title, description, completed}: {
  id: Id<"todos">
  title:string
  description: string, 
  completed: boolean,
}){
  const updateTodo = useMutation(api.functions.updateTodo)
  const deleteTodo = useMutation(api.functions.deleteTodo)
  return (
    <li className="w-full flex items-center gap-2 border rounded p-2">
    <input 
    type="checkbox" 
    checked={completed} 
    onChange={e => updateTodo({id, completed: e.target.checked})}
    />
    <div>
    <p className="font-semibold">{title}</p> 
    <p className="text-sm text-gray-600">{description}</p>
    </div>
    <div className="ml-auto">
      <button type="button" className="text-red-500 cursor-pointer" onClick={() => deleteTodo({id})}>Remove</button>
    </div>
  </li>
  )
}
