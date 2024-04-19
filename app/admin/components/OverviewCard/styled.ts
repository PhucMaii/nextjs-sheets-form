import { Card } from '@mui/material';
import styled from 'styled-components';

export const CardStyled = styled(Card)`
    border-radius: 15px !important; 
    max-width: 100% !important; 
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px; !important;
`;

export const IconBackground = styled.div`
  border-radius: 50%;
  width: 80px;
  height: 80px;
  background-color: rgba(52, 152, 219, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  margin-bottom: 16px;
`;
