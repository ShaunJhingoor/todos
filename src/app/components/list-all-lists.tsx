import React from "react";
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
        <ListItem
          key={index}
          id={_id}
          name={name}
          deleteList={deleteList}
        />
      ))}
    </ul>
  );
}


function ListItem({ id, name, deleteList }: { 
  id: Id<"lists">; 
  name: string; 
  deleteList: (args: { listId: Id<"lists"> }) => void; 
}) {
  return (
    <li className="w-full flex items-center gap-2 border rounded p-2">
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
    </li>
  );
}
