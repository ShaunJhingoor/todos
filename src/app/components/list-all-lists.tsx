import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { AddParticipantModal } from "./Modals/AddParticipantModal";
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, } from "@mui/icons-material";
import { EditListModal } from "./Modals/EditListModal";
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { ExitToApp as LeaveIcon } from "@mui/icons-material";
import ParticipantsPopover from "./ParticipantPopUp";
import { Visibility as VisibilityIcon } from '@mui/icons-material';

interface List {
  _id: Id<"lists">;
  name: string;
  ownerId: string;
  participants: {
    userId: string;
    email: string;
    role: "editor" | "viewer";
  }[];
}

export function ListAllLists() {
  const lists = useQuery(api.functions.listUserLists);
  const deleteList = useMutation(api.functions.deleteList);

  return (
    <ul className="space-y-4">
      {lists?.map((list) => (
        <ListItem key={list._id} list={list} deleteList={deleteList} />
      ))}
    </ul>
  );
}

function ListItem({
  list,
  deleteList,
}: {
  list: List;
  deleteList: (args: { listId: Id<"lists"> }) => void;
}) {
  const { user } = useUser();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const leaveList = useMutation(api.functions.leaveList);

  const handleLeaveList = async () => {
    try {
      await leaveList({ listId: list._id });
    } catch (error) {
      alert("Error leaving the list");
      console.error("Error leaving the list:", error);
    }
  };

  const handlePopoverClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setPopoverOpen(true);
  };

  const handlePopoverClose = () => {
    setPopoverOpen(false);
  };

  const isEditor = list.participants.some(participant => participant.userId === user?.id && participant.role === "editor");

  return (
    <Card 
      className="shadow-lg rounded-xl overflow-hidden"
      sx={{
        background: 'linear-gradient(135deg, #f3f4f6, #e2e8f0)',
        border: '1px solid #e0e0e0',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <CardContent className="flex justify-between items-center p-4">
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography 
            variant="h6" 
            sx={{
              fontWeight: 'bold',
              color: '#1f2937',
              fontFamily: 'Roboto, sans-serif',
              letterSpacing: '0.5px',
              textTransform: 'capitalize',
              mb: 0.5
            }}
          >
            {list.name}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#4b5563', 
              fontSize: '0.875rem' 
            }}
          >
            {list.participants.length} Participants
          </Typography>
        </Box>
        <div className="flex items-center gap-2">
          
          {isEditor && (
            <Tooltip title="View Participants">
              <IconButton
                color="primary"
                onClick={handlePopoverClick}
                aria-label="View Participants"
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          )}
          {user?.id !== list.ownerId && (
            <Tooltip title="Leave List">
              <IconButton
                color="warning"
                onClick={handleLeaveList}
                aria-label="Leave List"
              >
                <LeaveIcon />
              </IconButton>
            </Tooltip>
          )}
          {user?.id === list.ownerId && (
            <>
              <Tooltip title="Add Participant">
                <IconButton
                  color="primary"
                  onClick={() => setModalOpen(true)}
                  aria-label="Add Participant"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit List">
                <IconButton
                  color="secondary"
                  onClick={() => setEditModalOpen(true)}
                  aria-label="Edit List"
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete List">
                <IconButton
                  color="error"
                  onClick={() => deleteList({ listId: list._id })}
                  aria-label="Delete List"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </div>
      </CardContent>
      <ParticipantsPopover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        list={list}      
      />
      {user?.id === list.ownerId && isModalOpen && (
        <AddParticipantModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          listId={list._id}
        />
      )}
      {user?.id === list.ownerId && isEditModalOpen && (
        <EditListModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          list={list}
        />
      )}
    </Card>
  );
}