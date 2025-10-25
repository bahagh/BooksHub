import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Switch,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';

const SettingsPage: React.FC = () => {
  const { preferences, updatePreferences } = useNotifications();
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bookUpdates, setBookUpdates] = useState(true);
  const [commentReplies, setCommentReplies] = useState(true);
  const [newFollowers, setNewFollowers] = useState(false);
  const [newRatings, setNewRatings] = useState(true);

  // Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [showEmail, setShowEmail] = useState(false);
  const [showReadingList, setShowReadingList] = useState(true);

  // App Settings
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light');
  const [booksPerPage, setBooksPerPage] = useState('12');

  // Load preferences on mount
  useEffect(() => {
    if (preferences) {
      setEmailNotifications(preferences.emailNotifications);
      setBookUpdates(preferences.emailOnBookUpdate);
      setCommentReplies(preferences.emailOnCommentReply);
      setNewFollowers(preferences.emailOnNewFollower);
      setNewRatings(preferences.emailOnNewRating);
    }
  }, [preferences]);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError('');
      
      await updatePreferences({
        emailNotifications,
        emailOnCommentReply: commentReplies,
        emailOnNewRating: newRatings,
        emailOnBookUpdate: bookUpdates,
        emailOnNewFollower: newFollowers,
        inAppNotifications: true,
        inAppOnCommentReply: true,
        inAppOnNewRating: true,
        inAppOnBookUpdate: true,
        inAppOnNewFollower: true,
      });
      
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion feature coming soon');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings ⚙️
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account preferences and settings
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <NotificationsIcon color="primary" />
                <Typography variant="h6" component="h2">
                  Notifications
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Email Notifications" 
                    secondary="Receive email updates about your account"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Book Updates" 
                    secondary="Get notified about new books and updates"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={bookUpdates}
                      onChange={(e) => setBookUpdates(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Comment Replies" 
                    secondary="Notifications when someone replies to your comments"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={commentReplies}
                      onChange={(e) => setCommentReplies(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="New Ratings" 
                    secondary="Get notified when someone rates your book"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={newRatings}
                      onChange={(e) => setNewRatings(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="New Followers" 
                    secondary="Get notified about new followers"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={newFollowers}
                      onChange={(e) => setNewFollowers(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <SecurityIcon color="primary" />
                <Typography variant="h6" component="h2">
                  Privacy
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Profile Visibility</InputLabel>
                  <Select
                    value={profileVisibility}
                    label="Profile Visibility"
                    onChange={(e) => setProfileVisibility(e.target.value)}
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                    <MenuItem value="friends">Friends Only</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Show Email Address" 
                    secondary="Display your email on your profile"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={showEmail}
                      onChange={(e) => setShowEmail(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Show Reading List" 
                    secondary="Let others see your reading list"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={showReadingList}
                      onChange={(e) => setShowReadingList(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* App Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PaletteIcon color="primary" />
                <Typography variant="h6" component="h2">
                  App Preferences
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={language}
                      label="Language"
                      onChange={(e) => setLanguage(e.target.value)}
                      startAdornment={<LanguageIcon sx={{ mr: 1, color: 'action.active' }} />}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Español</MenuItem>
                      <MenuItem value="fr">Français</MenuItem>
                      <MenuItem value="de">Deutsch</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={theme}
                      label="Theme"
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="auto">Auto</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Books Per Page</InputLabel>
                    <Select
                      value={booksPerPage}
                      label="Books Per Page"
                      onChange={(e) => setBooksPerPage(e.target.value)}
                    >
                      <MenuItem value="8">8 books</MenuItem>
                      <MenuItem value="12">12 books</MenuItem>
                      <MenuItem value="24">24 books</MenuItem>
                      <MenuItem value="48">48 books</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <SecurityIcon color="primary" />
                <Typography variant="h6" component="h2">
                  Account Management
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Manage your account data and preferences
                </Typography>
                
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={() => alert('Export data feature coming soon')}
                >
                  Export My Data
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={() => alert('Download account info feature coming soon')}
                >
                  Download Account Info
                </Button>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Danger Zone
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Once you delete your account, there is no going back. Please be certain.
                </Typography>
                
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => window.location.reload()}
            >
              Reset Changes
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleSaveSettings}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : undefined}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;
