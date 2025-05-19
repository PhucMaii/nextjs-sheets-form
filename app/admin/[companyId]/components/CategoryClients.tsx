import {
  Divider,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';
import { ModalProps } from './Modals/type';
import { BoxModal } from './Modals/styled';
import ModalHead from '@/app/lib/ModalHead';
import { UserType } from '@/app/utils/type';

interface IProps extends ModalProps {
  clients: any[];
}

export default function CategoryClients({ open, onClose, clients }: IProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="scroll">
        <ModalHead
          heading="Category Clients"
          buttonLabel="ADD"
          onlyHeading
          onClose={onClose}
          onClick={() => {}}
          buttonProps={{}}
        />

        <Divider sx={{ my: 2 }} />

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client Id</TableCell>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length > 0 &&
              clients.map((client: UserType) => {
                return (
                  <TableRow key={client.id}>
                    <TableCell>{client.clientId}</TableCell>
                    <TableCell>{client.clientName}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </BoxModal>
    </Modal>
  );
}
