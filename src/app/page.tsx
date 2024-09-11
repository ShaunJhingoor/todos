"use client";
import { NewToDoForm } from "./components/new-todo-form";
import { ListToDo } from "./components/to-do-list";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { useState } from "react";
import { Container, Box, Typography, Button, Dialog, DialogTitle, DialogContent, IconButton , Fab} from '@mui/material';
import { TaskAlt, Alarm, People } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

export default function Home() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md py-4">
        <Container maxWidth="lg" className="flex items-center justify-between">
          <Typography variant="h4" className="font-semibold">To-Do List</Typography>
          <UserButton />
        </Container>
      </header>

      {/* Authenticated Content */}
      <Authenticated>
        <Container maxWidth="lg" className="py-8">
          <main className="space-y-8">
            
            <Dialog
              open={open}
              onClose={handleClose}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle
               sx={{
                display: 'flex',
                justifyContent: 'center', 
                alignItems: 'center', 
                position: 'relative', 
                fontSize: '1.2rem', 
                fontWeight: 'medium', 
                color: 'primary.main', 
                padding: '16px 24px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
              }}>
                Add New To-Do
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleClose}
                  aria-label="close"
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <NewToDoForm onSuccess={handleClose}/>
              </DialogContent>
            </Dialog>
            <Fab
              color="primary"
              aria-label="add"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
              }}
              onClick={handleClickOpen}
            >
              <AddIcon />
            </Fab>
            <ListToDo />
          </main>
        </Container>
      </Authenticated>


      {/* Unauthenticated Content */}
      <Unauthenticated>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-200 to-blue-400 text-center py-20">
          <Box className="bg-white p-12 rounded-lg shadow-xl max-w-2xl mx-auto transform transition-transform hover:scale-105">
            <Typography variant="h3" className="font-bold mb-4 text-blue-900">
              Welcome to Your To-Do List App
            </Typography>
            <Typography variant="body1" className="text-gray-700 mb-6">
              Stay organized and keep track of your tasks. Sign in to access your personalized to-do list and get started!
            </Typography>
            <div className="space-x-4 mt-[1vh]">
              <SignInButton>
                <Button
                    variant="contained"
                    sx={{
                      bgcolor: '#2196F3', // Blue color for Sign In
                      '&:hover': {
                        bgcolor: '#1976D2', // Darker blue for hover effect
                      },
                    }}
                    className="shadow-lg"
                  >
                    Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#9C27B0', // Purple color for Sign Up
                  '&:hover': {
                    bgcolor: '#7B1FA2', // Darker purple for hover effect
                  },
                }}
                className="shadow-lg"
              >
                Sign Up
              </Button>
            </SignUpButton>
            </div>
          </Box>
        </section>

        {/* Features Section */}
        <section className="bg-gray-100 py-20">
          <Container maxWidth="lg" className="text-center">
            <Typography variant="h4" className="font-semibold mb-8 text-blue-800">
              Why Sign In?
            </Typography>
            <Typography variant="body1" className="text-gray-700 mb-[5vh]">
              By signing in, you gain access to all the features of our to-do list app, including task management, reminders, and real-time collaboration. Your tasks are securely saved and synchronized across all your devices.
            </Typography>
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Box className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-transform">
                <TaskAlt sx={{ fontSize: 60, color: '#3f51b5' }} />
                <Typography variant="h6" className="font-semibold mb-3 text-blue-800">Task Management</Typography>
                <Typography variant="body2" className="text-gray-600">
                  Easily create, edit, and delete tasks with our intuitive interface.
                </Typography>
              </Box>
              <Box className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-transform">
                <Alarm sx={{ fontSize: 60, color: '#f57c00' }} />
                <Typography variant="h6" className="font-semibold mb-3 text-blue-800">Reminders</Typography>
                <Typography variant="body2" className="text-gray-600">
                  Set reminders to stay on top of your deadlines.
                </Typography>
              </Box>
              <Box className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-transform">
                <People sx={{ fontSize: 60, color: '#1976d2' }} />
                <Typography variant="h6" className="font-semibold mb-3 text-blue-800">Collaboration</Typography>
                <Typography variant="body2" className="text-gray-600">
                  Share tasks and collaborate with others in real-time.
                </Typography>
              </Box>
            </Box>
          </Container>
        </section>

        {/* Contact Section */}
        <section className="bg-blue-50 py-20">
          <Container maxWidth="md" className="text-center">
            <Typography variant="h4" className="font-semibold mb-8 text-blue-800">
              Get In Touch
            </Typography>
            <Typography variant="body1" className="text-gray-700 mb-4">
              Have questions or need support? Reach out to us—we’re here to help you make the most of our app.
            </Typography>
            <a
              href="mailto:support@example.com"
              className="text-blue-700 hover:underline text-lg"
            >
              support@example.com
            </a>
          </Container>
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
