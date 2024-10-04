import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Fab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  IconButton,
  TextField,
  Button,
  Typography,
  Paper,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../../convex/_generated/dataModel";
import { Save as SaveIcon } from "@mui/icons-material";
import { Clear as ClearIcon } from "@mui/icons-material";

interface ChatWidgetProps {
  list: {
    _id: Id<"lists">;
    participants: {
      userId: string;
      email: string;
      role: "editor" | "viewer";
    }[];
  };
}

const keyframes = `
@keyframes slideInUp {
  0% {
    transform: translateY(100%);
    opacity: 0;
    visibility: hidden;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
}

@keyframes slideOutDown {
  0% {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
    visibility: hidden;
  }
}
`;

export const ChatWidget = ({ list }: ChatWidgetProps) => {
  const [open, setOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const { user } = useUser();
  const [selectedMessage, setSelectedMessage] = useState<{
    id: string;
    text: string;
    attachmentUrl?: string;
  } | null>(null);
  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [editedMessage, setEditedMessage] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const messages = useQuery(api.functions.listMessages, { listId: list._id });
  const sendMessage = useMutation(api.functions.sendMessage);
  const updateMessage = useMutation(api.functions.updateMessage);
  const deleteMessage = useMutation(api.functions.deleteMessage);
  const uploadFile = useAction(api.functions.uploadFileToS3);
  const deleteFileFromS3 = useAction(api.functions.deleteFileFromS3);

  const lastMessageIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleToggleChat = () => {
    setOpen(!open);
    if (!open) {
      setHasNewMessage(false);
      if (messages && messages.length > 0) {
        lastMessageIdRef.current = messages[messages.length - 1]._id;
        localStorage.setItem(
          `lastMessageId_${list._id}`,
          messages[messages.length - 1]._id
        );
      }
    }
  };

  const handleCloseChat = () => {
    setOpen(false);
    if (messages && messages.length > 0) {
      lastMessageIdRef.current = messages[messages.length - 1]._id;
      localStorage.setItem(
        `lastMessageId_${list._id}`,
        messages[messages.length - 1]._id
      );
    }
  };

  const handlePDFLoad = () => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      if (selectedFile && selectedFile.type === "application/pdf") {
        setLoading(true);
      }
      setFile(event.target.files[0]);
      event.target.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() || file) {
      try {
        setIsUploading(true);
        let attachmentUrl = "";

        if (file) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            if (e.target && e.target.result) {
              const base64Data = e.target.result.toString().split(",")[1];
              attachmentUrl = await uploadFile({
                file: base64Data,
                fileName: file.name,
                contentType: file.type,
              });

              const response = await sendMessage({
                listId: list._id,
                message: newMessage,
                attachmentUrl,
              });

              setNewMessage("");
              setFile(null);
              setHasNewMessage(false);
              if (response) {
                localStorage.setItem(`lastMessageId_${list._id}`, response);
              }
            }
          };
          reader.readAsDataURL(file);
        } else {
          const response = await sendMessage({
            listId: list._id,
            message: newMessage,
          });

          setNewMessage("");
          setHasNewMessage(false);
          if (response) {
            localStorage.setItem(`lastMessageId_${list._id}`, response);
          }
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  useEffect(() => {
    const handleMessageCheck = () => {
      const savedLastMessageId = localStorage.getItem(
        `lastMessageId_${list._id}`
      );
      if (savedLastMessageId) {
        lastMessageIdRef.current = savedLastMessageId;
      }

      if (messages && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];

        if (lastMessage?._id !== lastMessageIdRef?.current && !open) {
          setHasNewMessage(true);
          lastMessageIdRef.current = lastMessage._id;
        } else {
          setHasNewMessage(false);
          lastMessageIdRef.current = lastMessage._id;
        }
      }
    };

    const timeoutId = setTimeout(handleMessageCheck, 1000);

    return () => clearTimeout(timeoutId);
  }, [messages, list._id, open]);

  useEffect(() => {
    if (messages && open) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [messages, open]);

  const getParticipantEmail = (userId: string) => {
    const participant = list.participants.find(
      (participant) => participant.userId === userId
    );
    return participant?.email || "Unknown";
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);

    const formatter = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      year: "2-digit",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    return formatter.format(date);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLDivElement>,
    messageId: string,
    messageText: string,
    messageUrl: string
  ) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setSelectedMessage({
      id: messageId,
      text: messageText,
      attachmentUrl: messageUrl,
    });
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleEditMessage = () => {
    if (selectedMessage) {
      setEditMessageId(selectedMessage.id);
      setEditedMessage(selectedMessage.text);
    }
    handleCloseMenu();
  };

  const handleDeleteMessage = async () => {
    if (selectedMessage) {
      try {
        const messageId = selectedMessage.id;

        if (typeof messageId !== "string") {
          console.error("Invalid message ID: ", messageId);
          return; // Exit the function early
        }

        // Call deleteMessage with a guaranteed string
        await deleteMessage({
          messageId: messageId as Id<"messages">,
        });

        
        const attachmentUrl = selectedMessage?.attachmentUrl;

        if (attachmentUrl) {
          const urlParts = attachmentUrl.split("/");
          const fileName = urlParts[urlParts.length - 1];

          await deleteFileFromS3({
            fileName,
          });
        } else {
          console.log("No attachment URL to delete from S3.");
        }

        if (
          messages &&
          messages.length > 2 &&
          messages[messages.length - 1]?._id === selectedMessage?.id
        ) {
          localStorage.setItem(
            `lastMessageId_${list._id}`,
            messages[messages.length - 2]._id
          );
        }
      } catch (error) {
        console.error("Failed to delete message or file from S3:", error);
      }
    }
    handleCloseMenu();
  };

  const handleSaveEdit = async () => {
    if (editMessageId) {
      try {
        await updateMessage({
          messageId: editMessageId as Id<"messages">,
          message: editedMessage,
        });
        setEditMessageId(null);
        setEditedMessage("");
      } catch (error) {
        console.error("Failed to update message:", error);
      }
    }
  };
  const getFileType = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(extension || "")) {
      return "image";
    } else if (["pdf"].includes(extension || "")) {
      return "pdf";
    }
    return null;
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Fab onClick={handleToggleChat} color="primary" aria-label="chat">
        <Badge color="error" variant="dot" invisible={!hasNewMessage}>
          <ChatIcon />
        </Badge>
      </Fab>

      <style>{keyframes}</style>

      <Dialog
        open={open}
        onClose={handleCloseChat}
        PaperProps={{
          sx: {
            position: "fixed",
            bottom: 0,
            right: 0,
            m: 0,
            width: "100%",
            maxWidth: "400px",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            animation: open
              ? "slideInUp 0.5s ease-out forwards"
              : "slideOutDown 0.8s ease-in forwards",
            transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
          }}
        >
          <Typography sx={{ fontSize: "1.5rem" }}>Messages</Typography>
          <IconButton edge="end" color="inherit" onClick={handleCloseChat}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, display: "flex", flexDirection: "column" }}>
          <Box
            sx={{ flexGrow: 1, maxHeight: "300px", overflowY: "auto", mb: 2 }}
          >
            {messages && messages.length > 0 ? (
              messages.map((msg, idx) => {
                const isCurrentUser = msg.senderId === user?.id;
                const senderEmail = getParticipantEmail(msg.senderId);
                const timestamp = formatTimestamp(msg.timestamp);
                return (
                  <Box
                    key={idx}
                    sx={{
                      mb: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isCurrentUser ? "flex-end" : "flex-start",
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        backgroundColor: isCurrentUser ? "#1976d2" : "#e3f2fd",
                        color: isCurrentUser ? "white" : "black",
                        maxWidth: "80%",
                        wordBreak: "break-word",
                        position: "relative",
                        zIndex: 10,
                      }}
                      onContextMenu={(e) => {
                        if (isCurrentUser) {
                          handleOpenMenu(
                            e,
                            msg._id,
                            msg.message,
                            msg?.attachmentUrl || ""
                          );
                        }
                      }}
                    >
                      {editMessageId === msg._id ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <TextField
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                            fullWidth
                            variant="outlined"
                            autoFocus
                            multiline
                            InputProps={{
                              sx: {
                                color: "white",
                                borderRadius: "4px",
                              },
                            }}
                          />
                          <Button
                            onClick={handleSaveEdit}
                            variant="contained"
                            startIcon={<SaveIcon />}
                            sx={{
                              backgroundColor: "#1976d2",
                              color: "white",
                              p: "8px 16px",
                              borderRadius: "8px",
                              "&:hover": {
                                backgroundColor: "#1565c0",
                              },
                              "& .MuiButton-startIcon": {
                                color: "white",
                                fontSize: "20px",
                              },
                              textTransform: "none",
                              boxShadow: "none",
                            }}
                          ></Button>
                        </Box>
                      ) : (
                        <>
                          <Typography variant="body2">{msg.message}</Typography>
                          {msg.attachmentUrl && (
                            <Box sx={{ mt: 1 }}>
                              {getFileType(msg.attachmentUrl) === "image" ? (
                                <img
                                  src={msg.attachmentUrl}
                                  alt="Attachment Preview"
                                  style={{
                                    maxWidth: "100%",
                                    borderRadius: "8px",
                                    cursor: "pointer", // Change cursor to pointer for better UX
                                  }}
                                  onClick={() =>
                                    window.open(msg.attachmentUrl, "_blank")
                                  }
                                />
                              ) : getFileType(msg.attachmentUrl) === "pdf" ? (
                                <>
                                  <Box
                                    onClick={() =>
                                      window.open(msg.attachmentUrl, "_blank")
                                    }
                                    style={{
                                      width: "100%",
                                      height: "200px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <iframe
                                      src={msg.attachmentUrl}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        border: "none",
                                      }}
                                      title="PDF Preview"
                                    />
                                  </Box>
                                  <Typography
                                    onClick={() =>
                                      window.open(msg.attachmentUrl, "_blank")
                                    }
                                    style={{
                                      cursor: "pointer",
                                      color: "white",
                                      textDecoration: "underline",
                                      textAlign: "center",
                                    }}
                                  >
                                    View PDF
                                  </Typography>
                                </>
                              ) : (
                                <Typography
                                  onClick={() =>
                                    window.open(msg.attachmentUrl, "_blank")
                                  }
                                  sx={{
                                    cursor: "pointer",
                                    color: "#ADD8E6",
                                    textDecoration: "underline",
                                    fontWeight: "bold",
                                    fontSize: ".85rem",
                                    display: "inline",
                                    wordBreak: "break-all",
                                    transition: "color 0.3s ease",
                                    "&:hover": {
                                      color: "#87CEFA",
                                    },
                                  }}
                                >
                                  {msg.attachmentUrl}
                                </Typography>
                              )}
                            </Box>
                          )}

                          <Typography
                            variant="caption"
                            sx={{
                              mt: 1,
                              display: "block",
                              textAlign: "right",
                              color: isCurrentUser ? "lightgrey" : "grey",
                            }}
                          >
                            {senderEmail.split("@")[0]} - {timestamp}
                          </Typography>
                        </>
                      )}
                    </Paper>
                  </Box>
                );
              })
            ) : (
              <Typography>No messages yet</Typography>
            )}
            <div ref={messagesEndRef} />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              mb: 2,
              position: "relative",
              alignItems: "center",
            }}
          >
            {file && (
              <Box
                sx={{
                  marginBottom: 1,
                  position: "relative",
                  width: "100%",
                  maxWidth: "20rem",
                }}
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="File preview"
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "4px",
                    }}
                  />
                ) : file.type === "application/pdf" ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    {loading && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "200px",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    )}

                    <iframe
                      src={URL.createObjectURL(file)}
                      width="100%"
                      height="200px"
                      onLoad={handlePDFLoad}
                      style={{ border: "none" }}
                    />
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ flexGrow: 1 }}
                  >
                    Attached file: {file.name}
                  </Typography>
                )}
                <IconButton
                  onClick={() => setFile(null)}
                  color="secondary"
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                  }}
                  title="Remove attachment"
                >
                  <ClearIcon />
                </IconButton>
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                position: "relative",
                width: "100%",
              }}
            >
              <TextField
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                variant="outlined"
                placeholder="Type a message..."
                fullWidth
                multiline
                maxRows={4}
                sx={{
                  mr: 1,
                  paddingTop: file ? ".2rem" : "0",
                }}
              />

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <IconButton
                onClick={() => fileInputRef.current?.click()}
                color="primary"
                sx={{ marginTop: 1 }}
                title="Attach file"
              >
                <AttachFileIcon />
              </IconButton>
            </Box>
          </Box>

          <Button
            onClick={handleSendMessage}
            variant="contained"
            disabled={isUploading}
            sx={{ position: "relative" }}
          >
            {isUploading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Send"
            )}
          </Button>
        </DialogContent>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "12px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            minWidth: "150px",
          },
          "& .MuiMenuItem-root": {
            fontSize: "0.875rem",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
          },
          "& .MuiDivider-root": {
            backgroundColor: "#e0e0e0",
          },
        }}
      >
        <MenuItem onClick={handleEditMessage}>Edit</MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteMessage}>Delete</MenuItem>
      </Menu>
    </Box>
  );
};
