import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Person as PersonIcon, SmartToy as SmartToyIcon } from "@mui/icons-material";

export default function ChatBubble({ role, content }) {
  const isUser = role === "user";
  
  return (
    <Box 
      sx={{ 
        display: "flex", 
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 2
      }}
    >
      {!isUser && (
        <Box 
          sx={{ 
            display: "flex",
            alignItems: "flex-start",
            mr: 1.5,
            mt: 0.5
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "white"
            }}
          >
            <SmartToyIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>
      )}
      
      <Paper
        elevation={0}
        sx={{
          maxWidth: "75%",
          p: 2,
          borderRadius: 1.5,
          bgcolor: isUser ? "rgba(37, 99, 235, 0.05)" : "#141414",
          border: "1px solid",
          borderColor: isUser ? "rgba(37, 99, 235, 0.1)" : "rgba(255, 255, 255, 0.1)"
        }}
      >
        <Typography 
          variant="body1" 
          sx={{ 
            color: "text.primary",
            whiteSpace: "pre-wrap",
            fontSize: "0.875rem"
          }}
        >
          {content}
        </Typography>
      </Paper>
      
      {isUser && (
        <Box 
          sx={{ 
            display: "flex",
            alignItems: "flex-start",
            ml: 1.5,
            mt: 0.5
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: "rgba(37, 99, 235, 0.1)",
              color: "primary.main"
            }}
          >
            <PersonIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>
      )}
    </Box>
  );
}