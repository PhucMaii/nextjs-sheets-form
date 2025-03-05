import React, { Fragment, useMemo, useState } from 'react';
import { convertItemArrayToMap } from '@/app/utils/item';
import { Box, Grid, Typography } from '@mui/material';
import { ItemButton } from '@/app/components/OrderView';
import EditItemType from './EditItemType';
import { infoBackground } from '@/theme/color';
import EditItem from '../components/Modals/edit/EditItem';

// export function Sortable({ item, index }: any) {
//   console.log('item in sortable: ', item);
//   const { ref } = useSortable({ id: item, index });

//   return (
//     <div ref={ref}>
//       {/* <Typography variant="body1" sx={{background: grey[200]}}>{item}</Typography> */}
//       <ItemButton
//         item={item}
//       />
//     </div>
//   );
// }

export default function ItemsGrid({ items, showNotification, category }: any) {
  const [editItemProps, setEditItemProps] = useState<any>({
    open: false,
    item: null,
  });

  const typeFormattedItems = useMemo(() => {
    const result = convertItemArrayToMap(items);

    return result;
  }, [items]);

  return (
    <>
      {editItemProps.open && (
        <EditItem
          open={editItemProps.open}
          onClose={() => setEditItemProps({ open: false, item: null })}
          targetItem={editItemProps.item}
          showNotification={showNotification}
        />
      )}
      <Grid container spacing={1}>
        {(typeFormattedItems?.sortedKeysByPriority || []).map(
          (type, typeIndex: number) => {
            if (type === 'Others') return null;
            return (
              <Fragment key={typeIndex}>
                <Grid item xs={12} mt={2}>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Typography variant="h6">{type}</Typography>
                    <EditItemType
                      showNotification={showNotification}
                      items={typeFormattedItems?.typesObj[type]}
                      category={category}
                      type={
                        typeFormattedItems?.typesObj[type][0]?.inventoryItem
                          ?.type
                      }
                    />
                  </Box>
                </Grid>
                {typeFormattedItems?.typesObj[type]?.map((item: any) => (
                  <Grid item xs={6} sm={4} md={3}>
                    <ItemButton
                      key={item.id}
                      item={item}
                      containerStyle={{
                        backgroundColor:
                          item?.inventoryItem?.color || infoBackground,
                      }}
                      onClick={() => {
                        setEditItemProps({ open: true, item });
                      }}
                    />
                  </Grid>
                ))}
              </Fragment>
            );
          },
        )}

        {typeFormattedItems?.sortedKeysByPriority?.includes('Others') &&
          typeFormattedItems?.typesObj['Others']?.length > 0 && (
            <>
              <Grid item xs={12} mt={2}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="h6">Others</Typography>
                  <EditItemType
                    showNotification={showNotification}
                    items={typeFormattedItems?.typesObj['Others']}
                    category={category}
                    type={{ name: 'Others' }}
                  />
                </Box>
              </Grid>
              {typeFormattedItems?.typesObj['Others']?.map((item: any) => (
                <Grid item xs={6} sm={4} md={3}>
                  <ItemButton
                    key={item.id}
                    item={item}
                    containerStyle={{
                      backgroundColor:
                        item?.inventoryItem?.color || infoBackground,
                    }}
                  />
                </Grid>
              ))}
            </>
          )}
      </Grid>
    </>
  );
}

// model VendorExpense {
//     expenseId Int
//     vendorId  Int

//     expense Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)
//     vendor  Vendor  @relation(fields: [vendorId], references: [id], onDelete: Cascade)

//     @@id([expenseId, vendorId])
//   }
