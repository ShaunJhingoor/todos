import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api"; 

interface CreateListFormProps {
  onSuccess: () => void; 
}

export function CreateListForm({ onSuccess }: CreateListFormProps) {
  const [name, setName] = useState("");

  const createList = useMutation(api.functions.createList);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createList({ name });
    setName("");
    onSuccess();
  };

  const isDisabled = !name.trim();

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-semibold">List Name</label>
        <input
          className="p-2 border rounded bg-white"
          type="text"
          name="name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter List name"
          required
        />
        <button
          type="submit"
          className={`p-2 rounded text-white cursor-pointer ${isDisabled ? 'bg-gray-400' : 'bg-blue-500'} transition-colors`}
          disabled={isDisabled}
        >
          Create
        </button>
      </div>
    </form>
  );
}
