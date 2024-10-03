import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Modal,
  Backdrop,
  Fade,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
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
  const participants = list.participants;
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({
    updatedRoles: {},
    removedUsers: [],
  });

  const editList = useMutation(api.functions.editList);
  const changeParticipantRole = useMutation(
    api.functions.changeParticipantRole
  );
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
        ? prev.removedUsers.filter((id) => id !== userId)
        : [...prev.removedUsers, userId];
      return {
        ...prev,
        removedUsers: updatedRemovedUsers,
      };
    });
  };

  const handleSaveChanges = async () => {
    try {
      if (newName.trim() !== list.name) {
        await editList({ listId: list._id, newName });
      }

      for (const [userId, newRole] of Object.entries(
        pendingChanges.updatedRoles
      )) {
        await changeParticipantRole({ listId: list._id, userId, newRole });
      }

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
        style: { backgroundColor: "rgba(0, 0, 0, 0.7)" },
        timeout: 1000,
      }}
    >
      <Fade in={isOpen}>
        <div
          className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl mx-auto my-16 max-w-lg relative"
          style={{
            background: "linear-gradient(135deg, #f3f4f6, #e2e8f0)",
            border: "1px solid #e0e0e0",
            color: "#1f2937",
          }}
        >
          <IconButton
            className="absolute top-2 right-2"
            onClick={onClose}
            aria-label="Close"
            style={{ color: "#1f2937" }}
          >
            <CloseIcon />
          </IconButton>
          <h2 className="text-2xl font-semibold mb-4 text-center">Edit List</h2>
          <TextField
            fullWidth
            label="List Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            variant="outlined"
            size="small"
            className="mb-4"
            InputProps={{
              style: { color: "#1f2937", backgroundColor: "#f9fafb" },
            }}
            InputLabelProps={{
              style: { color: "#6b7280" },
            }}
          />

          {participants.length > 1 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Participants</h3>
              {participants.slice(1).map((participant) => (
                <div
                  key={participant.userId}
                  className={`flex items-center justify-between mb-2 p-2 rounded-md border ${
                    pendingChanges.removedUsers.includes(participant.userId)
                      ? "bg-gray-200 border-gray-300 text-gray-500"
                      : "bg-white border-gray-200 text-gray-700"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      pendingChanges.removedUsers.includes(participant.userId)
                        ? "line-through"
                        : ""
                    }`}
                  >
                    {participant.email || "No email provided"}
                  </span>
                  <Select
                    value={
                      pendingChanges.updatedRoles[participant.userId] ||
                      participant.role
                    }
                    onChange={(e) =>
                      handleRoleChange(
                        participant.userId,
                        e.target.value as "editor" | "viewer"
                      )
                    }
                    size="small"
                    className="mr-2"
                    disabled={pendingChanges.removedUsers.includes(
                      participant.userId
                    )}
                    style={{ color: "#1f2937", minWidth: "100px" }}
                  >
                    <MenuItem value="viewer">Viewer</MenuItem>
                    <MenuItem value="editor">Editor</MenuItem>
                  </Select>
                  <Tooltip
                    title={
                      pendingChanges.removedUsers.includes(participant.userId)
                        ? "Undo Remove"
                        : "Remove Participant"
                    }
                  >
                    <IconButton
                      onClick={() =>
                        handleRemoveParticipant(participant.userId)
                      }
                      aria-label="Remove Participant"
                      style={{
                        color: pendingChanges.removedUsers.includes(
                          participant.userId
                        )
                          ? "#6b7280"
                          : "#ef4444",
                      }}
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
            style={{
              backgroundColor: "#4f46e5",
              color: "#ffffff",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              textTransform: "none",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
            }}
          >
            Save Changes
          </Button>
        </div>
      </Fade>
    </Modal>
  );
}
