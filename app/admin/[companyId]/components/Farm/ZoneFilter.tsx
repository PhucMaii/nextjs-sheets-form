import React from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';

interface Zone {
  zoneId: number;
  name?: string;
}

interface ZoneFilterProps {
  availableZones: Zone[];
  selectedZones: number[];
  onZoneChange: (zoneIds: number[]) => void;
  zones?: any[]; // Optional zones from useHydrawiseAPI for better names
}

export default function ZoneFilter({
  availableZones,
  selectedZones,
  onZoneChange,
  zones,
}: ZoneFilterProps) {
  const theme = useTheme();

  if (availableZones.length === 0) {
    return null;
  }

  const handleZoneToggle = (zoneId: number, checked: boolean) => {
    if (checked) {
      onZoneChange([...selectedZones, zoneId]);
    } else {
      onZoneChange(selectedZones.filter((id) => id !== zoneId));
    }
  };

  const handleClearAll = () => {
    onZoneChange([]);
  };

  const getZoneName = (zoneId: number) => {
    if (zones) {
      const zone = zones.find((z: any) => z.relay_id === zoneId);
      return zone?.name || `Zone ${zoneId}`;
    }
    return (
      availableZones.find((z) => z.zoneId === zoneId)?.name || `Zone ${zoneId}`
    );
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Typography
        variant="subtitle2"
        fontWeight={600}
        sx={{ mb: 1.5, color: theme.palette.text.primary }}
      >
        Filter by Zones
      </Typography>
      <FormGroup
        sx={{
          flexDirection: 'row',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        {availableZones.map((zone) => (
          <FormControlLabel
            key={zone.zoneId}
            control={
              <Checkbox
                size="small"
                checked={selectedZones.includes(zone.zoneId)}
                onChange={(e) =>
                  handleZoneToggle(zone.zoneId, e.target.checked)
                }
                sx={{
                  color: theme.palette.primary.main,
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={
              <Chip
                label={getZoneName(zone.zoneId)}
                size="small"
                sx={{
                  backgroundColor: selectedZones.includes(zone.zoneId)
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.grey[300], 0.3),
                  color: selectedZones.includes(zone.zoneId)
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                  border: selectedZones.includes(zone.zoneId)
                    ? `1px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.grey[300]}`,
                  fontWeight: selectedZones.includes(zone.zoneId) ? 600 : 400,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              />
            }
          />
        ))}
        {selectedZones.length > 0 && (
          <Button
            size="small"
            onClick={handleClearAll}
            sx={{
              minWidth: 'auto',
              px: 1.5,
              fontSize: '0.75rem',
              textTransform: 'none',
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
              },
            }}
          >
            Clear All
          </Button>
        )}
      </FormGroup>
    </Box>
  );
}
