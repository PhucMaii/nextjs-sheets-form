import React from 'react';
import {
  Paper,
  Stack,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
} from '@mui/material';
import { theme } from '@/theme';
import { alpha } from '@mui/material/styles';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';

interface InputNameSectionProps {
  name: string;
  setName: (name: string) => void;
}

function InputNameSection({ name, setName }: InputNameSectionProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            <DriveFileRenameOutlineIcon />
          </Avatar>
          <Typography variant="h6" fontWeight={600}>
            Bundle Program Details
          </Typography>
        </Stack>
        <TextField
          fullWidth
          placeholder="Enter bundle program name"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DriveFileRenameOutlineIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Stack>
    </Paper>
  );
}

export default InputNameSection;
