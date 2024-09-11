import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Modal, Backdrop, Fade, TextField, Button, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: Id<"lists">;
  currentName: string;
}

export function EditListModal({ isOpen, onClose, listId, currentName }: EditListModalProps) {
  const [newName, setNewName] = useState(currentName);

  const editList = useMutation(api.functions.editList);

  const handleEditList = async () => {
    if (!newName.trim()) {
      alert("Please enter a list name.");
      return;
    }

    try {
      await editList({ listId, newName });
      alert("List updated successfully!");
      onClose();
    } catch (error) {
      alert("An error occurred while editing the list.");
      console.error(error);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        style: { backgroundColor: 'rgba(0, 0, 0, 0.3)' },
        timeout: 500,
      }}
    >
      <Fade in={isOpen}>
        <div className="bg-white p-6 rounded-lg shadow-lg mx-auto my-16 max-w-md relative">
          <CloseIcon
            className="absolute top-2 right-2 text-gray-500 cursor-pointer hover:text-gray-800"
            onClick={onClose}
            aria-label="Close"
          />
          <h2 className="text-xl font-semibold mb-4">Edit List</h2>
          <TextField
            fullWidth
            label="List Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mb-4"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleEditList}
            className="w-full mb-2"
          >
            Save Changes
          </Button>
        </div>
      </Fade>
    </Modal>
  );
}
