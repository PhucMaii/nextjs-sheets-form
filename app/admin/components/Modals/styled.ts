import { Box } from '@mui/material';
import styled from 'styled-components';

export const BoxModal = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
  width: 700px;

  @media screen and (max-width: 600px) {
    width: 85vw;
  }
`;
