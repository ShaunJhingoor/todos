import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { AddParticipantModal } from "./Modals/AddParticipantModal";
import { Add as AddIcon, Delete as DeleteIcon ,Edit as EditIcon} from "@mui/icons-material";
import { EditListModal } from "./Modals/EditListModal";
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
    <ul className="space-y-4">
      {lists?.map((list) => (
        <ListItem key={list._id} list={list} deleteList={deleteList} />
      ))}
    </ul>
  );
}

function ListItem({
  list,
  deleteList,
}: {
  list: List;
  deleteList: (args: { listId: Id<"lists"> }) => void;
}) {
  const { user } = useUser();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  return (
    <li className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div className="flex justify-between items-center p-4">
        <p className="text-lg font-semibold text-gray-800">{list.name}</p>
        {user?.id === list.ownerId && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
              onClick={() => setModalOpen(true)}
              aria-label="Add Participant"
            >
              <AddIcon />
            </button>
            <button
              type="button"
              className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition"
              onClick={() => setEditModalOpen(true)} // Open the EditListModal
              aria-label="Edit List"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
              onClick={() => deleteList({ listId: list._id })}
              aria-label="Delete List"
            >
              <DeleteIcon />
            </button>
          </div>
        )}
      </div>
      {user?.id === list.ownerId && isModalOpen && (
        <AddParticipantModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          listId={list._id}
        />
      )}
      {user?.id === list.ownerId && isEditModalOpen && (
        <EditListModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          listId={list._id}
          currentName={list.name}
        />
      )}
    </li>
  );
}
