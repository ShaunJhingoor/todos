"use client";
import { CreateListForm } from "./components/create-list";
import { ListAllLists } from "./components/list-all-lists";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Fab,
} from "@mui/material";
import { TaskAlt, SmartToy, People, ListAlt } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

export default function Home() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-blue-50 to-blue-300 text-gray-900 text-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md py-4">
        <Container maxWidth="lg" className="flex items-center justify-between">
          <Box className="flex items-center">
            <ListAlt sx={{ fontSize: 32, marginRight: 1 }} />{" "}
            {/* Added List Icon */}
            <Typography variant="h4" className="font-semibold">
              To-Do List
            </Typography>
          </Box>
          <UserButton />
        </Container>
      </header>

      {/* Authenticated Content */}
      <Authenticated>
        <Container maxWidth="lg">
          <main className="space-y-8">
            <Dialog
              open={open}
              onClose={handleClose}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: "20px",
                  overflow: "hidden",
                },
              }}
            >
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleClose}
                aria-label="close"
                sx={{
                  position: "absolute",
                  right: 12,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
              <DialogContent
                sx={{
                  padding: "24px",
                  background: "linear-gradient(135deg, #f3f4f6, #e2e8f0)",
                  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
                }}
              >
                <CreateListForm onSuccess={handleClose} />
              </DialogContent>
            </Dialog>
            <Fab
              color="primary"
              aria-label="add"
              sx={{
                position: "fixed",
                bottom: 16,
                right: 16,
              }}
              onClick={handleClickOpen}
            >
              <AddIcon />
            </Fab>
            <ListAllLists />
          </main>
        </Container>
      </Authenticated>

      {/* Unauthenticated Content */}
      <Unauthenticated>
        <section className="bg-gradient-to-br from-blue-300 via-blue-400 to-purple-500 text-center py-24 font-poppins">
          <section className="mb-[11rem] mt-[3rem] text-center p-8">
            <div className="flex items-center justify-center mb-[3rem]">
              <TaskAlt
                sx={{
                  fontSize: 60,
                  color: "#ffffff",
                  animation: "bounce 1s infinite",
                  transition: "color 0.3s ease-in-out",
                  "&:hover": {
                    color: "#FF4081",
                  },
                }}
              />
              <Typography
                variant="h3"
                className="font-bold text-white text-4xl md:text-5xl drop-shadow-lg ml-4"
              >
                Welcome to Your To-Do List App
              </Typography>
            </div>
            <Typography
              variant="body1"
              className="text-gray-200 mb-[4rem] text-center transition-opacity duration-500 hover:opacity-90 text-xl md:text-2xl drop-shadow-md"
            >
              Stay organized and keep track of your tasks.
              <br />
              Sign in to access your personalized to-do list and get started!
            </Typography>
            <div className="flex justify-center space-x-8">
              <SignInButton>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#2196F3",
                    "&:hover": {
                      bgcolor: "#1976D2",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                  className="shadow-lg transform hover:scale-105 hover:-translate-y-1 transition-transform duration-300 text-white py-2 px-6 text-lg rounded-full ring-2 ring-blue-500 ring-opacity-40"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#9C27B0",
                    "&:hover": {
                      bgcolor: "#7B1FA2",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                  className="shadow-lg transform hover:scale-105 hover:-translate-y-1 transition-transform duration-300 text-white py-2 px-6 text-lg rounded-full ring-2 ring-purple-500 ring-opacity-40"
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </section>

          <style jsx>{`
            @keyframes bounce {
              0%,
              20%,
              50%,
              80%,
              100% {
                transform: translateY(0);
              }
              40% {
                transform: translateY(-10px);
              }
              60% {
                transform: translateY(-5px);
              }
            }
          `}</style>

          <section className="py-[11rem]">
            <Container maxWidth="lg" className="text-center">
              <Typography
                variant="h4"
                className="font-bold mb-[3rem] text-white transition-colors duration-300 text-4xl md:text-5xl drop-shadow-lg"
              >
                Why Sign In?
              </Typography>
              <Typography
                variant="body1"
                className="text-gray-200 mb-[4rem] transition-opacity duration-500 hover:opacity-90 text-xl md:text-2xl drop-shadow-md"
              >
                By signing in, you gain access to all the features of our to-do
                list app, including task management, reminders, and real-time
                collaboration.
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  {
                    icon: <TaskAlt sx={{ fontSize: 60, color: "#3f51b5" }} />,
                    title: "Task Management",
                    description:
                      "Easily create, edit, and delete tasks with our intuitive interface.",
                  },
                  {
                    icon: <SmartToy sx={{ fontSize: 60, color: "#f57c00" }} />,
                    title: "AI To-Dos",
                    description:
                      "Generate to-dos for tasks based on any topic using AI. Stay organized and focused on your goals.",
                  },
                  {
                    icon: <People sx={{ fontSize: 60, color: "#1976d2" }} />,
                    title: "Collaboration",
                    description:
                      "Share tasks and collaborate with others in real-time.",
                  },
                ].map((feature, index) => (
                  <Box
                    key={index}
                    className="p-8 rounded-lg shadow-lg bg-white transition-transform transform hover:scale-105 hover:shadow-2xl duration-500 border border-gray-300 hover:border-purple-500"
                  >
                    {feature.icon}
                    <Typography
                      variant="h6"
                      className="font-semibold mb-3 text-blue-800 text-xl drop-shadow-md"
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" className="text-gray-700">
                      {feature.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Container>
          </section>

          <section className="py-[11rem]">
            <Container maxWidth="md" className="text-center">
              <Typography
                variant="h4"
                className="font-bold mb-[3rem] text-white transition-all text-4xl md:text-5xl drop-shadow-lg"
              >
                Get In Touch
              </Typography>
              <Typography
                variant="body1"
                className="text-gray-200 mb-[2rem] text-xl md:text-2xl drop-shadow-md"
              >
                Have questions or need support? Reach out to us, we are here to
                help you make the most of our app.
              </Typography>
              <a
                href="mailto:support@example.com"
                className="inline-block text-white hover:underline text-xl md:text-2xl transition-colors hover:text-purple-300 mb-[1.5rem]"
              >
                support@example.com
              </a>
              <br />
              <a
                href="mailto:support@example.com"
                className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300"
              >
                Contact Support
              </a>
            </Container>
          </section>
        </section>
      </Unauthenticated>

      {/* Auth Loading */}
      <AuthLoading>
        <Box className="flex items-center justify-center h-screen">
          <div className="relative">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        </Box>
      </AuthLoading>
    </div>
  );
}
