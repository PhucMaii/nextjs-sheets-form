import { Box, IconButton, Modal } from '@mui/material'
import React from 'react'
import { generateImgUrl } from '@/app/lib/s3';
import { ModalProps } from './Modals/type';
import { grey } from '@mui/material/colors';
import { XIcon } from 'lucide-react';

interface IProps extends ModalProps {
    fileKeyFront: string;
    fileKeyBack: string;
}

export default function ViewImg({fileKeyFront, fileKeyBack, open, onClose}: IProps) {
  return (
    <Modal open={open} onClose={onClose}>
        <Box sx={{width: '100vw', height: '100vh'}}>
            <Box display="flex" width="100%" justifyContent="flex-end">
                <IconButton onClick={onClose} color="inherit">
                    <XIcon style={{width: '50px', height: '50px', color: grey[300]}} />
                </IconButton>
            </Box>
            <Box display="flex" flexDirection="column">
                <img 
                    src={generateImgUrl(fileKeyFront)}
                    alt="front"
                    style={{width: '100%', height: '300px', objectFit: 'contain'}}
                />
                <img 
                    src={generateImgUrl(fileKeyBack)}
                    alt="back"
                    style={{width: '100%', height: '300px', objectFit: 'contain'}}
                />
            </Box>
        </Box>
    </Modal>
  )
}
