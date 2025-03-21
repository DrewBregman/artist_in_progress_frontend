import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  Grid,
  Paper,
  Snackbar,
  ThemeProvider,
  Typography,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Alert
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { UploadFile, UploadFileOutlined, Info } from "@mui/icons-material";

// Create a minimal dark theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0A0A0A',
      paper: '#141414'
    },
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1D4ED8'
    },
    secondary: {
      main: '#10B981'
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)'
    },
    divider: 'rgba(255, 255, 255, 0.1)'
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6
    },
    button: {
      textTransform: 'none',
      fontWeight: 500
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '4px',
            height: '4px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255, 255, 255, 0.3)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 16px',
          fontWeight: 500,
          textTransform: 'none'
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        },
        outlined: {
          borderWidth: '1px'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0A0A0A',
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          padding: '0 16px'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#141414',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  }
});

// Helper function to call /ask-image API
async function analyzeArtwork(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("top_k", 3);
  formData.append("threshold", 0.2);
  formData.append("use_gpt_summary", true);

  try {
    console.log(`Analyzing artwork: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    
    const response = await fetch("http://localhost:8000/ask-image", {
      method: "POST",
      body: formData
    });
    
    if (!response.ok) {
      const errMsg = await response.text();
      throw new Error(`Error: ${response.status} - ${errMsg}`);
    }
    
    const data = await response.json();
    console.log("Analysis complete:", Object.keys(data));
    return data;
  } catch (err) {
    console.error("Analysis error:", err);
    throw err;
  }
}

// Function to format the results from backend
function formatResults(results) {
  if (!results) return null;
  
  // Format text with minimal styling
  const formatText = (text) => {
    if (!text) return null;
    
    const paragraphs = text.split('\n').filter(line => line.trim() !== '');
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a bullet point list item
      const isBulletPoint = paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•');
      // Check if it's a numbered list item
      const isNumberedItem = /^\d+\.\s/.test(paragraph.trim());
      // Check if it's a heading (looks like a heading if it's short and doesn't end with punctuation)
      const mightBeHeading = paragraph.length < 50 && !paragraph.match(/[.,:;]$/);
      
      // Clean up bullet points
      let content = paragraph;
      if (isBulletPoint) {
        content = paragraph.trim().replace(/^-\s*/, '• '); // Replace hyphens with bullets
      }
      
      // Apply different styling based on content type
      if (isBulletPoint || isNumberedItem) {
        return (
          <Box 
            key={index} 
            sx={{ 
              display: 'flex',
              mb: 1.5,
              pl: 1,
              opacity: 0,
              animation: 'fadeIn 0.5s forwards',
              animationDelay: `${index * 0.05}s`,
            }}
          >
            {isBulletPoint && (
              <Typography 
                component="span" 
                sx={{ 
                  color: 'primary.main',
                  pr: 1.5,
                  fontWeight: 500,
                  fontSize: '1rem',
                  lineHeight: 1.6,
                }}
              >
                •
              </Typography>
            )}
            <Typography 
              variant="body1"
              sx={{ 
                color: 'text.secondary',
                mb: 0.5
              }}
            >
              {isBulletPoint ? content.substring(1).trim() : content}
            </Typography>
          </Box>
        );
      } else if (mightBeHeading && index > 0) {
        // Style as a subheading
        return (
          <Typography 
            key={index} 
            variant="h5" 
            sx={{ 
              mt: 3,
              mb: 2,
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '1rem',
              opacity: 0,
              animation: 'fadeIn 0.5s forwards',
              animationDelay: `${index * 0.05}s`,
            }}
          >
            {content}
          </Typography>
        );
      } else {
        // Regular paragraph
        return (
          <Typography 
            key={index} 
            variant="body1" 
            paragraph 
            sx={{ 
              mb: 2,
              color: index === 0 ? 'text.primary' : 'text.secondary',
              fontWeight: index === 0 ? 500 : 400,
              opacity: 0,
              animation: 'fadeIn 0.5s forwards',
              animationDelay: `${index * 0.05}s`,
            }}
          >
            {content}
          </Typography>
        );
      }
    });
  };
  
  // Get artist name directly from the API response
  const artistName = results.top_artist_name;
  
  return (
    <>
      {/* Artist Name Header */}
      {artistName && (
        <Paper
          elevation={0}
          sx={{ 
            mb: 3,
            p: 3,
            borderLeft: '3px solid',
            borderColor: 'primary.main',
            backgroundColor: 'background.paper',
          }}
        >
          <Typography 
            variant="overline" 
            sx={{ 
              color: 'text.secondary',
              letterSpacing: 1,
              fontWeight: 500
            }}
          >
            Artist Match
          </Typography>
          
          <Typography 
            variant="h2" 
            sx={{ 
              mb: 1,
              color: 'text.primary',
              fontWeight: 600
            }}
          >
            {artistName}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary'
            }}
          >
            Your artwork shares similarities with this established artist's style and techniques
          </Typography>
        </Paper>
      )}
      
      {/* Artist Journey Section */}
      {results.most_similar_artist_journey_outline && (
        <Paper 
          elevation={0}
          sx={{ 
            mb: 3,
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.primary',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              Artist Journey
            </Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            {formatText(results.most_similar_artist_journey_outline)}
          </Box>
        </Paper>
      )}
      
      {/* Feedback & Tips Section */}
      {results.artwork_feedback_and_tips && (
        <Paper 
          elevation={0}
          sx={{ 
            mb: 3,
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.primary',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              Feedback & Tips
            </Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            {formatText(results.artwork_feedback_and_tips)}
          </Box>
        </Paper>
      )}
      
      {/* Recommended Next Steps Section */}
      {results.recommended_next_steps && (
        <Paper 
          elevation={0}
          sx={{ 
            mb: 3,
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.primary',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              Recommended Next Steps
            </Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            {formatText(results.recommended_next_steps)}
          </Box>
        </Paper>
      )}
      
      {/* Optional data points attribution */}
      {results.chunks_used && (
        <Box 
          sx={{ 
            mt: 3,
            textAlign: 'center',
            color: 'text.secondary',
            fontSize: '0.75rem',
            opacity: 0.7
          }}
        >
          <Typography variant="caption">
            Analysis based on {results.chunks_used} data points
          </Typography>
        </Box>
      )}
    </>
  );
}

function App() {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    processFile(selectedFile);
  };

  // Reset state
  const handleReset = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setFile(null);
    setFilePreview(null);
    setResults(null);
  };

  // Process the selected file
  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    
    if (selectedFile.type.startsWith('image/')) {
      // Clean up previous preview URL
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
      
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
      setResults(null);
    } else {
      setError("Please upload an image file (.jpg, .png, etc)");
      setAlertOpen(true);
    }
  };

  // Set up drag and drop
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!dropZone.contains(e.relatedTarget)) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    };

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragenter', handleDragEnter);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragenter', handleDragEnter);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, [filePreview]);

  // Handle artwork analysis
  const handleAnalyzeArt = async () => {
    if (!file) {
      setError("Please upload an image first");
      setAlertOpen(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const data = await analyzeArtwork(file);
      setResults(data);
    } catch (err) {
      setError(err.message || "An error occurred during analysis");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to protect content requiring authentication
  const renderProtectedContent = () => {
    return (
      <SignedIn>
        <Grid container spacing={3}>
          {/* Upload section */}
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={0} 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    mb: 1
                  }}
                >
                  Upload Artwork
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                >
                  Upload an image of your artwork to analyze
                </Typography>
              </Box>
              
              {/* Upload area */}
              <Box sx={{ 
                p: 3,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                {!filePreview ? (
                  <Paper
                    ref={dropZoneRef}
                    onClick={() => fileInputRef.current?.click()}
                    elevation={0}
                    sx={{
                      p: 3,
                      flexGrow: 1,
                      minHeight: 200,
                      bgcolor: isDragging ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                      borderRadius: 1,
                      borderColor: isDragging ? 'primary.main' : 'divider',
                      borderWidth: 1,
                      borderStyle: 'dashed',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    
                    <UploadFileOutlined 
                      sx={{ 
                        fontSize: 40, 
                        mb: 2, 
                        color: isDragging ? 'primary.main' : 'text.secondary',
                        opacity: isDragging ? 1 : 0.7
                      }} 
                    />
                    
                    <Typography 
                      variant={isMobile ? "body1" : "h5"}
                      sx={{ 
                        mb: 1,
                        fontWeight: 500,
                        color: isDragging ? 'primary.main' : 'text.primary'
                      }}
                    >
                      {isDragging ? "Drop to upload" : "Drag file here or click to browse"}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                    >
                      Supports JPG, PNG, WEBP (max 10MB)
                    </Typography>
                  </Paper>
                ) : (
                  <Box sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2
                    }}>
                      <Typography variant="h5" color="text.primary">
                        Image Preview
                      </Typography>
                      
                      <Button 
                        variant="text" 
                        color="primary" 
                        size="small"
                        onClick={handleReset}
                      >
                        Clear
                      </Button>
                    </Box>
                    
                    <Box
                      sx={{
                        flexGrow: 1,
                        minHeight: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <Box 
                        component="img" 
                        src={filePreview} 
                        alt="Artwork preview" 
                        sx={{ 
                          maxWidth: '100%', 
                          maxHeight: 300,
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
              
              {/* Action button */}
              <Box sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading || !file}
                  onClick={handleAnalyzeArt}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{ 
                    py: 1.5
                  }}
                >
                  {loading ? "Analyzing..." : "Analyze Artwork"}
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Results section */}
          <Grid item xs={12} md={7}>
            <Paper 
              elevation={0} 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    mb: 1
                  }}
                >
                  {results ? "Analysis Results" : "How It Works"}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                >
                  {results ? "AI-generated insights about your artwork" : "Upload your artwork to get started"}
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 3,
                flexGrow: 1,
                overflow: 'auto'
              }}>
                {!results ? (
                  <Box>
                    <Typography variant="body1" paragraph>
                      Our AI system analyzes your artwork by:
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', mb: 1 }}>
                        <Typography component="span" sx={{ pr: 1.5, color: 'primary.main' }}>•</Typography>
                        <Typography variant="body1" color="text.secondary">Comparing composition and structure</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', mb: 1 }}>
                        <Typography component="span" sx={{ pr: 1.5, color: 'primary.main' }}>•</Typography>
                        <Typography variant="body1" color="text.secondary">Identifying color palette and use of light</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', mb: 1 }}>
                        <Typography component="span" sx={{ pr: 1.5, color: 'primary.main' }}>•</Typography>
                        <Typography variant="body1" color="text.secondary">Detecting brush techniques and textures</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', mb: 1 }}>
                        <Typography component="span" sx={{ pr: 1.5, color: 'primary.main' }}>•</Typography>
                        <Typography variant="body1" color="text.secondary">Recognizing subject matter and style</Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body1" color="text.secondary" paragraph>
                      The system then identifies the most similar artist in our database and provides insights about your work.
                    </Typography>
                    
                    <Box sx={{ 
                      mt: 4, 
                      p: 2, 
                      bgcolor: 'rgba(37, 99, 235, 0.05)',
                      border: '1px solid rgba(37, 99, 235, 0.1)',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5
                    }}>
                      <Info fontSize="small" color="primary" sx={{ mt: 0.2 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                          Tips for best results:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Use a clear, well-lit photo of your artwork without frames or glare, and ensure the entire piece is visible.
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box 
                    sx={{ 
                      maxHeight: '650px', 
                      overflowY: 'auto',
                      pr: 1
                    }}
                  >
                    {formatResults(results)}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </SignedIn>
    );
  };

  // Handle alert close
  const handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setAlertOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* App Bar with authentication */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            ArtAnalyze
          </Typography>
          <Box>
            <SignedOut>
              <SignInButton>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          pt: { xs: 3, sm: 4, md: 5 },
          pb: { xs: 5, sm: 6, md: 8 }
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: { xs: 4, sm: 5 }, textAlign: 'center' }}>
            <Typography 
              variant="h1" 
              color="text.primary"
              sx={{ 
                mb: 1.5
              }}
            >
              Analyze Your Artwork
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                maxWidth: 600, 
                mx: 'auto'
              }}
            >
              Discover which artists have influenced your style and receive personalized insights about your work
            </Typography>
          </Box>
          
          {/* Main content - conditionally rendered */}
          <SignedIn>
            {renderProtectedContent()}
          </SignedIn>
          
          <SignedOut>
            <Paper
              elevation={0}
              sx={{
                textAlign: 'center',
                py: 6,
                px: { xs: 3, sm: 6 },
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              <Typography variant="h2" sx={{ mb: 2 }}>
                Sign In to Continue
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Our AI-powered tool helps you discover artistic influences in your work. Sign in to analyze your artwork.
              </Typography>
              
              <SignInButton>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="large"
                  sx={{ minWidth: 180 }}
                >
                  Sign In
                </Button>
              </SignInButton>
            </Paper>
          </SignedOut>
          
          {/* Footer */}
          <Box sx={{ 
            mt: 6, 
            textAlign: 'center' 
          }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} ArtAnalyze • AI-Powered Artwork Analysis
            </Typography>
          </Box>
        </Container>
      </Box>
      
      {/* Error message */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={5000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;