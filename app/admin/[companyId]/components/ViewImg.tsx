import { Box, IconButton, Modal } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { generateImgUrl } from '@/app/lib/s3';
import { ModalProps } from './Modals/type';
import { grey } from '@mui/material/colors';
import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { toCDN } from '@/lib/cdn';
// import { getLoadUrl } from '@/app/lib/r2';

interface IProps extends ModalProps {
  fileKeyFront: string;
  fileKeyBack?: string;
  isCheque?: boolean;
}

export default function ViewImg({
  fileKeyFront,
  fileKeyBack,
  open,
  onClose,
  isCheque,
}: IProps) {
  const [urlFront, setUrlFront] = useState('');
  const [urlBack, setUrlBack] = useState('');

  useEffect(() => {
    const fetchUrl = async () => {
      // if (isCheque) {
      //   if (fileKeyFront) {
      //     const urlFront = await getLoadUrl(fileKeyFront);
      //     setUrlFront(urlFront);
      //   }
  
      //   if (fileKeyBack) {
      //     const urlBack = await getLoadUrl(fileKeyBack);
      //     setUrlBack(urlBack);
      //   }        
      // } else {
        if (fileKeyFront) {
          const urlFront = await generateImgUrl(fileKeyFront, isCheque);
          // console.log(urlFront, 'urlFront');
          setUrlFront(urlFront);
        }

        if (fileKeyBack) {
          const urlBack = await generateImgUrl(fileKeyBack, isCheque);
          setUrlBack(urlBack);
        }
      // }
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
            <Image
              src={toCDN(urlFront, isCheque)}
              alt="front"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
              width={1000}
              height={1000}
              loading="lazy"
            />
          )}
          {fileKeyBack && (
            <Image
              src={toCDN(urlBack, isCheque)}
              alt="back"
              style={{
                maxWidth: '100%',
                maxHeight: '45vh',
                objectFit: 'contain',
              }}
              width={500}
              height={500}
              loading="lazy"
            />
          )}
        </Box>
      </Box>
    </Modal>
  );
}
