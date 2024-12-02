import useNotification from '@/hooks/useNotification';
import { LoadingButton } from '@mui/lab';
import { Box, Divider, TextField, Typography } from '@mui/material'
import axios from 'axios';
import Image from 'next/image'
import React, { useState } from 'react'

export default function Maintenance() {
  const [form, setForm] = useState({
    name: '',
    help: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showNotification, NotificationComp } = useNotification();

  const handleSendEmail = async () => {
    setIsLoading(true);
    const response = await axios.post('/api/sendEmail', {
      email: 'tim.le@littleminhs.com',
      subject: 'Supreme Sprouts Help During Maintenance',
      message: `
        Company Name: ${form.name}
        How can we assist you?: ${form.help}
      `
    });

    if (response.data.error) {
      setIsLoading(false);
      showNotification('error', response.data.error);
      return;
    }

    setIsLoading(false);
    showNotification('success', 'Form Sent Successfully. Thank you for your help!');
  }

  return (
    <>
      {NotificationComp}
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{backgroundColor: 'white', height: '100vh', width: '100vw', overflow: 'hidden'}}>
       <Image src="/under_maintenance.jpg" alt="maintenance" width={300} height={300} style={{maxWidth: 500}} />
       <Box display="flex" flexDirection="column" gap={2}>
        <Typography textAlign="center" variant="h6">Please fill out the form for assistance</Typography>
        <TextField 
          label="Company Name"
          placeholder="Please enter your company name..."
          size="small"
          value={form.name}
          onChange={(e: any) => setForm((prevState: any) => ({...prevState, name: e.target.value}))}
        />

        <TextField 
          label="How can we assist you?"
          placeholder="Please specify your needs..."
          multiline
          rows={2}
          value={form.help}
          onChange={(e: any) => setForm((prevState: any) => ({...prevState, help: e.target.value}))}
        />

        <LoadingButton loading={isLoading} variant="contained" onClick={handleSendEmail}>Submit</LoadingButton>
       </Box>
      
      <Divider flexItem sx={{ my: 3 }}>Or</Divider>
      <Typography variant="h6" textAlign="center">
        Please contact numbers below for help <br />
        778 789 1060 <br />
        709 989 6000 <br />
      </Typography>
    </Box>
    </>
  )
}
