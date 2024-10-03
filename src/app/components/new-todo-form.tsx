"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button, TextField, Typography, Box } from "@mui/material";

interface CreateTodoFormProps {
  listId: Id<"lists">;
  onSuccess: () => void;
}
export function CreateTodoForm({ listId, onSuccess }: CreateTodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [expectedTime, setExpectedTime] = useState("");

  const createTodo = useMutation(api.functions.createTodo);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createTodo({ title, description, listId, dueDate, expectedTime });
    setTitle("");
    setDescription("");
    setDueDate("");
    setExpectedTime("");
    onSuccess();
  };

  const isDisabled = !title.trim() || !description.trim();

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        padding: "16px",
        width: "100%",
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        className="text-2xl font-semibold mb-4 text-center"
      >
        Create New Todo
      </Typography>
      <Box className="flex flex-col gap-2">
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter To-Do title"
          required
          sx={{
            backgroundColor: "#f9fafb",
            marginBottom: "1rem",
            "& .MuiInputBase-input": {
              color: "#1f2937",
            },
            "& .MuiFormLabel-root": {
              color: "#6b7280",
            },
          }}
        />
        <TextField
          label="Description"
          variant="outlined"
          multiline
          rows={4}
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter To-Do description"
          required
          sx={{
            backgroundColor: "#f9fafb",
            marginBottom: "1rem",
            "& .MuiInputBase-input": {
              color: "#1f2937",
            },
            "& .MuiFormLabel-root": {
              color: "#6b7280",
            },
          }}
        />
        <TextField
          label="Due Date"
          variant="outlined"
          type="date"
          fullWidth
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            backgroundColor: "#f9fafb",
            marginBottom: "1rem",
            "& .MuiInputBase-input": {
              color: "#1f2937",
            },
            "& .MuiFormLabel-root": {
              color: "#6b7280",
            },
          }}
        />
        <TextField
          label="Expected Time (in hours)"
          variant="outlined"
          fullWidth
          type="number"
          value={expectedTime}
          onChange={(e) => setExpectedTime(e.target.value)}
          placeholder="Enter expected time to complete"
          sx={{
            backgroundColor: "#f9fafb",
            marginBottom: "1rem",
            "& .MuiInputBase-input": {
              color: "#1f2937",
            },
            "& .MuiFormLabel-root": {
              color: "#6b7280",
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            backgroundColor: isDisabled ? "#cfd8dc" : "#4f46e5",
            "&:hover": {
              backgroundColor: isDisabled ? "#cfd8dc" : "#4338ca",
            },
          }}
          disabled={isDisabled}
        >
          Create To-Do
        </Button>
      </Box>
    </Box>
  );
}
