import React, { useState, useMemo } from "react";
import {
  Checkbox,
  Typography,
  Card,
  Box,
  CardContent,
  Tooltip,
  IconButton,
  Divider,
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

const adjustDueDate = (dueDate: string) => {
  const today = new Date();
  const localOffset = today.getTimezoneOffset() * 60000;
  const originalDueDate = new Date(new Date(dueDate).getTime() - localOffset);
  const adjustedDueDate = new Date(originalDueDate);
  adjustedDueDate.setDate(adjustedDueDate.getDate() + 1);
  return adjustedDueDate;
};

export function TodoList({ listId }: TodoListProps) {
  const todos = useQuery(api.functions.listTodos, { listId });

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const weekFromNow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 7
  );

  const overdueTodos = useMemo(
    () =>
      todos
        ?.filter((todo) => adjustDueDate(todo.dueDate) < startOfToday)
        .sort(
          (a, b) =>
            adjustDueDate(a.dueDate).getTime() -
            adjustDueDate(b.dueDate).getTime()
        ),
    [todos]
  );
  const dueTodayTodos = useMemo(
    () =>
      todos?.filter(
        (todo) =>
          adjustDueDate(todo.dueDate) >= startOfToday &&
          adjustDueDate(todo.dueDate) <= endOfToday
      ),
    [todos]
  );
  const dueThisWeekTodos = useMemo(
    () =>
      todos
        ?.filter(
          (todo) =>
            adjustDueDate(todo.dueDate) >= endOfToday &&
            adjustDueDate(todo.dueDate) < weekFromNow
        )
        .sort(
          (a, b) =>
            adjustDueDate(a.dueDate).getTime() -
            adjustDueDate(b.dueDate).getTime()
        ),
    [todos]
  );
  const otherTodos = useMemo(
    () =>
      todos
        ?.filter((todo) => adjustDueDate(todo.dueDate) >= weekFromNow)
        .sort(
          (a, b) =>
            adjustDueDate(a.dueDate).getTime() -
            adjustDueDate(b.dueDate).getTime()
        ),
    [todos]
  );

  return (
    <Box className="pb-[3vh] space-y-4">
      {overdueTodos && overdueTodos?.length > 0 && (
        <Card
          variant="outlined"
          sx={{ backgroundColor: "transparent", border: "none" }}
        >
          <CardContent>
            <Typography variant="h5" color="error" gutterBottom>
              Overdue
            </Typography>
            <Divider />
            <Box mt={2}>
              {overdueTodos.map((todo) => (
                <TodoItem key={todo._id} todo={todo} listId={listId} />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
      {dueTodayTodos && dueTodayTodos?.length > 0 && (
        <Card
          variant="outlined"
          sx={{ backgroundColor: "transparent", border: "none" }}
        >
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Due Today
            </Typography>
            <Divider />
            <Box mt={2}>
              {dueTodayTodos.map((todo) => (
                <TodoItem key={todo._id} todo={todo} listId={listId} />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
      {dueThisWeekTodos && dueThisWeekTodos?.length > 0 && (
        <Card
          variant="outlined"
          sx={{ backgroundColor: "transparent", border: "none" }}
        >
          <CardContent>
            <Typography variant="h5" color="success.main" gutterBottom>
              Due This Week
            </Typography>
            <Divider />
            <Box mt={2}>
              {dueThisWeekTodos.map((todo) => (
                <TodoItem key={todo._id} todo={todo} listId={listId} />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
      {otherTodos && otherTodos?.length > 0 && (
        <Card
          variant="outlined"
          sx={{ backgroundColor: "transparent", border: "none" }}
        >
          <CardContent>
            <Typography variant="h5" color="textSecondary" gutterBottom>
              Others
            </Typography>
            <Divider />
            <Box mt={2}>
              {otherTodos.map((todo) => (
                <TodoItem key={todo._id} todo={todo} listId={listId} />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

function TodoItem({ todo, listId }: TodoItemProps) {
  const adjustedDueDate = adjustDueDate(todo.dueDate);

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
  const now = new Date();

  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const isOverdue = adjustedDueDate < endOfToday;

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
