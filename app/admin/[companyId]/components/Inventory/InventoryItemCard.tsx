import { IInventoryItem } from '@/app/utils/type';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Typography,
  alpha,
  Divider,
  Collapse,
  Stack,
  Tooltip,
  Avatar,
  Grid,
  useMediaQuery,
  Skeleton,
} from '@mui/material';
import React, { memo, useCallback, useMemo, useState } from 'react';
import DeleteModal from '../Modals/delete/DeleteModal';
import { EditIcon, Package, ExternalLink } from 'lucide-react';
import { ItemType } from '@prisma/client';
import { useRouter } from 'next/navigation';

// Skeleton Loading Component
export const InventoryItemCardSkeleton = () => {
  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  return (
    <Card
      sx={{
        mb: 2,
        border: `1px solid ${alpha('#000', 0.08)}`,
        borderRadius: 1,
        boxShadow: 'none',
        backgroundColor: '#fff',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header Row Skeleton */}
        <Grid container alignItems="center" mb={2} spacing={2}>
          <Grid item xs={1} sm={2} md={0.5}>
            <Skeleton variant="circular" width={24} height={24} />
          </Grid>

          {mdDown && (
            <Grid
              item
              xs={11}
              sm={10}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Skeleton variant="rounded" width={80} height={24} />
              <Box display="flex" alignItems="center" gap={1}>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
              </Box>
            </Grid>
          )}

          <Grid item xs={12} md={10}>
            <Box display="flex" alignItems="center" gap={2} flex={1}>
              <Skeleton variant="circular" width={48} height={48} />

              <Box flex={1} minWidth={0}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Skeleton variant="text" width={200} height={28} />
                  {!mdDown && (
                    <Skeleton variant="rounded" width={80} height={24} />
                  )}
                </Box>

                <Box display="flex" gap={3} alignItems="center">
                  <Skeleton variant="text" width={120} height={20} />
                  <Skeleton variant="text" width={150} height={20} />
                </Box>
              </Box>
            </Box>
          </Grid>

          {!mdDown && (
            <Grid
              item
              md={1.5}
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={1}
            >
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Grid>
          )}
        </Grid>

        {/* Key Metrics Skeleton */}
        <Box
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(4, 1fr)' }}
          gap={2}
          mb={2}
        >
          {/* Quantity */}
          <Box>
            <Skeleton variant="text" width={60} height={16} sx={{ mb: 0.5 }} />
            <Box display="flex" alignItems="center" gap={1}>
              <Skeleton variant="text" width={80} height={24} />
              <Skeleton variant="circular" width={20} height={20} />
            </Box>
          </Box>

          {/* Total Value */}
          <Box>
            <Skeleton variant="text" width={80} height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={60} height={24} />
          </Box>

          {/* Listings */}
          <Box>
            <Skeleton variant="text" width={60} height={16} sx={{ mb: 0.5 }} />
            <Box display="flex" alignItems="center" gap={1}>
              <Skeleton variant="text" width={20} height={24} />
              <Skeleton variant="rounded" width={50} height={28} />
            </Box>
          </Box>

          {/* Type */}
          <Box>
            <Skeleton variant="text" width={40} height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="rounded" width={120} height={40} />
          </Box>
        </Box>

        {/* Vendor Information Skeleton (collapsed state) */}
        <Divider sx={{ my: 2 }} />
        <Box>
          <Skeleton variant="text" width={150} height={20} sx={{ mb: 2 }} />
          <Box
            sx={{
              p: 2,
              bgcolor: alpha('#000', 0.02),
              borderRadius: 2,
              border: `1px solid ${alpha('#000', 0.06)}`,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Skeleton variant="text" width={180} height={20} />
              <Skeleton variant="rounded" width={60} height={24} />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

interface IProps {
  item: IInventoryItem;
  isSelected: boolean;
  onSelect: (e: any) => void;
  onEdit: () => void;
  onViewBatch: () => void;
  onDelete: (e: any, item: IInventoryItem) => Promise<void>;
  itemTypes: ItemType[];
  onChangeType: (typeId: number) => void;
  companyId: string;
}

// Enhanced Item Card Component
const InventoryItemCard = ({
  item,
  isSelected,
  onSelect,
  onEdit,
  onViewBatch,
  onDelete,
  itemTypes,
  onChangeType,
  companyId,
}: IProps) => {
  //   const isSelected = selectedItems.some((i) => i.id === item.id);

  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  // Get primary unit
  // let unit = null;
  // for (const vendorItem of item.vendorItem) {
  //   unit = vendorItem.unit.find((vUnit: any) => vUnit?.ratio === 1);
  //   if (unit) break;
  // }
  const unit = useMemo(() => {
    if (!item?.vendorItem) return null;
    for (const vendorItem of item.vendorItem) {
      const unit = vendorItem.unit.find((vUnit: any) => vUnit?.ratio === 1);
      if (unit) return unit;
    }
    return null;
  }, [item.vendorItem]);

  // Get stock status
  const getStockStatus = useCallback(() => {
    if (item.quantity <= 0)
      return {
        label: 'Out of Stock',
        color: '#EF4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
      };
    if (item.quantity < 10)
      return {
        label: 'Low Stock',
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.1)',
      };
    return {
      label: 'In Stock',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    };
  }, [item.quantity]);

  const stockStatus = useMemo(() => {
    if (!item)
      return {
        label: 'N/A',
        color: '#9CA3AF',
        bgColor: 'rgba(156, 163, 175, 0.1)',
      };
    const stockStatus = getStockStatus();
    return stockStatus;
  }, [item?.quantity]);

  const collapsibleContent = useMemo(() => {
    return (
      <Collapse in={expanded}>
        <Divider sx={{ my: 2 }} />
        <Box>
          {item?.isInternal ? (
            // Automation Rules for Internal Items
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={2}>
                Automation Rules
              </Typography>
              {item?.subtractRules && item.subtractRules.length > 0 ? (
                <Stack spacing={2}>
                  {item.subtractRules.map((rule: any, index: number) => (
                    <Box
                      key={rule.id || index}
                      sx={{
                        p: 2.5,
                        bgcolor: alpha('#000', 0.02),
                        borderRadius: 2,
                        border: `1px solid ${alpha('#000', 0.06)}`,
                        position: 'relative',
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={1.5}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          Rule #{index + 1}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={rule.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={rule.isActive ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          p: 2,
                          bgcolor: alpha('#000', 0.02),
                          borderRadius: 1.5,
                          border: '1px dashed',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          <strong>Subtract {rule.subtractQty}</strong>{' '}
                          quantity{' '}
                          {rule.dependentInventoryItemId &&
                          rule.dependentInventoryItem ? (
                            <>
                              when{' '}
                              <strong>
                                {rule.dependentInventoryItem.name}
                              </strong>{' '}
                              is used
                              {rule.relationalQty && (
                                <>
                                  {' '}
                                  with <strong>
                                    {rule.relationalQty}
                                  </strong>{' '}
                                  quantity
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <strong>{rule.frequency}</strong>
                            </>
                          )}
                        </Typography>
                      </Box>

                      {/* Rule Details */}
                      <Box
                        display="grid"
                        gridTemplateColumns={{
                          xs: '1fr',
                          sm: 'repeat(2, 1fr)',
                        }}
                        gap={1.5}
                        mt={1.5}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={500}
                          >
                            SUBTRACT QTY
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {rule.subtractQty}
                          </Typography>
                        </Box>

                        {rule.dependentInventoryItemId &&
                        rule.dependentInventoryItem ? (
                          <>
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={500}
                              >
                                DEPENDENT ITEM
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                noWrap
                              >
                                {rule.dependentInventoryItem.name}
                              </Typography>
                            </Box>
                            {rule.relationalQty && (
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight={500}
                                >
                                  RELATIONAL QTY
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  {rule.relationalQty}
                                </Typography>
                              </Box>
                            )}
                          </>
                        ) : (
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={500}
                            >
                              FREQUENCY
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {rule.frequency}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: alpha('#000', 0.02),
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No automation rules configured
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: 'block' }}
                  >
                    Edit this item to add automation rules
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            // Vendor Information for Regular Items
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={2}>
                Vendor Information
              </Typography>
              <Stack spacing={1}>
                {item?.vendorItem?.map((vItem: any, index: number) => {
                  const smallestUnit = vItem?.unit.find(
                    (unit: any) => unit?.ratio === 1,
                  );
                  return (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        bgcolor: alpha('#000', 0.02),
                        borderRadius: 2,
                        border: `1px solid ${alpha('#000', 0.06)}`,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" fontWeight={500}>
                          {`${vItem?.supplierSku ? vItem?.supplierSku : 'N/A'} - ${
                            vItem?.vendor?.name
                          }`}
                        </Typography>
                        <Chip
                          label={`$${smallestUnit?.unitPrice}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Box>
      </Collapse>
    );
  }, [item.vendorItem, item.isInternal, item.subtractRules, expanded]);

  const keyMetrics = useMemo(() => {
    // If item is internal, show different metrics
    // if (item?.isInternal) {
    //   return (
    //     <Box
    //       display="grid"
    //       gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }}
    //       gap={2}
    //       mb={2}
    //     >
    //       <Box>
    //         <Typography variant="caption" color="text.secondary" fontWeight={500}>
    //           QUANTITY
    //         </Typography>
    //         <Box display="flex" alignItems="center" gap={1}>
    //           <Typography variant="h6" fontWeight={600}>
    //             {item?.quantity} {unit?.unit}
    //           </Typography>
    //           <Tooltip title="Edit Batches">
    //             <IconButton size="small" onClick={onViewBatch}>
    //               <EditIcon size={14} />
    //             </IconButton>
    //           </Tooltip>
    //         </Box>
    //       </Box>

    //       <Box>
    //         <Typography variant="caption" color="text.secondary" fontWeight={500}>
    //           TOTAL VALUE
    //         </Typography>
    //         <Typography variant="h6" fontWeight={600}>
    //           ${item?.totalValue?.toFixed(2)}
    //         </Typography>
    //       </Box>

    //       <Box display="flex" flexDirection="column">
    //         <Typography variant="caption" color="text.secondary" fontWeight={500}>
    //           TYPE
    //         </Typography>
    //         <Select
    //           value={item?.typeId || 0}
    //           onChange={(e) => onChangeType(Number(e.target.value))}
    //           size="small"
    //           sx={{ minWidth: 120 }}
    //           onClick={(e: any) => e.stopPropagation()}
    //         >
    //           {itemTypes.map((type: ItemType) => (
    //             <MenuItem key={type.id} value={type.id}>
    //               {type.name}
    //             </MenuItem>
    //           ))}
    //           <MenuItem value={0}>N/A</MenuItem>
    //         </Select>
    //       </Box>
    //     </Box>
    //   );
    // }

    // Regular metrics for non-internal items
    return (
      <Box
        display="grid"
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(4, 1fr)' }}
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            QUANTITY
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={600}>
              {item?.quantity} {unit?.unit}
            </Typography>
            <Tooltip title="Edit Batches">
              <IconButton size="small" onClick={onViewBatch}>
                <EditIcon size={14} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            TOTAL VALUE
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            ${item?.totalValue?.toFixed(2)}
          </Typography>
        </Box>

        {!item.isInternal && (
          <>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                LISTINGS
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6" fontWeight={600}>
                  {item?.listingCategories?.length || 0}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ExternalLink size={14} />}
                  onClick={(e: any) => {
                    e.stopPropagation();
                    router.push(
                      `/admin/${companyId}/inventory/bulk/selling-items/${item.id}`,
                    );
                  }}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    px: 1,
                    py: 0.5,
                    minWidth: 'auto',
                  }}
                >
                  Edit
                </Button>
              </Box>
            </Box>

            <Box display="flex" flexDirection="column">
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                TYPE
              </Typography>
              <Select
                value={item?.typeId || 0}
                onChange={(e) => onChangeType(Number(e.target.value))}
                size="small"
                sx={{ minWidth: 120 }}
                onClick={(e: any) => e.stopPropagation()}
              >
                {itemTypes.map((type: ItemType) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
                <MenuItem value={0}>N/A</MenuItem>
              </Select>
            </Box>
          </>
        )}
      </Box>
    );
  }, [item, unit]);

  const headerRow = useMemo(() => {
    return (
      <Grid
        container
        alignItems="center"
        // justifyContent="space-between"
        mb={2}
        spacing={2}
      >
        <Grid item xs={1} sm={2} md={0.5}>
          <Checkbox checked={isSelected} onClick={onSelect} sx={{ p: 0 }} />
        </Grid>

        {mdDown && (
          <Grid
            item
            xs={11}
            sm={10}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              {item?.isInternal && (
                <Chip
                  label="Internal"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              )}
              <Chip
                label={stockStatus.label}
                size="small"
                sx={{
                  bgcolor: stockStatus.bgColor,
                  color: stockStatus.color,
                  fontWeight: 500,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title="Edit Item">
                <IconButton size="small" onClick={onEdit}>
                  <EditIcon size={18} />
                </IconButton>
              </Tooltip>
              <DeleteModal
                includedButton
                targetObj={item}
                handleDelete={(e) => onDelete(e, item)}
                showTargetObj={item.name}
              />
            </Box>
          </Grid>
        )}

        <Grid item xs={12} md={10}>
          <Box display="flex" alignItems="center" gap={2} flex={1}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: alpha(stockStatus.color, 0.1),
                color: stockStatus.color,
              }}
            >
              <Package size={24} />
            </Avatar>

            <Box flex={1} minWidth={0}>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Typography variant="h6" fontWeight={600} noWrap>
                  {item.name}
                </Typography>
                {item?.isInternal && (
                  <Chip
                    label="Internal"
                    size="small"
                    color="warning"
                    variant="outlined"
                    sx={{
                      fontWeight: 500,
                      fontSize: '0.7rem',
                      height: 20,
                    }}
                  />
                )}
                {!mdDown && (
                  <Chip
                    label={stockStatus.label}
                    size="small"
                    sx={{
                      bgcolor: stockStatus.bgColor,
                      color: stockStatus.color,
                      fontWeight: 500,
                      fontSize: '0.75rem',
                    }}
                  />
                )}
              </Box>

              <Box display="flex" gap={3} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  SKU: <strong>{item?.sku || 'N/A'}</strong>
                </Typography>
                {item?.supplierSku && (
                  <Typography variant="body2" color="text.secondary">
                    Supplier: <strong>{item.supplierSku}</strong>
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>

        {!mdDown && (
          <Grid
            item
            md={1.5}
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            gap={1}
          >
            <Tooltip title="Edit Item">
              <IconButton
                size="small"
                onClick={(e: any) => {
                  e.stopPropagation();
                  router.push(`/admin/${companyId}/inventory/${item.id}`);
                }}
              >
                <EditIcon size={18} />
              </IconButton>
            </Tooltip>
            <DeleteModal
              includedButton
              targetObj={item}
              handleDelete={(e) => onDelete(e, item)}
              showTargetObj={item.name}
            />
          </Grid>
        )}
      </Grid>
    );
  }, [item, isSelected]);

  return (
    <Card
      sx={{
        mb: 2,
        border: `1px solid ${isSelected ? '#3B82F6' : alpha('#000', 0.08)}`,
        borderRadius: 1,
        boxShadow: 'none',
        backgroundColor: isSelected ? alpha('#3B82F6', 0.02) : '#fff',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#3B82F6',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
          transform: 'translateY(-1px)',
        },
      }}
      onClick={() => setExpanded((prev) => !prev)}
    >
      <CardContent sx={{ p: 3 }}>
        {headerRow}
        {keyMetrics}
        {collapsibleContent}
      </CardContent>
    </Card>
  );
};

export default memo(InventoryItemCard, (prev, next) => {
  return (
    JSON.stringify(prev.item) === JSON.stringify(next.item) &&
    prev.isSelected === next.isSelected
  );
});
