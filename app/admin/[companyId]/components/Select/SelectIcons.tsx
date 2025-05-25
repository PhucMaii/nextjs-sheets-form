import useDebounce from '@/hooks/useDebounce';
import { Box, Button, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { grey } from '@mui/material/colors';
import { primaryColor } from '@/theme/color';

interface IProps {
  selectedIcon: string;
  setSelectedIcon: any;
}

export default function SelectIcons({ selectedIcon, setSelectedIcon }: IProps) {
  const icons = Object.entries(LucideIcons).slice(0, 20);
  const [displayIcons, setDisplayIcons] = useState<any[]>(icons);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  const IconComponent: any = selectedIcon
    ? LucideIcons[selectedIcon as keyof typeof LucideIcons]
    : () => <></>;

  useEffect(() => {
    if (debouncedKeywords) {
      const filteredIcons = Object.entries(LucideIcons).filter(([name]) => {
        return name.toLowerCase().includes(debouncedKeywords.toLowerCase());
      });

      setDisplayIcons(filteredIcons);
    } else {
      setDisplayIcons(icons);
    }
  }, [debouncedKeywords]);
  return (
    <Box display="flex" flexDirection="column" gap={2} sx={{ mb: 2 }}>
      <Box display="flex" alignItems="center" gap={2}>
        <Typography>Choose Icon: </Typography>
        <IconComponent />
      </Box>
      <TextField
        label="Search Icons"
        placeholder="Search icons..."
        value={searchKeywords}
        onChange={(e) => setSearchKeywords(e.target.value)}
        fullWidth
        variant="outlined"
      />
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
          gap: '16px',
        }}
      >
        {displayIcons.length > 0 &&
          displayIcons.map(([name, Icon]: [string, any]) => (
            <Button
              key={name}
              onClick={() => setSelectedIcon(name)}
              sx={{
                width: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: grey[200],
                color: 'black',
                boxShadow: 'none',
                border:
                  selectedIcon === name ? `2px solid ${primaryColor}` : 'none',
                '&:hover': {
                  backgroundColor: grey[300],
                },
              }}
              variant="contained"
            >
              <React.Suspense key={name} fallback={<div>Loading...</div>}>
                <div style={{ textAlign: 'center' }}>
                  <Icon size={32} />
                  {/* <p style={{ fontSize: '12px', marginTop: '8px' }}>{name}</p> */}
                </div>
              </React.Suspense>
            </Button>
          ))}
      </div>
    </Box>
  );
}
