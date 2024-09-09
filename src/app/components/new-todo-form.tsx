import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"


export function NewToDoForm(){
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")

    const createTodo = useMutation(api.functions.createTodo)
  
    const handleSubmit =async(e:React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      await createTodo({title, description})
      setTitle("")
      setDescription("")
    }
    return(
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-semibold">Title</label>
        <input 
        className="p-1 border rounded"
        type="text" 
        name="title" 
        id="title" 
        value={title} 
        onChange={e => setTitle(e.target.value)}/>
        <label htmlFor="description" className="text-sm font-semibold">Description</label>
        <input 
        className="p-1 border rounded"
        type="text" 
        name="description" 
        id="description" 
        value={description} onChange={e => setDescription(e.target.value)}/>
        <button type="submit" className="bg-blue-500 p-1 rounded text-white cursor-pointer">Create</button>
        </div>
      </form>
    )
}