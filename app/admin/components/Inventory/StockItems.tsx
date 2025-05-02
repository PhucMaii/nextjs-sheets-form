import {
  AlertColor,
  Box,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import InventoryTable from '../Tables/InventoryTable';
import AddInventory from '../Modals/add/AddInventory';
import useDebounce from '@/hooks/useDebounce';
import { IInventoryItem } from '@/app/utils/type';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { grey } from '@mui/material/colors';
import SingleFieldEdit from '../Modals/edit/SingleFieldEdit';
import axios from 'axios';
import { EditIcon, Trash2Icon } from 'lucide-react';
import { ItemType } from '@prisma/client';
import { generateErrorMsg } from '@/app/lib/error';
import DeleteModal from '../Modals/delete/DeleteModal';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { DropdownItemContainer } from '../../orders/styled';
import { primaryColor } from '@/theme/color';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import SingleFieldUpdate from '../Modals/edit/SingleFieldUpdate';

export const ItemTypeButton = ({
  type,
  isSelected,
  onClick,
  onEdit,
  onDelete,
  style,
  mode,
  className,
  ...props
}: {
  type: string;
  isSelected: boolean;
  onClick: any;
  style?: any;
  onEdit?: any;
  onDelete?: any;
  mode: 'edit' | 'view';
  className?: string;
}) => {
  return (
    <Button
      className={className}
      onClick={onClick}
      sx={{ ...style }}
      {...props}
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          backgroundColor: isSelected ? 'primary.lightest' : grey[200],
          color: isSelected ? 'primary.main' : grey[500],
        }}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <Typography variant="body2" fontWeight="bold">
          {type}
        </Typography>
        {type !== 'All' && mode === 'edit' && (
          <Box display="flex" alignItems="center">
            <IconButton color="primary" onClick={onEdit}>
              <EditIcon style={{ width: 18, height: 18 }} />
            </IconButton>
            <IconButton color="error" onClick={onDelete}>
              <Trash2Icon style={{ width: 18, height: 18 }} />
            </IconButton>
          </Box>
        )}
      </Box>
    </Button>
  );
};

interface IProps {
  showNotification: (type: AlertColor, message: string) => void;
  inventoryItems: any;
}

