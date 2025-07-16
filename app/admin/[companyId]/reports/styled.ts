import { Box } from '@mui/material';
import { grey } from '@mui/material/colors';
import styled from 'styled-components';

export const ShadowSection = styled(Box)`
  background-color: white;
  // width: 100%;
  padding: 20px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
`;

export const BorderSection = styled(Box)`
  background-color: white;
  // width: 100%;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid ${grey[300]};
`;
