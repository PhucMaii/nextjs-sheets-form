import FileUpload from '@/app/admin/[companyId]/components/FileUpload';
import { getAllS3Images } from '@/app/lib/s3';
import { primaryColor } from '@/theme/color';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import useNotification from './useNotification';
import DisplayFile from '@/app/admin/[companyId]/components/Modals/DisplayFile';

const useImageGallery = (
  from: string = '',
  initialSelectedImage: string = '',
  width: string | number,
  folder: string = '',
  isIncludeUploadImg: boolean = false,
) => {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] =
    useState<string>(initialSelectedImage);

  useEffect(() => {
    const getImages = async () => {
      const images = await getAllS3Images(from);
      setGalleryImages(images || []);
    };

    getImages();
  }, []);

  const { showNotification } = useNotification();

  const onSelectImage = (image: string) => {
    setSelectedImage(() => (image === selectedImage ? '' : image));
  };

  const renderImageGallery = () => (
    <Box
      sx={{
        width,
      }}
    >
      <Box
        display="flex"
        gap={1}
        sx={{
          whitespace: 'nowrap',
          paddingBottom: 2,
          width,
          overflowX: 'auto', // Enables horizontal scrolling
          whiteSpace: 'nowrap', // Prevents wrapping
        }}
      >
        {galleryImages.length > 0 &&
          galleryImages.map((image: any, key: number) => (
            <Box
              onClick={() => onSelectImage(image)}
              key={key}
              sx={{
                '&:hover': {
                  boxShadow:
                    ' rgba(255, 255, 255, 0.1) 0px 1px 1px 0px inset, rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;',
                },
              }}
              //   sx={{
              //     borderRadius: '10px',
              //     cursor: 'pointer',
              //     border: selectedImage === image ? `2px solid ${primaryColor}` : 'none',
              //   }}
            >
              {/* <img
                key={key}
                src={generateImgUrl(image)}
                alt={image}
                width={100}
                height={100}
                style={{
                  borderRadius: '10px',
                  border:
                    selectedImage === image
                      ? `4px solid ${primaryColor}`
                      : 'none',
                }}
              /> */}
              <DisplayFile
                fileKey={image}
                width="100px"
                height="100px"
                style={{
                  borderRadius: '10px',
                  border:
                    selectedImage === image
                      ? `4px solid ${primaryColor}`
                      : 'none',
                }}
              />
            </Box>
          ))}
      </Box>

      {isIncludeUploadImg && (
        <FileUpload
          showNotification={showNotification}
          fileName={`${folder + Date.now()}`}
          uploadLocation={`products/export/${folder} + ${Date.now()}`}
          onUploadImageUI={(fileKey: string) => {
            setSelectedImage(fileKey);
          }}
        />
      )}
    </Box>
  );

  return {
    galleryImages,
    selectedImage,
    renderImageGallery,
  };
};

export default useImageGallery;
