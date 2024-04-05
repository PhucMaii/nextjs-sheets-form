import { Box, BoxProps } from '@mui/material';
import { grey } from '@mui/material/colors';
import styled from 'styled-components';

interface DropdownItemContainerProps extends BoxProps {
  isSelected?: boolean;
}

export const DropdownItemContainer = styled(Box)<DropdownItemContainerProps>`
  padding: 8px;
  border-radius: 10px;
  background-color: ${(props) => props.isSelected && grey[200]};
`;
