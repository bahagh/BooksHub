import React from 'react';
import { Box, LinearProgress, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'Contains number', test: (pwd) => /\d/.test(pwd) },
  { label: 'Contains special character (!@#$%^&*)', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) {
    return { score: 0, label: '', color: '#e0e0e0' };
  }

  const metRequirements = requirements.filter((req) => req.test(password)).length;
  const percentage = (metRequirements / requirements.length) * 100;

  if (percentage < 40) {
    return { score: percentage, label: 'Weak', color: '#f44336' };
  } else if (percentage < 60) {
    return { score: percentage, label: 'Fair', color: '#ff9800' };
  } else if (percentage < 80) {
    return { score: percentage, label: 'Good', color: '#ffc107' };
  } else if (percentage < 100) {
    return { score: percentage, label: 'Strong', color: '#8bc34a' };
  } else {
    return { score: 100, label: 'Very Strong', color: '#4caf50' };
  }
};

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRequirements = true,
}) => {
  const strength = calculatePasswordStrength(password);

  return (
    <Box sx={{ mt: 2 }}>
      {password && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flex: 1, mr: 2 }}>
              <LinearProgress
                variant="determinate"
                value={strength.score}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: strength.color,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: strength.color,
                fontWeight: 600,
                minWidth: 90,
              }}
            >
              {strength.label}
            </Typography>
          </Box>
        </>
      )}

      {showRequirements && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Password requirements:
          </Typography>
          <List dense sx={{ py: 0 }}>
            {requirements.map((requirement, index) => {
              const isMet = password ? requirement.test(password) : false;
              return (
                <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {isMet ? (
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#4caf50' }} />
                    ) : (
                      <CancelIcon sx={{ fontSize: 18, color: '#bdbdbd' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={requirement.label}
                    primaryTypographyProps={{
                      variant: 'caption',
                      color: isMet ? 'text.primary' : 'text.secondary',
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </Box>
  );
};

export const isPasswordValid = (password: string): boolean => {
  return requirements.every((req) => req.test(password));
};
