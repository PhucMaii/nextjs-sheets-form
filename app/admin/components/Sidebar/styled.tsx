import { ListItemButton, ListItemButtonProps } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import styled from 'styled-components';

interface ItemButtonStyled extends ListItemButtonProps {
  $currentTab: boolean;
}

export const ListItemButtonStyled = styled(ListItemButton)<ItemButtonStyled>`
  background-color: ${(props) =>
    props.$currentTab && `${blueGrey[50]} !important`};
  color: ${(props) => props.$currentTab && ` ${blueGrey[900]} !important`};
  width: 80%;
  margin: auto !important;
  border-radius: 10px !important;
`;
