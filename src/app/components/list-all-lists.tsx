import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// Define the type for the list object
interface List {
  _id: Id<"lists">;
  name: string;
  ownerId: string;
  participants: {
    userId: string;
    role: "editor" | "viewer";
  }[];
}

export function ListAllLists() {
  const lists = useQuery(api.functions.listUserLists);
  const deleteList = useMutation(api.functions.deleteList);

  return (
    <ul className="space-y-2">
      {lists?.map(({ _id, name }, index) => (
        <ListItem key={index} id={_id} name={name} deleteList={deleteList} />
      ))}
    </ul>
  );
}

function ListItem({
  id,
  name,
  deleteList,
}: {
  id: Id<"lists">;
  name: string;
  deleteList: (args: { listId: Id<"lists"> }) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("viewer");
  const addParticipant = useMutation(api.functions.addParticipant);

  const handleAddParticipant = async () => {
    if (!email) {
      alert("Please enter an email address.");
      return;
    }

    try {
      await addParticipant({ listId: id, email, role });
      setEmail(""); // Clear email input after adding
    } catch (error) {
      alert(`Error adding participant`);
      console.log(error)
    }
  };

  return (
    <li className="w-full flex flex-col items-start gap-2 border rounded p-2">
      <div className="flex w-full items-center gap-2">
        <div className="flex-grow">
          <p className="font-semibold">{name}</p>
        </div>
        <div className="ml-auto">
          <button
            type="button"
            className="text-red-500 cursor-pointer"
            onClick={() => deleteList({ listId: id })}
          >
            Remove
          </button>
        </div>
      </div>
      <div className="w-full flex gap-2 mt-2">
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-grow p-2 border rounded"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
          className="p-2 border rounded"
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>
        <button
          type="button"
          className="bg-blue-500 text-white p-2 rounded"
          onClick={handleAddParticipant}
        >
          Add
        </button>
      </div>
    </li>
  );
}
