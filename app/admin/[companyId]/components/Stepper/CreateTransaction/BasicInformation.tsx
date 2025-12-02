import React from 'react';
import {
  Grid,
  Typography,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  Box,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import {
  CalendarToday,
  Person,
  Payment,
  Receipt,
} from '@mui/icons-material';
import { BorderSection } from '../../../reports/styled';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { PAYMENT_METHOD_TYPE, TRANSACTION_STATUS } from '@/app/utils/enum';
import { TransactionType } from './TransactionTypeStep';
import { IExpenseType } from '@/app/utils/type';
import ErrorComponent from '../../ErrorComponent';
import DisplayFile from '../../Modals/DisplayFile';
import { PresignedFileUpload } from '@/app/components/PresignedFileUpload';
import { YYYYMMDDFormat } from '@/app/utils/time';

interface PropTypes {
  transactionType: TransactionType;
  selectedDate: any;
  setSelectedDate: (date: any) => void;
  formData: any;
  setFormData: (data: any) => void;
  adminsAndDrivers: any;
  paymentMethods: any;
  expenseTypes: any;
  currentHighlightedSection: string;
  isHelpMode: boolean;
  sectionRefs: any;
  nextButton: () => React.ReactNode;
}

export default function BasicInformation({
  transactionType,
  selectedDate,
  setSelectedDate,
  formData,
  setFormData,
  adminsAndDrivers,
  paymentMethods,
  expenseTypes,
  currentHighlightedSection,
  isHelpMode,
  sectionRefs,
  nextButton,
}: PropTypes) {
  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const month = YYYYMMDDFormat(new Date()).split('/')[0];
  const year = YYYYMMDDFormat(new Date()).split('/')[2];
  
  return (
    <Grid item xs={12}>
      <BorderSection
        sx={{ p: 3, mb: 3 }}
        $isHighlighted={
          currentHighlightedSection === 'basic-info' && isHelpMode
        }
        ref={(el) => {
          sectionRefs.current['basic-info'] = el as HTMLElement;
        }}
      >
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CreditCardIcon color="primary" />
          Basic Information
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {transactionType === 'stock' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="invoice-number"
                label="Invoice Number"
                value={formData.invoice}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    invoice: e.target.value,
                  }))
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Receipt />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Transaction Date"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue || dayjs())}
                slots={{
                  textField: TextField,
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Spent By</InputLabel>
              <Select
                value={formData.spentBy}
                label="Spent By"
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    spentBy: e.target.value,
                  }))
                }
                startAdornment={
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>Select who spent</em>
                </MenuItem>
                {adminsAndDrivers?.map((person: string) => (
                  <MenuItem key={person} value={person}>
                    {person}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.paymentMethodId}
                label="Payment Method"
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    paymentMethodId: Number(e.target.value),
                    paymentMethod: paymentMethods?.find(
                      (m: any) => m.id === Number(e.target.value),
                    ),
                  }))
                }
                startAdornment={
                  <InputAdornment position="start">
                    <Payment />
                  </InputAdornment>
                }
              >
                <MenuItem value={-1}>
                  <em>Select payment method</em>
                </MenuItem>
                {paymentMethods?.map((method: any) => (
                  <MenuItem key={method.id} value={method.id}>
                    {method.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => {
                  const value = e.target.value as TRANSACTION_STATUS;
                  setFormData((prev: any) => ({
                    ...prev,
                    status: value,
                  }));
                }}
              >
                <MenuItem value={TRANSACTION_STATUS.PAID}>Paid</MenuItem>
                <MenuItem value={TRANSACTION_STATUS.UNPAID}>Unpaid</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {transactionType !== 'stock' && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel htmlFor="assign-type" id="assign-type-label">
                  Assign Type
                </InputLabel>
                <Select
                  labelId="assign-type-label"
                  id="assign-type"
                  aria-labelledby="assign-type-label"
                  value={formData.typeId}
                  label="Assign Type"
                  fullWidth
                  onChange={(e) => {
                    setFormData((prev: any) => ({
                      ...prev,
                      typeId: Number(e.target.value),
                      type: expenseTypes?.find(
                        (type: IExpenseType) =>
                          type.id === Number(e.target.value),
                      ),
                    }));
                  }}
                >
                  <MenuItem value={-1}>N/A</MenuItem>
                  {expenseTypes?.map((type: IExpenseType) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter transaction description..."
            />
          </Grid>

          {formData?.paymentMethod?.type === PAYMENT_METHOD_TYPE.CHEQUE && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                // gap: 2,
                mt: 2,
                p: 2,
                width: '100%',
              }}
            >
              <Divider sx={{ width: '100%', my: 2 }}>Cheque Proof</Divider>

              <Box
                display="flex"
                alignItems="center"
                gap={1}
                width="100%"
                justifyContent="flex-end"
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isFrontCheque}
                      onChange={(e) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          isFrontCheque: e.target.checked,
                        }));
                      }}
                    />
                  }
                  label="Front"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isBackCheque}
                      onChange={(e) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          isBackCheque: e.target.checked,
                        }));
                      }}
                    />
                  }
                  label="Back"
                />
              </Box>

              <Box
                display="flex"
                flexDirection={mdDown ? 'column' : 'row'}
                alignItems="flex-start"
                gap={1}
                width="100%"
                mt={2}
              >
                {!formData?.isFrontCheque && !formData?.isBackCheque && (
                  <ErrorComponent errorText="Please select either front or back of the cheque to upload" />
                )}
                {formData?.isFrontCheque && formData?.frontFileKey ? (
                  <Box
                    width="100%"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                  >
                    <Typography>Front</Typography>
                    <DisplayFile
                      fileKey={formData?.frontFileKey}
                      isCheque={true}
                      width="200px"
                      height="200px"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setFormData((prev: any) => ({
                          ...prev,
                          frontFileKey: null,
                          frontFileType: null,
                        }));
                      }}
                    >
                      Upload Other Proof
                    </Button>
                  </Box>
                ) : formData?.isFrontCheque && !formData?.frontFileKey ? (
                  <Box width="100%">
                    <Typography>Front</Typography>
                    <PresignedFileUpload
                      location={`transactions/${year}/${month}`}
                      isCheque={true}
                      maxFiles={1}
                      maxSize={10 * 1024 * 1024} // 10MB
                      acceptedFileTypes={['image/*', 'application/pdf']}
                      onUploadComplete={(files) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          frontFileKey: files[0].fileKey,
                          frontFileType: files[0].fileType,
                        }));
                      }}
                      isUploaded={!!formData.frontFileKey}
                    />
                  </Box>
                ) : null}

                {formData?.isBackCheque && formData?.backFileKey ? (
                  <Box
                    width="100%"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                  >
                    <Typography>Back</Typography>
                    <DisplayFile
                      fileKey={formData?.backFileKey}
                      isCheque={true}
                      width="200px"
                      height="200px"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setFormData((prev: any) => ({
                          ...prev,
                          backFileKey: null,
                          backFileType: null,
                        }));
                      }}
                    >
                      Upload Other Proof
                    </Button>
                  </Box>
                ) : formData?.isBackCheque && !formData?.backFileKey ? (
                  <Box width="100%">
                    <Typography>Back</Typography>
                    <PresignedFileUpload
                      location={`transactions/${year}/${month}`}
                      isCheque={true}
                      maxFiles={1}
                      maxSize={10 * 1024 * 1024} // 10MB
                      acceptedFileTypes={['image/*', 'application/pdf']}
                      onUploadComplete={(files) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          backFileKey: files[0].fileKey,
                          backFileType: files[0].fileType,
                        }));
                      }}
                      isUploaded={!!formData.backFileKey}
                    />
                  </Box>
                ) : null}
              </Box>
            </Box>
          )}
        </Grid>
        {currentHighlightedSection === 'basic-info' && nextButton()}
      </BorderSection>
    </Grid>
  );
}
