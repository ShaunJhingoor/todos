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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Button,
} from "@mui/material";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { useUser } from "@clerk/nextjs";
import { EditTodoModal } from "./Modals/EditToDoModal";
import GoogleIcon from "@mui/icons-material/Google";

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
    assigneeEmail?: string;
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
        ?.filter(
          (todo) => !todo.dueDate || adjustDueDate(todo.dueDate) >= weekFromNow
        )
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
  const assignTodo = useMutation(api.functions.assignTodo);
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const list = useQuery(api.functions.getListById, {
    id: listId as Id<"lists">,
  });
  const assignedTo = list?.participants.some(
    (participant) =>
      participant.userId === user?.id &&
      participant.role === "editor" &&
      participant.email === todo.assigneeEmail
  );

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

  const handleAssignChange = async (event: SelectChangeEvent<string>) => {
    const assignedTo = event.target.value;
    try {
      await assignTodo({ id: todo._id, assignedTo });
    } catch (error) {
      console.error("Error assigning todo:", error);
    }
  };
  const editorsList = list?.participants.filter(
    (participant) => participant.role === "editor"
  );

  const formatGoogleDateTime = (date: Date) => {
    if (isNaN(date.getTime())) {
      console.error("Invalid date value:", date);
      return "";
    }
    return date.toISOString().replace(/[-:]/g, "").split(".")[0];
  };

  const startDate = todo.dueDate ? new Date(todo.dueDate) : new Date();

  const expectedTimeInHours = parseInt(todo.expectedTime, 10) || 1;
  const endDate = new Date(
    startDate.getTime() + expectedTimeInHours * 60 * 60000
  );

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    todo.title
  )}&dates=${formatGoogleDateTime(startDate)}/${formatGoogleDateTime(
    endDate
  )}&details=${encodeURIComponent(todo.description || "")}`;

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
            {todo.dueDate && (
              <Typography
                variant="body2"
                sx={{
                  color: isOverdue ? "red" : "#6b7280",
                  fontSize: "0.75rem",
                }}
              >
                {formatDate(todo.dueDate)}
              </Typography>
            )}
            {todo.expectedTime && (
              <Typography
                variant="body2"
                sx={{ color: "#6b7280", fontSize: "0.75rem" }}
              >
                Expected Time: {todo.expectedTime} Hours
              </Typography>
            )}
            {isEditor && editorsList && editorsList.length > 1 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <FormControl
                  sx={{
                    marginTop: "1rem",
                    marginRight: ".5rem",
                    width: "10rem",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                >
                  <InputLabel
                    id="assign-select-label"
                    sx={{
                      color: "#374151",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                    }}
                  >
                    Assign To-Do
                  </InputLabel>
                  <Select
                    labelId="assign-select-label"
                    value={todo.assigneeEmail || "Unassigned"}
                    onChange={handleAssignChange}
                    sx={{
                      borderRadius: "8px",
                      color: "#111827",
                      "& .MuiSelect-outlined": {
                        padding: "10px",
                      },
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                        fontSize: ".8rem",
                      },
                      "&:focus": {
                        outline: "none",
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                        },
                      },
                    }}
                  >
                    <MenuItem value="unassigned">
                      <em>Unassigned</em>
                    </MenuItem>
                    {editorsList.map((participant) => (
                      <MenuItem
                        key={participant.userId}
                        value={participant.email}
                        sx={{
                          "&:hover": {
                            backgroundColor: "#e5e7eb",
                          },
                        }}
                      >
                        {participant.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {assignedTo && (
                  <Tooltip title="Add to Google Calendar">
                    <IconButton
                      sx={{
                        marginTop: "1rem",
                        color: "#3b82f6",
                        "&:hover": {
                          color: "#2563eb",
                          backgroundColor: "rgba(59, 130, 247, 0.1)",
                        },
                        padding: "8px",
                      }}
                      href={googleCalendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GoogleIcon sx={{ fontSize: "1.5rem" }} />{" "}
                      {/* Increase icon size */}
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
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
