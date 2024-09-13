import React, { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Modal, Backdrop, Fade, TextField, Button, Select, MenuItem, IconButton } from "@mui/material";
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
        style: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        timeout: 500,
      }}
    >
      <Fade in={isOpen}>
        <div
          className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl mx-auto my-16 max-w-lg relative"
          style={{
            background: 'linear-gradient(135deg, #f3f4f6, #e2e8f0)',
            border: '1px solid #e0e0e0',
            color: '#1f2937',
          }}
        >
          <IconButton
            className="absolute top-2 right-2"
            onClick={onClose}
            aria-label="Close"
            style={{ color: '#1f2937' }}
          >
            <CloseIcon />
          </IconButton>
          <h2 className="text-2xl font-semibold mb-4 text-center">Add Participant</h2>
          <TextField
            fullWidth
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            size="small"
            style={{ color: '#1f2937', backgroundColor: '#f9fafb', marginBottom: '1rem' }}
            InputProps={{
              style: { color: '#1f2937', backgroundColor: '#f9fafb' },
            }}
            InputLabelProps={{
              style: { color: '#6b7280' },
            }}
          />
          <Select
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
            className="mb-4"
            size="small"
            style={{color: '#6b7280', backgroundColor: '#f9fafb', minWidth: '100px' }}
          >
            <MenuItem value="viewer">Viewer</MenuItem>
            <MenuItem value="editor">Editor</MenuItem>
          </Select>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddParticipant}
            className="w-full mt-4"
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              textTransform: 'none',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
            }}
          >
            Add Participant
          </Button>
        </div>
      </Fade>
    </Modal>
  );
}
