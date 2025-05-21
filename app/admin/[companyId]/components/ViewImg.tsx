import { Box, IconButton, Modal } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { generateImgUrl } from '@/app/lib/s3';
import { ModalProps } from './Modals/type';
import { grey } from '@mui/material/colors';
import { XIcon } from 'lucide-react';

interface IProps extends ModalProps {
  fileKeyFront: string;
  fileKeyBack?: string;
}

export default function ViewImg({
  fileKeyFront,
  fileKeyBack,
  open,
  onClose,
}: IProps) {
  const [urlFront, setUrlFront] = useState('');
  const [urlBack, setUrlBack] = useState('');

  useEffect(() => {
    const fetchUrl = async () => {
      if (fileKeyFront) {
        const urlFront = await generateImgUrl(fileKeyFront, true);
        setUrlFront(urlFront);
      }

      if (fileKeyBack) {
        const urlBack = await generateImgUrl(fileKeyBack, true);
        setUrlBack(urlBack);
      }
    };
    fetchUrl();
  }, [fileKeyFront, fileKeyBack]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.9)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
          }}
        >
          <IconButton onClick={onClose} color="inherit">
            <XIcon
              style={{ width: '50px', height: '50px', color: grey[300] }}
            />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          {fileKeyFront && (
            <img
              src={urlFront}
              alt="front"
              style={{
                maxWidth: '100%',
                maxHeight: '45vh',
                objectFit: 'contain',
              }}
            />
          )}
          {fileKeyBack && (
            <img
              src={urlBack}
              alt="back"
              style={{
                maxWidth: '100%',
                maxHeight: '45vh',
                objectFit: 'contain',
              }}
            />
          )}
        </Box>
      </Box>
    </Modal>
  );
}
