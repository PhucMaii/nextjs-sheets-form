import { IItem } from '@/app/utils/type';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Button, Grid, IconButton, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { ItemButton } from '@/app/components/OrderView';
import { infoBackground } from '@/theme/color';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { PlusIcon } from 'lucide-react';

export const SortableItemType = ({
  type,
  children,
  dndMode,
  renderField,
}: {
  type: any;
  children: any;
  dndMode: boolean;
  renderField?: string;
}) => {
  if (!type) {
    return;
  }
  // const id = type?.id?.split(' - ')[1];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: type.id, data: { type: 'container' } });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    boxShadow: isDragging ? 'rgba(0, 0, 0, 0.35) 0px 5px 15px' : '',
    backgroundColor: isDragging ? grey[50] : undefined,
    opacity: isDragging ? 0.5 : 1,
    padding: '10px',
    borderRadius: '15px',
  };
  return (
    <div ref={setNodeRef} {...attributes} style={style}>
      <Box
        display="flex"
        flexDirection="row"
        gap={1}
        alignItems="center"
        justifyContent="space-between"
      >
        <Box display="flex" flexDirection="column">
          <Typography
            variant="h6"
            sx={
              type.id.includes('promotion')
                ? {
                    // px: 2,
                    py: 2,
                    color: '#ff4081',
                    animation: 'flash 1s infinite ease-in-out',
                    '@keyframes flash': {
                      '0%, 100%': {
                        opacity: 1,
                      },
                      '50%': {
                        opacity: 0.8,
                      },
                    },
                  }
                : {}
            }
          >
            {renderField ? type[renderField] : type.name}{' '}
            {type.id.includes('promotion') && '🎉'}
          </Typography>
          {type.id.includes('promotion') && !type?.visibility && (
            <Box display="flex" flexDirection="row" gap={1} alignItems={'center'}>
              <VisibilityOffIcon fontSize="small" sx={{ color: grey[600] }} />
              <Typography variant="body2" sx={{color: grey[600], fontWeight: 'medium'}}>
                Hidden from customers. Will show when the layout is saved
              </Typography>
            </Box>
          )}
        </Box>
        {/* <Typography variant="h6">{renderField ? type[renderField] : type.name}</Typography> */}
        {dndMode && (
          <IconButton {...(dndMode ? listeners : {})}>
            <DragIndicatorIcon />
          </IconButton>
        )}
      </Box>
      <Grid container mt={2}>
        {children}
      </Grid>
    </div>
  );
};

export const SortableItem = ({
  item,
  dndMode,
  onOpenSwitchType,
  onRemove,
}: {
  item: any;
  dndMode: boolean;
  onOpenSwitchType: any;
  onRemove?: any;
}) => {
  if (!item) {
    return;
  }
  // const id = item?.id?.split(' - ')[1];
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: item.id,
    data: { type: 'item' },
  });

  const style = {
    transition: 'none',
    // transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Grid
      ref={setNodeRef}
      {...attributes}
      {...(dndMode ? listeners : {})}
      style={style}
      item
      xs={6}
      // md={4}
      // lg={3}
    >
      <ItemButton
        item={{ ...item, price: 11 } as IItem}
        containerStyle={{
          backgroundColor: item?.color || infoBackground,
        }}
        onClick={() => {
          if (dndMode) return;
          onOpenSwitchType(item);
        }}
        onRemove={onRemove}
      />
    </Grid>
  );
};

export const SortableEmptyItem = ({ item, onClick }: any) => {
  const { attributes, setNodeRef } = useSortable({
    id: item.id,
    data: { type: 'empty' },
  });

  const style = {
    transition: 'none',
  };

  return (
    <Grid
      ref={setNodeRef}
      {...attributes}
      style={style}
      item
      xs={6}
      // md={4}
      // lg={3}
    >
      <Button sx={{ width: '100%', height: '100%' }} onClick={onClick}>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: grey[100],
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <PlusIcon style={{ width: 50, height: 50, color: grey[600] }} />
        </Box>
      </Button>
    </Grid>
  );
};
