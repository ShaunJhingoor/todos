import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"

interface NewToDoFormProps {
  onSuccess: () => void; 
}

export function NewToDoForm( {onSuccess}: NewToDoFormProps){
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")

    const createTodo = useMutation(api.functions.createTodo)
  
    const handleSubmit =async(e:React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      await createTodo({title, description})
      setTitle("")
      setDescription("")
      onSuccess()
    }
    const isDisabled = !title.trim() || !description.trim();
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
        onChange={e => setTitle(e.target.value)}
        placeholder="Enter To Do title"
        required/>
        <label htmlFor="description" className="text-sm font-semibold">Description</label>
        <input 
        className="p-1 border rounded"
        type="text" 
        name="description" 
        id="description" 
        placeholder="Enter To Do description"
        value={description} onChange={e => setDescription(e.target.value)}
        required/>
          <button
            type="submit"
            className={`p-1 rounded text-white cursor-pointer ${isDisabled ? 'bg-gray-400' : 'bg-blue-500'} transition-colors`}
            disabled={isDisabled} 
          >
          Create
          </button>
        </div>
      </form>
    )
}