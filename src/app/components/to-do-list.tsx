import React, { useState } from "react";
import {
  Checkbox,
  Typography,
  Card,
  Box,
  CardContent,
  Tooltip,
  IconButton,
} from "@mui/material";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { useUser } from "@clerk/nextjs";
import { EditTodoModal } from "./Modals/EditToDoModal";

interface TodoListProps {
  listId: Id<"lists">;
}

interface TodoItemProps {
  todo: {
    _id: Id<"todos">;
    title: string;
    description: string;
    completed: boolean;
    dueDate: string;
    expectedTime: string;
  };
  listId: Id<"lists">;
}

export function TodoList({ listId }: TodoListProps) {
  const todos = useQuery(api.functions.listTodos, { listId });

  const sortedTodos = todos?.sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="pb-[3vh]">
      <ul className="space-y-4">
        {sortedTodos?.map((todo) => (
          <TodoItem todo={todo} listId={listId} key={todo?._id} />
        ))}
      </ul>
    </div>
  );
}

function TodoItem({ todo, listId }: TodoItemProps) {
  const markCompleted = useMutation(api.functions.updateTodoCompletionStatus);
  const deleteTodo = useMutation(api.functions.deleteTodo);
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const list = useQuery(api.functions.getListById, {
    id: listId as Id<"lists">,
  });
  const isEditor = list?.participants.some(
    (participant) =>
      participant.userId === user?.id && participant.role === "editor"
  );

  const handleComplete = async () => {
    try {
      await markCompleted({ id: todo._id, completed: !todo.completed });
    } catch (error) {
      console.error("Error marking todo as completed:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTodo({ id: todo._id });
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const formatDate = (date: string): string => {
    const [year, month, day] = date.split("-");
    return `Due Date: ${month}/${day}/${year}`;
  };

  const isOverdue = new Date(todo.dueDate) < new Date();
  return (
    <>
      <Card
        className="shadow-lg rounded-xl overflow-hidden"
        sx={{
          background: "linear-gradient(135deg, #f3f4f6, #e2e8f0)",
          border: "1px solid #e0e0e0",
          marginTop: "2rem",
          transition: "transform 0.2s",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <CardContent className="flex justify-between items-center p-4">
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#1f2937",
                fontFamily: "Roboto, sans-serif",
                letterSpacing: "0.5px",
                textTransform: "capitalize",
                mb: 0.5,
              }}
            >
              {todo.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#4b5563",
                fontSize: "0.875rem",
                maxWidth: "15rem",
                wordWrap: "break-word",
              }}
            >
              {todo.description}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: isOverdue ? "red" : "#6b7280", fontSize: "0.75rem" }}
            >
              {formatDate(todo.dueDate)}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#6b7280", fontSize: "0.75rem" }}
            >
              Expected Time: {todo.expectedTime} Hours
            </Typography>
          </Box>
          <div className="flex items-center gap-2">
            <Tooltip title="Mark as Completed">
              <Checkbox
                checked={todo.completed}
                onChange={isEditor ? handleComplete : undefined}
                aria-label="Mark as Completed"
                color={todo.completed ? "success" : "default"}
                disabled={!isEditor}
              />
            </Tooltip>
            {isEditor && (
              <>
                <Tooltip title="Edit Todo">
                  <IconButton
                    color="secondary"
                    aria-label="Edit Todo"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Todo">
                  <IconButton
                    color="error"
                    aria-label="Delete Todo"
                    onClick={handleDelete}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      <EditTodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        todo={todo}
      />
    </>
  );
}
