import React, { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Modal, Backdrop, Fade, TextField, Button, Select, MenuItem } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: Id<"lists">;
}

export function AddParticipantModal({ isOpen, onClose, listId }: AddParticipantModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("viewer");

  const getUserIdByEmail = useAction(api.functions.getUserIdByEmail);
  const addParticipant = useMutation(api.functions.addParticipant);

  const handleAddParticipant = async () => {
    if (!email) {
      alert("Please enter an email address.");
      return;
    }

    try {
      const userId = await getUserIdByEmail({ email });

      if (!userId) {
        throw new Error("User not found");
      }

      await addParticipant({ listId, userId, email, role });

      alert("Participant added successfully!");
      setEmail("");
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error adding participant`);
      } else {
        alert("An unknown error occurred while adding the participant.");
      }
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
        style: { backgroundColor: 'rgba(0, 0, 0, 0.3)' }, // Adjusting opacity
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
          <h2 className="text-xl font-semibold mb-4">Add Participant</h2>
          <TextField
            fullWidth
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
          />
          <Select
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
            className="mb-4"
          >
            <MenuItem value="viewer">Viewer</MenuItem>
            <MenuItem value="editor">Editor</MenuItem>
          </Select>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddParticipant}
            className="w-full mb-2"
          >
            Add
          </Button>
        </div>
      </Fade>
    </Modal>
  );
}
