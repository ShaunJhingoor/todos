import { useState, useEffect, useRef } from 'react';
import { Box, Fab, Badge, Dialog, DialogTitle, DialogContent, IconButton, TextField, Button, Typography, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import { useMutation, useQuery } from "convex/react";
import { api } from '../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Id } from '../../../convex/_generated/dataModel';

interface ChatWidgetProps {
  list: {
    _id: Id<"lists">;
    participants: { userId: string; email: string; role: "editor" | "viewer" }[];
  };
}

const keyframes = `
@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideOutDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}
`;

export const ChatWidget = ({ list }: ChatWidgetProps) => {
  const [open, setOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const { user } = useUser();
  
  const messages = useQuery(api.functions.listMessages, { listId: list._id });
  const sendMessage = useMutation(api.functions.sendMessage);

  const lastMessageIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null); 

  const handleToggleChat = () => {
    setOpen(!open);
    if (!open) {
      setHasNewMessage(false);
      if (messages && messages.length > 0) {
        lastMessageIdRef.current = messages[messages.length - 1]._id;
      }
    }
  };

  const handleCloseChat = () => {
    setOpen(false);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const response = await sendMessage({ listId: list._id, message: newMessage });
 
        setNewMessage('');
        setHasNewMessage(false); 
        if (response) {
            localStorage.setItem(`lastMessageId_${list._id}`, response);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  useEffect(() => {
    const savedLastMessageId = localStorage.getItem(`lastMessageId_${list._id}`);
    if (savedLastMessageId) {
      lastMessageIdRef.current = savedLastMessageId;
    }

    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
     
      if (lastMessage?._id != lastMessageIdRef?.current) {
        setHasNewMessage(true);
        lastMessageIdRef.current = messages[messages.length - 1]._id;
      }else{
        setHasNewMessage(false);
      }
    }
  }, [messages]);

 


  useEffect(() => {
    if (messages && open) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [messages, open]); 
  

  const getParticipantEmail = (userId: string) => {
    const participant = list.participants.find(participant => participant.userId === userId);
    return participant?.email || 'Unknown';
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Fab onClick={handleToggleChat} color="primary" aria-label="chat">
        <Badge color="error" variant="dot" invisible={!hasNewMessage}>
          <ChatIcon />
        </Badge>
      </Fab>

      <style>{keyframes}</style>

      <Dialog open={open} onClose={handleCloseChat} PaperProps={{ 
        sx: { 
           position: 'fixed', 
          bottom: 0, 
          right: 0, 
          m: 0, 
          width: '100%', 
          maxWidth: '400px', 
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          animation: open ? 'slideInUp 1s forwards' : 'slideOutDown 1s forwards',
        } 
      }}>
        <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
          <Typography variant="h6">Messages</Typography>
          <IconButton edge="end" color="inherit" onClick={handleCloseChat}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Box 
            sx={{ flexGrow: 1, maxHeight: '300px', overflowY: 'auto', mb: 2 }}
          >
            {messages && messages.length > 0 ? (
              messages.map((msg, idx) => {
                const isCurrentUser = msg.senderId === user?.id;
                const senderEmail = getParticipantEmail(msg.senderId);
                const timestamp = formatTimestamp(msg.timestamp);

                return (
                  <Box key={idx} sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: isCurrentUser ? 'flex-end' : 'flex-start' }}>
                    <Typography variant="caption" sx={{ color: 'gray', mb: 0.5, fontWeight: 'semi-bold' }}>
                      {senderEmail}
                    </Typography>
                    <Paper
                      elevation={3}
                      sx={{
                        display: 'inline-block',
                        px: 2,
                        py: 1,
                        backgroundColor: isCurrentUser ? '#1976d2' : '#f1f1f1',
                        color: isCurrentUser ? 'white' : 'black',
                        borderRadius: '16px',
                        maxWidth: '70%',
                        textAlign: 'left',
                        mb: 0.5
                      }}
                    >
                      <Typography variant="body1">{msg.message}</Typography>
                    </Paper>
                    <Typography variant="caption" sx={{ color: 'gray', fontSize: '0.75rem' }}>
                      {timestamp}
                    </Typography>
                  </Box>
                );
              })
            ) : (
              <Typography variant="body2" color="textSecondary">No messages yet.</Typography>
            )}
             <div ref={messagesEndRef}></div>
          </Box>
    
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              label="Type your message"
              variant="outlined"
              size="small"
              sx={{ mr: 1, borderRadius: '16px' }}
            />
            <Button onClick={handleSendMessage} variant="contained" color="primary" sx={{ borderRadius: '16px' }}>
              Send
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
