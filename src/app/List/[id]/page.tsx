"use client";
import { useParams } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AuthLoading } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { CreateTodoForm } from "@/app/components/new-todo-form";
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { ListAlt } from "@mui/icons-material";
import { TodoList } from "@/app/components/to-do-list";
import { GenerateToDoModal } from "@/app/components/Modals/GenerateToDoModal";
import { ChatWidget } from "@/app/components/Chat-list";
import { Print } from "@mui/icons-material";

const ToDoHome = () => {
  const { id } = useParams();
  const router = useRouter();
  const listId = Array.isArray(id) ? id[0] : id;
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openGenerateModal, setOpenGenerateModal] = useState(false);
  const { user, isLoaded } = useUser();
  const list = useQuery(
    api.functions.getListById,
    isLoaded && user ? { id: listId as Id<"lists"> } : "skip"
  );
  if (isLoaded && !user) {
    router.push("/");
  }
  const handleClickOpenCreate = () => {
    setOpenCreateModal(true);
  };

  const handleClickOpenGenerate = () => {
    setOpenGenerateModal(true);
  };

  const handleCloseCreate = () => {
    setOpenCreateModal(false);
  };

  const handleCloseGenerate = () => {
    setOpenGenerateModal(false);
  };
  const isEditor = list?.participants.some(
    (participant) =>
      participant.userId === user?.id && participant.role === "editor"
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 text-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md py-4">
        <Container maxWidth="lg" className="flex items-center justify-between">
          <Box className="flex items-center">
            <ListAlt sx={{ fontSize: 32, marginRight: 1 }} />
            <Typography
              variant="h4"
              className="font-semibold cursor-pointer"
              onClick={() => {
                router.push(`/`);
              }}
              style={{
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              To-Do List
            </Typography>
          </Box>
          <Box className="flex items-center ">
            <IconButton
              onClick={handlePrint}
              color="inherit"
              aria-label="print"
              className="mr-[1rem]"
            >
              <Print />
            </IconButton>
            <UserButton />
          </Box>
        </Container>
      </header>
      {list && (
        <>
          <div className="mt-[5vh]">
            <h1
              className="text-5xl font-bold text-center text-white uppercase"
              style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)" }}
            >
              {list.name}
            </h1>
          </div>
          <div style={{ maxWidth: "60rem", margin: "0 auto" }}>
            <TodoList listId={list?._id} />
          </div>
          {isEditor && (
            <>
              <Box
                sx={{
                  position: "fixed",
                  bottom: 16,
                  right: 16,
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Fab
                  color="primary"
                  aria-label="add"
                  onClick={handleClickOpenCreate}
                >
                  <AddIcon />
                </Fab>
                <Fab
                  color="secondary"
                  aria-label="generate"
                  onClick={handleClickOpenGenerate}
                >
                  <SmartToyIcon />
                </Fab>
                <ChatWidget list={list} />
              </Box>

              <Dialog
                open={openCreateModal}
                onClose={handleCloseCreate}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    fontSize: "1.2rem",
                    fontWeight: "medium",
                    color: "primary.main",
                    padding: "16px 24px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    background: "linear-gradient(135deg, #f3f4f6, #e2e8f0)",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  Add New Todo
                  <IconButton
                    edge="end"
                    color="inherit"
                    onClick={handleCloseCreate}
                    aria-label="close"
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      color: (theme) => theme.palette.grey[500],
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent
                  sx={{
                    padding: "24px",
                    background: "linear-gradient(135deg, #f3f4f6, #e2e8f0)",
                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <CreateTodoForm
                    listId={listId as Id<"lists">}
                    onSuccess={handleCloseCreate}
                  />
                </DialogContent>
              </Dialog>

              <Dialog
                open={openGenerateModal}
                onClose={handleCloseGenerate}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    fontSize: "1.2rem",
                    fontWeight: "medium",
                    color: "primary.main",
                    padding: "16px 24px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    background: "linear-gradient(135deg, #f3f4f6, #e2e8f0)",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  Generate To-Dos
                  <IconButton
                    edge="end"
                    color="inherit"
                    onClick={handleCloseGenerate}
                    aria-label="close"
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      color: (theme) => theme.palette.grey[500],
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent
                  sx={{
                    padding: "24px",
                    background: "linear-gradient(135deg, #f3f4f6, #e2e8f0)",
                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <GenerateToDoModal
                    listId={listId as Id<"lists">}
                    onSuccess={handleCloseGenerate}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
        </>
      )}

      <AuthLoading>
        <Box className="flex items-center justify-center h-screen">
          <div className="relative">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        </Box>
      </AuthLoading>
    </div>
  );
};

export default ToDoHome;
