import { Box } from '@mui/material';
import { grey, blue } from '@mui/material/colors';
import styled from 'styled-components';

export const ShadowSection = styled(Box)`
  background-color: white;
  // width: 100%;
  padding: 20px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
`;

export const BorderSection = styled(Box)<{ $isHighlighted?: boolean }>`
  background-color: white;
  // width: 100%;
  padding: 20px;
  border-radius: 10px;
  border: ${(props: any) => props.$isHighlighted ? `3px solid ${blue[600]}` : `1px solid ${grey[300]}`};
  box-shadow: ${(props: any) => props.$isHighlighted ? `rgba(149, 157, 165, 0.2) 0px 8px 24px;` : 'none'};
  transition: all 0.2s ease;
`;
