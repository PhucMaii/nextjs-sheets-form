import { ListItemButton, ListItemButtonProps } from '@mui/material';
import { blue } from '@mui/material/colors';
import styled from 'styled-components';

interface ItemButtonStyled extends ListItemButtonProps {
  $currentTab: boolean;
}

export const ListItemButtonStyled = styled(ListItemButton)<ItemButtonStyled>`
  background-color: ${(props) => props.$currentTab && `${blue[50]} !important`};
  width: 80%;
  margin: auto !important;
  border-radius: 10px !important;
`;
