import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Modal, Backdrop, Fade, TextField, Button, IconButton, Select, MenuItem, Tooltip, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

interface Participant {
  userId: string;
  email?: string;
  role: "editor" | "viewer";
}

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: {
    _id: Id<"lists">;
    name: string;
    participants: Participant[];
    ownerId: string;
  };
}

interface PendingChanges {
  updatedRoles: Record<string, "editor" | "viewer">;
  removedUsers: string[];
}

export function EditListModal({ isOpen, onClose, list }: EditListModalProps) {
  const [newName, setNewName] = useState(list.name);
  const [participants, setParticipants] = useState<Participant[]>(list.participants);
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({
    updatedRoles: {},
    removedUsers: []
  });

  const editList = useMutation(api.functions.editList);
  const changeParticipantRole = useMutation(api.functions.changeParticipantRole);
  const removeParticipant = useMutation(api.functions.removeParticipant);

  const handleRoleChange = (userId: string, newRole: "editor" | "viewer") => {
    setPendingChanges((prev) => ({
      ...prev,
      updatedRoles: { ...prev.updatedRoles, [userId]: newRole },
    }));
  };

  const handleRemoveParticipant = (userId: string) => {
    setPendingChanges((prev) => {
      const isRemoved = prev.removedUsers.includes(userId);
      const updatedRemovedUsers = isRemoved
        ? prev.removedUsers.filter(id => id !== userId)
        : [...prev.removedUsers, userId];
      return {
        ...prev,
        removedUsers: updatedRemovedUsers,
      };
    });
  };

  const handleSaveChanges = async () => {
    try {
      // Update list name
      if (newName.trim() !== list.name) {
        await editList({ listId: list._id, newName });
      }

      // Update roles
      for (const [userId, newRole] of Object.entries(pendingChanges.updatedRoles)) {
        await changeParticipantRole({ listId: list._id, userId, newRole });
      }

      // Remove participants
      for (const userId of pendingChanges.removedUsers) {
        await removeParticipant({ listId: list._id, userId });
      }

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
        style: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        timeout: 500,
      }}
    >
      <Fade in={isOpen}>
        <div className="bg-white p-6 rounded-lg shadow-xl mx-auto my-16 max-w-lg relative">
          <IconButton
            className="absolute top-2 right-2"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon color="action" />
          </IconButton>
          <h2 className="text-2xl font-bold mb-4">Edit List</h2>
          <TextField
            fullWidth
            label="List Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mb-4"
            variant="outlined"
            size="small"
          />

          {participants?.length > 1 && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Participants</h3>
              {participants.slice(1).map((participant) => (
                <div
                  key={participant.userId}
                  className={`flex items-center justify-between mb-2 p-2 rounded-lg border ${pendingChanges.removedUsers.includes(participant.userId) ? 'bg-gray-100 border-gray-300 text-gray-500' : 'bg-white border-gray-200'}`}
                >
                  <span className={`text-sm ${pendingChanges.removedUsers.includes(participant.userId) ? 'line-through' : ''}`}>
                    {participant.email || "No email provided"}
                  </span>
                  <Select
                    value={pendingChanges.updatedRoles[participant.userId] || participant.role}
                    onChange={(e) => handleRoleChange(participant.userId, e.target.value as "editor" | "viewer")}
                    className="mr-2"
                    size="small"
                    disabled={pendingChanges.removedUsers.includes(participant.userId)}
                  >
                    <MenuItem value="viewer">Viewer</MenuItem>
                    <MenuItem value="editor">Editor</MenuItem>
                  </Select>
                  <Tooltip title={pendingChanges.removedUsers.includes(participant.userId) ? "Undo Remove" : "Remove Participant"}>
                    <IconButton
                      onClick={() => handleRemoveParticipant(participant.userId)}
                      color={pendingChanges.removedUsers.includes(participant.userId) ? "primary" : "secondary"}
                      aria-label="Remove Participant"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveChanges}
            className="w-full mt-4"
          >
            Save Changes
          </Button>
        </div>
      </Fade>
    </Modal>
  );
}
