import React, { useState } from "react";
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  Tooltip,
  Button,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

interface Participant {
  userId: string;
  email: string;
  role: "editor" | "viewer";
}

interface ParticipantsPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  list: {
    _id: Id<"lists">;
    ownerId: string;
    participants: Participant[];
  };
}

export const ParticipantsPopover: React.FC<ParticipantsPopoverProps> = ({
  open,
  anchorEl,
  onClose,
  list,
}) => {
  const { user } = useUser(); // Get the current user
  const [editingParticipant, setEditingParticipant] =
    useState<Participant | null>(null);
  const [editedRole, setEditedRole] = useState<"editor" | "viewer">("viewer");

  const changeParticipantRole = useMutation(
    api.functions.changeParticipantRole
  );
  const removeParticipant = useMutation(api.functions.removeParticipant);

  const handleEditClick = (participant: Participant) => {
    setEditingParticipant(participant);
    setEditedRole(participant.role);
  };

  const handleSaveClick = async () => {
    if (editingParticipant) {
      try {
        await changeParticipantRole({
          listId: list._id,
          userId: editingParticipant.userId,
          newRole: editedRole,
        });
        setEditingParticipant(null);
      } catch (error) {
        alert("Error updating participant role");
        console.error("Error updating participant role:", error);
      }
    }
  };

  const handleCancelClick = () => {
    setEditingParticipant(null);
  };

  const handleRemoveClick = async (userId: string) => {
    try {
      await removeParticipant({ listId: list._id, userId });
    } catch (error) {
      alert("Error removing participant");
      console.error("Error removing participant:", error);
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: 2,
          padding: 2,
          background: "linear-gradient(135deg, #f3f4f6, #e2e8f0)",
        },
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        className="p-[.5rem] text-xl font-semibold"
      >
        Participants
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <List sx={{ width: 300 }}>
        {list.participants.map((participant) => (
          <ListItem
            key={participant.userId}
            sx={{ display: "flex", alignItems: "center" }}
          >
            {editingParticipant?.userId === participant.userId ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <TextField
                  label="Role"
                  variant="outlined"
                  select
                  value={editedRole}
                  onChange={(e) =>
                    setEditedRole(e.target.value as "editor" | "viewer")
                  }
                  margin="dense"
                  fullWidth
                  sx={{ bgcolor: "background.default", borderRadius: 1 }} // Match modal styling
                >
                  <MenuItem value="editor">Editor</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                </TextField>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "8px",
                  }}
                >
                  <Button
                    startIcon={<SaveIcon />}
                    sx={{
                      color: "white",
                      bgcolor: "primary.main",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    }}
                    onClick={handleSaveClick}
                  >
                    Save
                  </Button>
                  <Button
                    startIcon={<CancelIcon />}
                    sx={{
                      color: "white",
                      bgcolor: "error.main",
                      "&:hover": {
                        bgcolor: "error.dark",
                      },
                      marginLeft: "8px",
                    }}
                    onClick={handleCancelClick}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ListItemText
                  primary={participant.email}
                  secondary={participant.role}
                  sx={{ flexGrow: 1 }}
                />
                {user?.id === list.ownerId &&
                  participant.userId !== list.ownerId && (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Tooltip title="Edit Participant">
                        <IconButton
                          onClick={() => handleEditClick(participant)}
                          aria-label="Edit Participant"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove Participant">
                        <IconButton
                          onClick={() => handleRemoveClick(participant.userId)}
                          color="error"
                          aria-label="Remove Participant"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  )}
              </>
            )}
          </ListItem>
        ))}
      </List>
    </Popover>
  );
};
