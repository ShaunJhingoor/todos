"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

interface GenerateTodoFormProps {
  listId: Id<"lists">;
  onSuccess: () => void;
}

export function GenerateToDoModal({
  listId,
  onSuccess,
}: GenerateTodoFormProps) {
  const [topic, setTopic] = useState("");
  const [numberTodos, setNumberTodos] = useState("");
  const [loading, setLoading] = useState(false);
  const createTodo = useMutation(api.functions.createTodo);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/createTodo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, numberTodos: parseInt(numberTodos, 10) }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate todos");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to read the response body");
      }
      const decoder = new TextDecoder();
      let allText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        allText += decoder.decode(value, { stream: true });
      }

      const result = JSON.parse(allText);

      for (const todo of result.todos) {
        const { title, description, dueDate, expectedTime } = todo;
        await createTodo({
          title: title.toString(),
          description: description.toString(),
          listId,
          dueDate: dueDate.toString(),
          expectedTime: expectedTime.toString(),
        });
      }

      onSuccess();
      setTopic("");
      setNumberTodos("");
    } catch (err) {
      alert("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
      setTopic("");
      setNumberTodos("");
    }
  };

  const isDisabled =
    !topic.trim() || !numberTodos.trim() || isNaN(Number(numberTodos));

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
        Generate To-Dos
      </Typography>
      <Box className="flex flex-col gap-2">
        <TextField
          label="Topic"
          variant="outlined"
          fullWidth
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic for the to-dos"
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
          label="Number of To-Dos"
          variant="outlined"
          fullWidth
          value={numberTodos}
          type="number"
          onChange={(e) => setNumberTodos(e.target.value)}
          placeholder="Enter the number of to-dos to generate"
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
          disabled={isDisabled || loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Generate To-Dos"
          )}
        </Button>
      </Box>
    </Box>
  );
}
