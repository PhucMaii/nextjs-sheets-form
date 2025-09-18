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
import { getAdminApiUrl } from '@/app/utils/enum';
import { ColorPicker, useColor } from 'react-color-palette';
import { infoBackground, primaryColor } from '@/theme/color';
import { ItemButton } from '@/app/components/OrderView';
import { grey } from '@mui/material/colors';
import { useParams } from 'next/navigation';
import useImageGallery from '@/hooks/useImageGallery';
import Image from 'next/image';
import { PresignedFileUpload } from '@/app/components/PresignedFileUpload';
import DisplayFile from '../Modals/DisplayFile';

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
  const { companyId }: any = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<number | null>(
    item?.typeId || null,
  );
  const [itemImage, setItemImage] = useState<string>(item?.image || '');
  const [uploadedImage, setUploadedImage] = useState<{
    image: string;
    fileKey: string;
  }>({
    image: '',
    fileKey: '',
  });
  // const [imageGallery, setImageGallery] = useState<string[]>([]);
  const [isUploadFile, setIsUploadFile] = useState<boolean>(false);

  // const [imgUrl, setImgUrl] = useState<string>('');

  const [color, setColor] = useColor(item?.color || infoBackground);

  const { selectedImage, renderImageGallery, setSelectedImage } =
    useImageGallery('products', item?.image || '', '100%');


  // reset uploaded image when modal is closed
  useEffect(() => {
    setUploadedImage({
      image: '',
      fileKey: '',
    });
  }, [open]);

  useEffect(() => {
    if (selectedImage) {
      setItemImage(selectedImage);
    }
  }, [selectedImage]);

  // useEffect(() => {
  //   const fetchUrl = async () => {
  //     const url = await generateImgUrl(itemImage, true);
  //     setImgUrl(url);
  //   };
  //   fetchUrl();
  // }, [itemImage]);

  useEffect(() => {
    if (item) {
      setSelectedType(item.typeId);
      setItemImage(item?.image || '');

      // const getImageGallery = async () => {
      //   console.log('running');
      //   try {
      //     const images: any = await getAllS3Images(`products`);

      //     const allImagesPromises = images.map(async (image: string) => {
      //       const url = await generateImgUrl(image);
      //       return url;
      //     });

      //     const allImages = await Promise.all(allImagesPromises);
      //     console.log(allImages, 'allImages');
      //     setImageGallery(allImages || []);
      //   } catch (error: any) {
      //     console.log('There was an error: ', error);
      //     showNotification('error', 'There was an error: ' + error);
      //   }
      // };

      // getImageGallery();
    }
  }, [item]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let image = itemImage;
      if (uploadedImage.fileKey) {
        image = uploadedImage.fileKey;
      }

      const actualId = item?.id?.toString().split(' - ')[1];
      const response = await axios.put(
        `${getAdminApiUrl(companyId, '/inventory/switch-type')}`,
        {
          id: Number(actualId),
          typeId: selectedType,
          color: color.hex,
          image: image,
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
            item={
              {
                ...item,
                price: 15.5,
                image: uploadedImage.fileKey || itemImage,
              } as any
            }
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
            onClick={() => {
              setSelectedImage('');
              setItemImage('');
            }}
          >
            <Image
              src={'/images/not-found.png'}
              width={100}
              height={100}
              alt={item?.name}
              loading="lazy"
            />
          </Box>
          {renderImageGallery()}
          {/* {imageGallery?.map((image: string, index: number) => (
            <img
              key={index}
              src={imgUrl}
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
          ))} */}
        </Box>

        <Button
          variant="outlined"
          onClick={() => setIsUploadFile(true)}
          sx={{ my: 2 }}
        >
          Upload File
        </Button>

        {isUploadFile && (
          <PresignedFileUpload
            location={`products/${item?.name}`}
            maxFiles={1}
            maxSize={10 * 1024 * 1024} // 10MB
            acceptedFileTypes={['image/*']}
            onUploadComplete={(files: any, imgUrl: string) => {
              console.log('Upload complete - files:', files);
              console.log('Upload complete - imgUrl:', imgUrl);
              console.log('Upload complete - fileKey:', files[0].fileKey);

              // If imgUrl is not a proper URL, use the fileKey for DisplayFile components
              const isUrl =
                imgUrl.startsWith('http://') || imgUrl.startsWith('https://');
              const imageValue = isUrl ? imgUrl : files[0].fileKey;

              setItemImage(imageValue);
              setUploadedImage({
                image: imageValue,
                fileKey: files[0].fileKey,
              });
            }}
          />
        )}

        {uploadedImage.fileKey && (
          <Box>
            <Typography>Uploaded Image</Typography>
            <DisplayFile fileKey={uploadedImage.fileKey} isDisableOnClick />
          </Box>
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
