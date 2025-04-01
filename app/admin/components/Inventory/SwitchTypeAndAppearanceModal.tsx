import {
  AlertColor,
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Modal,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../Modals/styled';
import ModalHead from '@/app/lib/ModalHead';
import { IInventoryItem, IItemType } from '@/app/utils/type';
import { ModalProps } from '../Modals/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { ColorPicker, useColor } from 'react-color-palette';
import { infoBackground, primaryColor } from '@/theme/color';
import { ItemButton } from '@/app/components/OrderView';
import FileUpload from '../FileUpload';
import { generateImgUrl, getAllS3Images } from '@/app/lib/s3';
import { grey } from '@mui/material/colors';
import { Image } from 'lucide-react';

interface IProps extends ModalProps {
  types: IItemType[];
  item: IInventoryItem;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function SwitchTypeAndAppearanceModal({
  open,
  onClose,
  item,
  types,
  showNotification,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<number | null>(
    item?.typeId || null,
  );
  const [itemImage, setItemImage] = useState<string>(item?.image || '');
  const [imageGallery, setImageGallery] = useState<string[]>([]);
  const [isUploadFile, setIsUploadFile] = useState<boolean>(false);

  const [color, setColor] = useColor(item?.color || infoBackground);

  useEffect(() => {
    if (item) {
      setSelectedType(item.typeId);
      setItemImage(item?.image || '');

      const getImageGallery = async () => {
        console.log('running');
        try {
          const images = await getAllS3Images(`products`);
          setImageGallery(images || []);
        } catch (error: any) {
          console.log('There was an error: ', error);
          showNotification('error', 'There was an error: ' + error);
        }
      };

      getImageGallery();
    }
  }, [item]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const actualId = item?.id?.toString().split(' - ')[1];
      const response = await axios.put(
        `${API_URL.ADMIN}/inventory/switch-type`,
        {
          id: Number(actualId),
          typeId: selectedType,
          color: color.hex,
          image: itemImage,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="scroll">
        <ModalHead
          heading={item?.name}
          buttonLabel="Save"
          onClose={onClose}
          onClick={handleSave}
          buttonProps={{ loading: isLoading }}
        />

        <Divider sx={{ my: 2 }} />
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">Appearance: </Typography>
          <ItemButton
            item={{ ...item, price: 15.5, image: itemImage } as any}
            onClick={() => {}}
            style={{ width: 'fit-content', maxWidth: 300 }}
            containerStyle={{ backgroundColor: color.hex }}
          />
        </Box>

        <Typography>Select an image</Typography>
        <Box
          display={'flex'}
          gap={1}
          alignItems="center"
          maxWidth="100%"
          overflow="auto"
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: !itemImage
                ? `3px solid ${primaryColor} `
                : `1px solid ${grey[100]}`,
              borderRadius: '10px',
            }}
            onClick={() => setItemImage('')}
          >
            <Image width={50} height={50} />
          </Box>
          {imageGallery?.map((image: string, index: number) => (
            <img
              key={index}
              src={generateImgUrl(image)}
              alt={item?.name}
              width={100}
              height={100}
              style={{
                cursor: 'pointer',
                border:
                  itemImage === image
                    ? `3px solid ${primaryColor} `
                    : `1px solid ${grey[100]}`,
                borderRadius: '10px',
              }}
              onClick={() => setItemImage(image)}
            />
          ))}
        </Box>

        <Button
          variant="outlined"
          onClick={() => setIsUploadFile(true)}
          sx={{ my: 2 }}
        >
          Upload File
        </Button>

        {isUploadFile && (
          <FileUpload
            showNotification={showNotification}
            fileName={`${item?.name + Date.now()}`}
            uploadLocation={`/products/${item?.name}`}
            onUploadImageUI={(fileKey: string) => {
              setItemImage(fileKey);
            }}
          />
        )}

        <Divider sx={{ my: 2 }} />

        <ColorPicker
          height={100}
          color={color}
          onChange={(color: any) => setColor(color)}
          // hideAlpha
          hideInput={['hsv', 'rgb']}
        />

        <FormControl sx={{ mt: 2 }}>
          <FormLabel>Type</FormLabel>
          <RadioGroup
            value={selectedType}
            onChange={(e: any) => setSelectedType(+e.target.value)}
          >
            {types &&
              types?.map((type: IItemType) => (
                <FormControlLabel
                  key={type.id}
                  value={type.id}
                  control={<Radio />}
                  label={type.name}
                />
              ))}
          </RadioGroup>
        </FormControl>
      </BoxModal>
    </Modal>
  );
}
