'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  Box,
  Divider,
  IconButton,
  OutlinedInput,
  Typography,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Grid,
  Button,
  Skeleton,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useRouter } from 'next/navigation';
import { ShadowSection } from '../../reports/styled';
import { IItem } from '@/app/utils/type';
import { fetchApi } from '@/app/utils/db';
import { useParams } from 'next/navigation';
import { getAdminApiUrl } from '@/app/utils/enum';
import { generateImgUrl } from '@/app/lib/s3';
import ListingCategoriesTable from '../../components/Tables/ListingCategoriesTable';
import { ItemButton } from '@/app/components/OrderView';
import UploadImgModal from '../../components/Modals/UploadImgModal';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import UnitRadio from '../../components/Radio/UnitRadio';
import { getUniqueUnitRatios } from '@/app/utils/array';
import { UPDATE_OPTION } from '../../components/Modals/edit/EditItem';
import { LoadingButton } from '@mui/lab';
import { EditIcon } from 'lucide-react';
import DeleteModal from '../../components/Modals/delete/DeleteModal';
import EditItemAvailability from '../../components/Modals/edit/EditItemAvailability';
import BulkEditOptions from '../../components/Bulk/BulkEditOptions';
import VariantTable from './VariantTable';

export default function ItemPage() {
  const { companyId, itemId }: any = useParams();
  const router = useRouter();
  const { showNotification, NotificationComp } = useNotification();

  const [isOpenUploadImgModal, setIsOpenUploadImgModal] =
    useState<boolean>(false);
  const [item, setItem] = useState<IItem | any>({});
  const [image, setImage] = useState<string | null>(null);
  const [isImgHovered, setIsImgHovered] = useState(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isOpenEditVariants, setIsOpenEditVariants] = useState<boolean>(false);
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const [loading, setLoading] = useState<any>({
    [UPDATE_OPTION.CURRENT_CATEGORY]: false,
    [UPDATE_OPTION.ALL_ITEMS_SAME_NAME]: false,
  });
  const [variants, setVariants] = useState<any[]>([]);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);

  useEffect(() => {
    fetchItem();
  }, []);

  useEffect(() => {
    if (item?.inventoryItem?.image) {
      generateImgUrl(item?.inventoryItem?.image).then((img) => {
        setImage(img);
      });
    }
  }, [item]);

  const fetchItem = async () => {
    const data = await fetchApi(
      getAdminApiUrl(companyId, `/items?itemId=${itemId}`),
    );

    const inventoryUnits = data?.inventoryItem?.vendorItem.flatMap(
      (item: any) => item.unit,
    );

    const sellingUnits = getUniqueUnitRatios(inventoryUnits);

    setVariants(data?.options || []);

    setItem((prev: any) => ({
      ...prev,
      ...data,
      units: sellingUnits,
    }));

    setIsFetching(false);
  };

  const onUpdatePrice = useCallback(
    (field: string, value: number) => {
      if (field === 'price') {
        const newProfit = value - item.costPerItem;
        const margin = (newProfit / item.costPerItem) * 100;
        const newMargin = Math.round(margin * 100) / 100;
        setItem((prev: any) => ({
          ...prev,
          price: value,
          profit: newProfit,
          margin: newMargin,
        }));
      }

      if (field === 'profit') {
        const newPrice = item.costPerItem + value;
        const margin = (value / item.costPerItem) * 100;
        const newMargin = Math.round(margin * 100) / 100;
        setItem((prev: any) => ({
          ...prev,
          price: newPrice,
          margin: newMargin,
          profit: value,
        }));
      }

      if (field === 'margin') {
        const newProfit = (value / 100) * item.costPerItem;
        const newPrice = newProfit + item.costPerItem;
        setItem((prev: any) => ({
          ...prev,
          price: newPrice,
          profit: newProfit,
          margin: value,
        }));
      }
    },
    [item],
  );

  const handleDeleteItem = async (targetItem: IItem) => {
    try {
      const response = await axios.delete(getAdminApiUrl(companyId, '/items'), {
        data: { removedId: targetItem.id },
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      router.push(
        `/admin/${companyId}/items/category/${targetItem.categoryId}`,
      );
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  const handleUploadImage = async (image: string) => {
    try {
      await axios.post(getAdminApiUrl(companyId, `/inventory/upload-image`), {
        image,
        inventoryItemId: item?.inventoryItemId,
      });

      generateImgUrl(image).then((img) => {
        setImage(img);
        setItem((prev: any) => ({
          ...prev,
          inventoryItem: { ...prev?.inventoryItem, image: img },
        }));
      });

      setIsOpenUploadImgModal(false);
      showNotification('success', 'Image uploaded successfully');
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Failed to upload image: ' + error);
    }
  };

  const onSelectToUpdateFields = useCallback(
    (field: string) => {
      const isSelected = updatedFields.includes(field);
      if (isSelected) {
        setUpdatedFields((prev) => prev.filter((f) => f !== field));
      } else {
        setUpdatedFields((prev) => [...prev, field]);
      }
    },
    [updatedFields],
  );

  const updateItem = async (updateOption: UPDATE_OPTION) => {
    const newUpdatedItem = {
      ...item,
      image: item?.image || null,
      name: item.name.toUpperCase(),
    };

    if (
      updateOption === UPDATE_OPTION.ALL_ITEMS_SAME_NAME &&
      updatedFields.length === 0
    ) {
      showNotification('error', 'Please select at least one field to update');
      return;
    }

    setLoading((prev: any) => ({
      ...prev,
      [updateOption]: true,
    }));

    try {
      const response = await axios.put(getAdminApiUrl(companyId, '/items'), {
        updatedItem: {
          ...newUpdatedItem,
          image: item?.image || null,
        },
        updateOption,
        updatedFields: updatedFields,
        options: variants,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      await fetchItem();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    } finally {
      setLoading((prev: any) => ({
        ...prev,
        [updateOption]: false,
      }));
    }
  };

  const handleUpdateItem = async (
    updatedItem: IItem,
    updateOption: UPDATE_OPTION = UPDATE_OPTION.CURRENT_CATEGORY,
    updatedFields: string[] = [],
  ) => {
    try {
      const response = await axios.put(getAdminApiUrl(companyId, '/items'), {
        updatedItem,
        updateOption,
        updatedFields,
        // selectedVariants,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Update Real Data
      // mutateItems();
      await fetchItem();
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  return (
    <Sidebar>
      {NotificationComp}
      <UploadImgModal
        open={isOpenUploadImgModal}
        onClose={() => setIsOpenUploadImgModal(false)}
        initialImage={image || ''}
        handleUploadImage={handleUploadImage}
      />

      <DeleteModal
        open={isOpenDeleteModal}
        handleCloseModal={() => setIsOpenDeleteModal(false)}
        targetObj={item}
        handleDelete={handleDeleteItem}
        showTargetObj={item?.name}
      />
      <BulkEditOptions
        open={isOpenEditVariants}
        onClose={() => setIsOpenEditVariants(false)}
        item={item}
        showNotification={showNotification}
        refetch={fetchItem}
      />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        sx={{ mb: 1 }}
      >
        <Box display="flex" gap={1} alignItems="center">
          <IconButton onClick={() => router.back()}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography variant="subtitle2">Back</Typography>
        </Box>

        <Box display="flex" gap={1} alignItems="center">
          <Button
            variant="outlined"
            color="error"
            onClick={() => setIsOpenDeleteModal(true)}
          >
            Delete
          </Button>
          <LoadingButton
            variant="outlined"
            color="primary"
            onClick={() => updateItem(UPDATE_OPTION.ALL_ITEMS_SAME_NAME)}
            loading={loading[UPDATE_OPTION.ALL_ITEMS_SAME_NAME]}
          >
            Save same inventory item
          </LoadingButton>
          <LoadingButton
            variant="contained"
            color="primary"
            onClick={() => updateItem(UPDATE_OPTION.CURRENT_CATEGORY)}
            loading={loading[UPDATE_OPTION.CURRENT_CATEGORY]}
          >
            Save
          </LoadingButton>
        </Box>
      </Box>

      <Grid container spacing={1}>
        <Grid item xs={12} md={8}>
          <Box display="flex" flexDirection="column" gap={1}>
            {isFetching ? (
              <Skeleton variant="rectangular" height={100} />
            ) : (
              <ShadowSection>
                <Box display="flex" alignItems="center" gap={1}>
                  <EditItemAvailability
                    item={item}
                    handleUpdateItem={handleUpdateItem}
                    showNotification={showNotification}
                  />

                  <Typography variant="subtitle2">Availability</Typography>
                </Box>
                <Box
                  display="flex"
                  gap={0.5}
                  alignItems="center"
                  sx={{ mt: 2 }}
                >
                  <Checkbox
                    checked={updatedFields.includes('name') || false}
                    onChange={() => onSelectToUpdateFields('name')}
                  />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Name
                  </Typography>
                </Box>
                <OutlinedInput
                  fullWidth
                  placeholder="Enter name"
                  value={item?.name}
                  onChange={(e) => setItem({ ...item, name: e.target.value })}
                />
              </ShadowSection>
            )}

            {isFetching ? (
              <Skeleton variant="rectangular" height={300} />
            ) : (
              <>
                {variants?.length === 0 && (
                  <ShadowSection sx={{ mt: 1 }}>
                    <Box display="flex" gap={0.5} alignItems="center">
                      <Checkbox
                        checked={updatedFields.includes('price') || false}
                        onChange={() => onSelectToUpdateFields('price')}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        Pricing
                      </Typography>
                    </Box>
                    <Grid
                      container
                      spacing={1}
                      alignItems="center"
                      sx={{ mt: 1 }}
                    >
                      <Grid item xs={12} md={6}>
                        <Box
                          display="flex"
                          flexDirection="column"
                          sx={{ width: '100%' }}
                        >
                          <Typography variant="subtitle2">Price</Typography>
                          <OutlinedInput
                            fullWidth
                            placeholder="Enter price"
                            value={item?.price}
                            onChange={(e) =>
                              onUpdatePrice('price', Number(e.target.value))
                            }
                            type="number"
                            sx={{ mt: 1 }}
                            startAdornment={
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            }
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box
                          display="flex"
                          flexDirection="column"
                          sx={{ width: '100%' }}
                        >
                          <Typography variant="subtitle2">
                            Previous Price
                          </Typography>
                          <OutlinedInput
                            fullWidth
                            placeholder="Enter previous price"
                            value={item?.prevPrice || 0}
                            onChange={(e) =>
                              setItem((prev: any) => ({
                                ...prev,
                                prevPrice: Number(e.target.value),
                              }))
                            }
                            sx={{ mt: 1 }}
                            startAdornment={
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            }
                            type="number"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={item?.isShowDiscount || false}
                              onChange={(e) =>
                                setItem((prev: any) => ({
                                  ...prev,
                                  isShowDiscount: e.target.checked,
                                }))
                              }
                            />
                          }
                          label="Show Discount"
                          sx={{ mt: 1, px: '9px' }} // to be aligned with the checkbox
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box display="flex" flexDirection="column">
                          <Typography variant="subtitle2">
                            Cost per item
                          </Typography>
                          <OutlinedInput
                            fullWidth
                            placeholder="Enter price"
                            value={item?.costPerItem || 0}
                            startAdornment={
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            }
                            type="number"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box display="flex" flexDirection="column">
                          <Typography variant="subtitle2">Profit</Typography>
                          <OutlinedInput
                            fullWidth
                            placeholder="Enter price"
                            value={item?.profit || 0}
                            onChange={(e) =>
                              onUpdatePrice('profit', Number(e.target.value))
                            }
                            sx={{ mt: 1 }}
                            startAdornment={
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            }
                            type="number"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box display="flex" flexDirection="column">
                          <Typography variant="subtitle2">Margin</Typography>
                          <OutlinedInput
                            fullWidth
                            placeholder="Enter price"
                            value={item?.margin || 0}
                            onChange={(e) =>
                              onUpdatePrice('margin', Number(e.target.value))
                            }
                            sx={{ mt: 1 }}
                            startAdornment={
                              <InputAdornment position="start">
                                %
                              </InputAdornment>
                            }
                            type="number"
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </ShadowSection>
                )}
              </>
            )}

            {isFetching ? (
              <Skeleton variant="rectangular" height={100} />
            ) : (
              <>
                {variants?.length === 0 && (
                  <ShadowSection sx={{ mt: 1 }}>
                    <Box display="flex" gap={0.5} alignItems="center">
                      <Checkbox
                        checked={updatedFields.includes('unit') || false}
                        onChange={() => onSelectToUpdateFields('unit')}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        Unit
                      </Typography>
                    </Box>

                    <UnitRadio
                      units={item?.units || []}
                      value={JSON.stringify(item?.inventoryUnit || {})}
                      onChange={(e: any) =>
                        setItem((prevState: any) => ({
                          ...prevState,
                          inventoryUnit: JSON.parse(e.target.value),
                          inventoryUnitId: JSON.parse(e.target.value).id,
                        }))
                      }
                    />
                  </ShadowSection>
                )}
              </>
            )}

            {isFetching ? (
              <Skeleton variant="rectangular" height={100} />
            ) : (
              <ShadowSection sx={{ mt: 1 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    Variants
                  </Typography>
                  {/* <Box display="flex" gap={0.5} flexDirection="column">
                    <Box display="flex" gap={0.5} alignItems="center">
                      <InfoIcon
                        style={{
                          width: '16px',
                          height: '16px',
                          color: grey[600],
                        }}
                      />
                      <Typography variant="subtitle2" sx={{ color: grey[600] }}>
                        Variants can only be bulk updated same inventory item at{' '}
                        <Link
                          href={`/admin/${companyId}/inventory/bulk/selling-items/${item?.inventoryItemId}`}
                        >
                          bulk edit page
                        </Link>
                      </Typography>
                    </Box>
                  </Box> */}

                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setIsOpenEditVariants(true)}
                    startIcon={<EditIcon style={{ width: 15, height: 15 }} />}
                  >
                    Edit Variants
                  </Button>
                </Box>

                {/* <Grid container alignItems="center" spacing={1}>
                  {variants?.map((option: any, index: number) => (
                    <VariantRow
                      key={index}
                      variant={option}
                      item={item}
                      setVariants={setVariants}
                      variants={variants}
                      selectedVariants={selectedVariants}
                      setSelectedVariants={setSelectedVariants}
                    />
                  ))}
                </Grid> */}
                <VariantTable variants={variants} />
              </ShadowSection>
            )}

            {isFetching ? (
              <Skeleton variant="rectangular" height={400} />
            ) : (
              <ShadowSection sx={{ mt: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Listing Categories ({item?.listingCategories?.length || 0})
                </Typography>

                <ListingCategoriesTable
                  listingCategories={item?.listingCategories || []}
                  categoryId={item.categoryId}
                />
              </ShadowSection>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          {isFetching ? (
            <Skeleton variant="rectangular" height={400} />
          ) : (
            <ShadowSection>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Inventory Item
                </Typography>

                <Typography variant="h5" fontWeight={500}>
                  {item?.inventoryItem?.sku
                    ? `${item?.inventoryItem?.sku} | `
                    : ''}
                  {item?.inventoryItem?.name || 'N/A'}
                </Typography>
              </Box>
              <ItemButton
                item={item}
                onClick={() => {}}
                style={{ width: '50%', minWidth: '150px' }}
              />
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Image
                </Typography>

                <Box
                  sx={{
                    position: 'relative',
                    '&:hover': {
                      cursor: 'pointer',
                    },
                  }}
                  onMouseOver={() => setIsImgHovered(true)}
                  onMouseLeave={() => setIsImgHovered(false)}
                >
                  {isImgHovered && (
                    <Button
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 100,
                      }}
                      variant="contained"
                      color="primary"
                      onClick={() => setIsOpenUploadImgModal(true)}
                    >
                      Upload Image
                    </Button>
                  )}
                  <img
                    src={image || ''}
                    alt="Inventory Item"
                    style={{
                      width: '100%',
                      height: 'auto',
                      opacity: isImgHovered ? 0.5 : 1,
                      filter: isImgHovered ? 'blur(2px)' : 'none',
                    }}
                  />
                </Box>
              </Box>
            </ShadowSection>
          )}
        </Grid>
      </Grid>
    </Sidebar>
  );
}
