import { ListItemButton, ListItemButtonProps } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import styled from 'styled-components';

interface ItemButtonStyled extends ListItemButtonProps {
  $currentTab: boolean;
  $textColor: string;
  $bgColor: string;
}

export const ListItemButtonStyled = styled(ListItemButton)<ItemButtonStyled>`
  background-color: ${(props) =>
    props.$currentTab && `${props.$bgColor} !important`};
  color: ${(props) =>
    props.$currentTab ? ` ${props.$textColor} !important` : blueGrey[600]};
  width: 80%;
  margin: auto !important;
  border-radius: 10px !important;
`;
