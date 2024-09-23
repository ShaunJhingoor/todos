"use client";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface EditTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: {
    _id: Id<"todos">;
    title: string;
    description: string;
    dueDate: string;
    expectedTime: string;
  };
}

export function EditTodoModal({ isOpen, onClose, todo }: EditTodoModalProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [dueDate, setDueDate] = useState(todo.dueDate);
  const [expectedTime, setExpectedTime] = useState(todo.expectedTime);

  const updateTodoDetails = useMutation(api.functions.updateTodoDetails);

  const handleSaveChanges = async () => {
    try {
      await updateTodoDetails({
        id: todo?._id,
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate.trim(),
        expectedTime: expectedTime.trim(),
      });
      alert("Todo updated successfully!");
      onClose();
    } catch (error) {
      alert("An error occurred while updating the todo.");
      console.error(error);
    }
  };
  const handleClose = () => {
    setTitle(todo?.title || "");
    setDescription(todo?.description || "");
    setDueDate(todo?.dueDate || "");
    setExpectedTime(todo?.expectedTime || "");
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        style: { backgroundColor: "rgba(0, 0, 0, 0.7)" },
        timeout: 500,
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
            onClick={handleClose}
            aria-label="Close"
            style={{ color: "#1f2937" }}
          >
            <CloseIcon />
          </IconButton>
          <h2 className="text-2xl font-semibold mb-4 text-center">Edit Todo</h2>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            size="small"
            style={{
              color: "#1f2937",
              backgroundColor: "#f9fafb",
              marginBottom: "1.5rem",
            }}
            InputProps={{
              style: { color: "#1f2937", backgroundColor: "#f9fafb" },
            }}
            InputLabelProps={{
              style: { color: "#6b7280" },
            }}
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            size="small"
            style={{
              color: "#1f2937",
              backgroundColor: "#f9fafb",
              marginBottom: "1.5rem",
            }}
            InputProps={{
              style: { color: "#1f2937", backgroundColor: "#f9fafb" },
            }}
            InputLabelProps={{
              style: { color: "#6b7280" },
            }}
          />
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            variant="outlined"
            size="small"
            style={{
              color: "#1f2937",
              backgroundColor: "#f9fafb",
              marginBottom: "1.5rem",
            }}
            InputProps={{
              style: { color: "#1f2937", backgroundColor: "#f9fafb" },
            }}
            InputLabelProps={{
              style: { color: "#6b7280" },
            }}
          />
          <TextField
            fullWidth
            label="Expected Time (Hours)"
            type="number"
            value={expectedTime}
            onChange={(e) => setExpectedTime(e.target.value)}
            variant="outlined"
            size="small"
            style={{ color: "#1f2937", backgroundColor: "#f9fafb" }}
            InputProps={{
              style: { color: "#1f2937", backgroundColor: "#f9fafb" },
            }}
            InputLabelProps={{
              style: { color: "#6b7280" },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveChanges}
            className="w-full"
            style={{
              backgroundColor: "#4f46e5",
              color: "#ffffff",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              textTransform: "none",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              marginTop: "1.5rem",
            }}
          >
            Save Changes
          </Button>
        </div>
      </Fade>
    </Modal>
  );
}
