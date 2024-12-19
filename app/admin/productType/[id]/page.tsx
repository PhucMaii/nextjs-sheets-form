'use client';
import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import { Box, Button, Divider, IconButton, InputAdornment, OutlinedInput, Typography } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

export default function page() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    const [searchKeywords, setSearchKeywords] = useState<string>('');

    
    const [type] = SWRFetchData(`${API_URL.ADMIN}/productTypes?id=${id}`);

  return (
    <Sidebar>
        <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
                <IconButton onClick={() => router.push(`/admin/settings?tab=1`)}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold">
                    {type?.data?.name}
                </Typography>
            </Box>
            {/* <Button variant="contained">
                + Add Item
            </Button> */}
            <OutlinedInput 
                size="small" 
                placeholder="Search" 
                value={searchKeywords}
                sx={{borderRadius: 2}}
                onChange={(e) => setSearchKeywords(e.target.value)}
                startAdornment={
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                }
            />
        </Box>

        <Divider sx={{mt: 2}} />

        <Box display="flex" justifyContent="flex-end">
            <Button variant="outlined">
                + Add Item
            </Button>
        </Box>
    </Sidebar>
  )
}
