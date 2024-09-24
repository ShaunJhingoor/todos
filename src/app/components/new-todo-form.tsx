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
        sx={{
          textAlign: "center",
          fontWeight: "medium",
          marginBottom: "16px",
        }}
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
        />
        <TextField
          label="Due Date"
          variant="outlined"
          type="date"
          fullWidth
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          // required
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            "& .MuiInputBase-input": {
              padding: "16.5px 14px",
            },
            "& .MuiFormLabel-root": {
              top: "12px",
            },
          }}
        />
        <TextField
          label="Expected Time (in hours)"
          variant="outlined"
          fullWidth
          value={expectedTime}
          onChange={(e) => setExpectedTime(e.target.value)}
          placeholder="Enter expected time to complete"
          // required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            marginTop: "16px",
            backgroundColor: isDisabled ? "#cfd8dc" : "#1976d2",
            "&:hover": {
              backgroundColor: isDisabled ? "#cfd8dc" : "#1565c0",
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