export default function StockItems({
  showNotification,
  inventoryItems,
}: IProps) {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
  const [displayData, setDisplayData] = useState<IInventoryItem[]>([]);
  const [deleteProps, setDeleteProps] = useState<any>({
    open: false,
    targetObj: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenBulkTypeUpdate, setIsOpenBulkTypeUpdate] =
    useState<boolean>(false);
  const [isOpenAddItem, setIsOpenAddItem] = useState<boolean>(false);
  const [singleFieldProps, setSingleFieldProps] = useState<any>({
    open: false,
    mode: 'add',
    defaultValue: null,
    id: -1,
  });
  const [selectedItems, setSelectedItems] = useState<IInventoryItem[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All');

  const debouncedKeywords = useDebounce(searchKeywords, 1000);
  const [itemTypes] = SWRFetchData(`${API_URL.ADMIN}/item-types`);

  useEffect(() => {
    if (inventoryItems) {
      setIsLoading(false);
      setDisplayData(inventoryItems?.data || []);
    } else {
      setIsLoading(true);
    }
  }, [inventoryItems]);

  useEffect(() => {
    if (debouncedKeywords) {
      console.log('debouncedKeywords', debouncedKeywords);
      const newDisplayData = inventoryItems?.data.filter(
        (item: IInventoryItem) => {
          return (
            item?.sku
              ?.toLowerCase()
              .includes(debouncedKeywords.toLowerCase()) ||
            item?.supplierSku
              ?.toLowerCase()
              .includes(debouncedKeywords.toLowerCase()) ||
            item.name.toLowerCase().includes(debouncedKeywords.toLowerCase()) ||
            item.vendorItem.some((vendorItem: any) =>
              vendorItem.vendor.name
                .toLowerCase()
                .includes(debouncedKeywords.toLowerCase()),
            )
          );
        },
      );

      setDisplayData(newDisplayData);
    } else {
      setDisplayData(inventoryItems?.data || []);
    }
  }, [debouncedKeywords, inventoryItems?.data]);

  useEffect(() => {
    if (selectedType === 'All') {
      setDisplayData(inventoryItems?.data || []);
    }

    if (selectedType !== 'All') {
      const newDisplayData = inventoryItems?.data.filter(
        (item: IInventoryItem) => {
          return item?.type?.name === selectedType;
        },
      );

      setDisplayData(newDisplayData || []);
    }
  }, [selectedType]);

  const handleAddType = async (newType: string) => {
    try {
      const response = await axios.post(`${API_URL.ADMIN}/item-types`, {
        name: newType,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      setSingleFieldProps({ open: false, mode: 'add', defaultValue: null });
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Internal Server Error: ' + error);
    }
  };

  const handleEditType = async (updatedName: string) => {
    if (!updatedName) return;

    if (singleFieldProps.id < 1) {
      showNotification('error', 'Something went wrong');
      return;
    }

    try {
      const response = await axios.put(`${API_URL.ADMIN}/item-types`, {
        id: singleFieldProps.id,
        name: updatedName,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      setSingleFieldProps({ open: false, mode: 'add', defaultValue: null });
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Internal Server Error: ' + error);
    }
  };

  const handleDeleteType = async (type: ItemType) => {
    try {
      const response = await axios.delete(
        `${API_URL.ADMIN}/item-types?id=${type.id}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);

      if (selectedType === type.name) {
        setSelectedType('All');
      }
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', generateErrorMsg(error));
    }
  };

  const handleBulkSwitchType = async (field: string, newType: any) => {
    try {
      const response = await axios.put(
        `${API_URL.ADMIN}/inventory/switch-type`,
        {
          idList: selectedItems.map((item) => item.id),
          typeId: newType,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      setSelectedItems([]);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', generateErrorMsg(error));
    }
  };

  const onOpenDeleteModal = (e: any, type: ItemType) => {
    e.stopPropagation();
    e.preventDefault();

    setDeleteProps({
      open: true,
      targetObj: type,
    });
  };

  const onOpenEditModal = (e: any, type: ItemType) => {
    e.stopPropagation();
    e.preventDefault();

    setSingleFieldProps({
      open: true,
      mode: 'edit',
      defaultValue: type.name,
      id: type.id,
    });
  };

  const actionButton = (
    <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
      <Button
        variant="outlined"
        aria-controls={openDropdown ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openDropdown ? 'true' : undefined}
        onClick={(e) => setActionButtonAnchor(e.currentTarget)}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <ArrowDownwardIcon fontSize="small" />
          <Typography fontWeight="medium">Actions</Typography>
        </Box>
      </Button>

      <Menu
        id="basic-menu"
        anchorEl={actionButtonAnchor}
        open={openDropdown}
        onClose={() => setActionButtonAnchor(null)}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            setIsOpenAddItem(true);
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <AddIcon sx={{ color: primaryColor }} />
            <Typography>Add Item</Typography>
          </DropdownItemContainer>
        </MenuItem>

        <MenuItem
          disabled={selectedItems.length === 0}
          onClick={() => setIsOpenBulkTypeUpdate(true)}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <ModeEditIcon sx={{ color: primaryColor }} />
            <Typography>Update type</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <>
      <DeleteModal
        open={deleteProps.open}
        handleCloseModal={() =>
          setDeleteProps({ open: false, targetObj: null })
        }
        handleDelete={handleDeleteType}
        showTargetObj={deleteProps?.targetObj?.name}
        targetObj={deleteProps?.targetObj}
      />
      <SingleFieldEdit
        title={
          singleFieldProps.mode === 'add' ? 'Add Item Type' : 'Edit Item Type'
        }
        open={singleFieldProps.open}
        onClose={() =>
          setSingleFieldProps({ open: false, mode: 'add', defaultValue: null })
        }
        handleUpdate={
          singleFieldProps.mode === 'add' ? handleAddType : handleEditType
        }
        inputLabel="Item Type Name"
        buttonLabel={singleFieldProps.mode === 'add' ? 'Add' : 'Save'}
        defaultValue={singleFieldProps?.defaultValue || ''}
      />
      <SingleFieldUpdate
        open={isOpenBulkTypeUpdate}
        onClose={() => setIsOpenBulkTypeUpdate(false)}
        label="Item Type"
        handleUpdate={handleBulkSwitchType}
        menuList={itemTypes?.data || []}
        title="Switch Items Type"
        updatedField="type"
        renderField="name"
      />
      <AddInventory
        open={isOpenAddItem}
        onClose={() => setIsOpenAddItem(false)}
        showNotification={showNotification}
      />
      <Box display="flex" flexDirection="column" overflow="auto" width="100%">
        <Box
          // maxWidth="100%"
          width={'100%'}
          sx={{
            overflowX: 'auto',
          }}
          display="flex"
          alignItems="center"
          gap={1}
          whiteSpace={'nowrap'}
        >
          <ItemTypeButton
            style={{ minWidth: 'auto' }}
            type="All"
            isSelected={selectedType === 'All'}
            onClick={() => setSelectedType('All')}
            mode="edit"
          />
          {itemTypes?.data?.map((itemType: any) => (
            <ItemTypeButton
              key={itemType.id}
              type={itemType.name}
              isSelected={selectedType === itemType.name}
              style={{ minWidth: 'auto' }}
              mode="edit"
              onClick={() => setSelectedType(itemType.name)}
              onEdit={(e: any) => onOpenEditModal(e, itemType)}
              onDelete={(e: any) => onOpenDeleteModal(e, itemType)}
            />
          ))}

          <Button
            onClick={() =>
              setSingleFieldProps({
                open: true,
                mode: 'add',
                defaultValue: null,
              })
            }
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              color: 'inherit',
              backgroundColor: grey[200],
              minWidth: 'auto',
            }}
          >
            + Add
          </Button>
        </Box>
        <Grid container alignItems="center" spacing={1} mt={2}>
          <Grid item xs={12} md={10.5} lg={11}>
            <TextField
              label="Search"
              placeholder="Search items by name..."
              size="small"
              variant="filled"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={1.5} lg={1} textAlign="right">
            {/* <Button onClick={() => setIsOpenAddItem(true)}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <AddIcon />
                <Typography variant="body2" fontWeight="bold">
                  New Item
                </Typography>
              </Box>
            </Button> */}
            {actionButton}
          </Grid>
        </Grid>

        {isLoading ? (
          <LoadingComponent />
        ) : (
          <InventoryTable
            inventoryItems={displayData}
            showNotification={showNotification}
            itemTypes={itemTypes?.data || []}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
        )}
      </Box>
    </>
  );
}
