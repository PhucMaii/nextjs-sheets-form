import {
  AlertColor,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import UploadChequeModal from '../components/Modals/UploadChequeModal';
import { UserType } from '@/app/utils/type';
import { months } from '@/app/lib/constant';
import { UploadIcon } from 'lucide-react';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { Cheque } from '@prisma/client';
import useDebounce from '@/hooks/useDebounce';
import { generateImgUrl } from '@/app/lib/s3';
import ViewImg from '../components/ViewImg';
import EditCheque from '../components/Modals/edit/EditCheque';
import { grey } from '@mui/material/colors';

interface IProps {
  client: UserType | null;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function ChequeTab({ client, showNotification }: IProps) {
  const [displayCheques, setDisplayCheques] = useState<Cheque[]>([]);
  const [editChequeProps, setEditChequeProps] = useState<any>({
    open: false,
    cheque: null,
  });
  const [isUploadChequeOpen, setIsUploadChequeOpen] = useState<boolean>(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [hoveredChequeId, setHoveredChequeId] = useState<number | null>(null);
  const [viewImgProps, setViewImgProps] = useState<any>({
    open: false,
    fileKeyFront: '',
    fileKeyBack: '',
  });

  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  const [cheque] = SWRFetchData(`${API_URL.ADMIN}/cheque?userId=${client?.id}`);

  // Init display cheques
  useEffect(() => {
    if (cheque?.data) {
      setDisplayCheques(cheque?.data);
    }
  }, [cheque]);

  // Handle return search result
  useEffect(() => {
    if (debouncedKeywords) {
      const filteredCheques = cheque?.data?.filter((cheque: Cheque) =>
        cheque.chequeNumber.includes(debouncedKeywords),
      );

      setDisplayCheques(filteredCheques);
    } else {
      setDisplayCheques(cheque?.data);
    }
  }, [debouncedKeywords]);

  return (
    <>
      <EditCheque
        open={editChequeProps.open}
        onClose={() => setEditChequeProps({ open: false, cheque: null })}
        cheque={editChequeProps.cheque}
        client={client}
        showNotification={showNotification}
      />
      <ViewImg
        open={viewImgProps.open}
        onClose={() =>
          setViewImgProps({ open: false, fileKeyFront: '', fileKeyBack: '' })
        }
        fileKeyFront={viewImgProps.fileKeyFront}
        fileKeyBack={viewImgProps.fileKeyBack}
      />
      <UploadChequeModal
        open={isUploadChequeOpen}
        onClose={() => setIsUploadChequeOpen(false)}
        showNotification={showNotification}
        client={client}
        year={new Date().getFullYear().toString()}
        month={months[new Date().getMonth()]}
      />
      <TextField
        fullWidth
        placeholder="Search cheque by cheque number or date"
        variant="filled"
        value={searchKeywords}
        onChange={(e) => setSearchKeywords(e.target.value)}
      />
      <Box width="100%" display="flex" justifyContent="flex-end" mt={2}>
        <Button onClick={() => setIsUploadChequeOpen(true)}>
          <Box display="flex" alignItems="center" gap={1}>
            <UploadIcon />
            <Typography fontWeight="medium">Upload Cheque</Typography>
          </Box>
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Cheque Number</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>For</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayCheques?.map((cheque: Cheque) => {
            return (
              <TableRow
                key={cheque.id}
                onClick={() =>
                  setEditChequeProps({ open: true, cheque: cheque })
                }
                sx={{ '&:hover': { backgroundColor: grey[50] } }}
              >
                <TableCell>
                  <Box
                    onClick={(e: any) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setViewImgProps({
                        open: true,
                        fileKeyFront: cheque.fileKeyFront,
                        fileKeyBack: cheque.fileKeyBack,
                      });
                    }}
                    onMouseEnter={() => setHoveredChequeId(cheque.id)}
                    onMouseLeave={() => setHoveredChequeId(null)}
                    style={{
                      width: '100px',
                      height: '100px',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={generateImgUrl(
                        hoveredChequeId === cheque.id && cheque?.fileKeyBack
                          ? cheque?.fileKeyBack
                          : cheque.fileKeyFront,
                      )}
                      style={{
                        width: '100px',
                        height: '100px',
                        transition: '0.3s ease-in-out',
                      }}
                      alt="cheque"
                    />
                  </Box>
                </TableCell>
                <TableCell>{cheque.chequeNumber}</TableCell>
                <TableCell>{cheque.amount}</TableCell>
                <TableCell>
                  {cheque.month} {cheque.year}
                </TableCell>
                <TableCell>{cheque.createdAt.toLocaleString()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
