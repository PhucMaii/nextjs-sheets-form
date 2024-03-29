import { Box } from '@mui/material';
import styled from 'styled-components';

export const BoxModal = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
`;
