import React, { useState, useRef, useEffect } from "react";
import AvatarEditor from "react-avatar-editor";
import AjaxLoader from "openstack-uicore-foundation/lib/components/ajaxloader";
import { Box, Typography, Slider, Modal } from "@mui/material";
import { Button, IconButton } from "../ui";
import { styled } from "@mui/system";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import { create_UUID } from "@utils/uuidGenerator";

const CustomSlider = styled(Slider)(({ theme }) => ({
  color: "var(--color-primary)"
}));

const getUserProfilePic = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, {
      method: "GET",
      mode: "cors"
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const imageObjectURL = URL.createObjectURL(blob);
    return imageObjectURL;
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error;
  }
};

const AvatarUploadButton = ({
  onUpload,
  ...rest
}) => (
  <IconButton
    onClick={onUpload}
    {...rest}
  >
    <CameraAltIcon fontSize="large" />
  </IconButton>
);

const AvatarEditorContent = ({
  editorRef,
  image,
  newImageSelected,
  onUpload,
  handleSave,
  handleClose
}) => {
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [newImage, setNewImage] = useState(false);

  useEffect(() => {
    if (newImageSelected) {
      setNewImage(true);
    }
  }, [newImageSelected]);

  const handleScale = (e, newValue) => {
    setScale(newValue);
    setNewImage(true);
  };

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    setNewImage(true);
  };

  const rotateLeft = () => {
    setRotate((prev) => prev - 22.5);
    setNewImage(true);
  };

  const rotateRight = () => {
    setRotate((prev) => prev + 22.5);
    setNewImage(true);
  };

  return (
    <>
      <Box
        sx={{
          padding: "20px",
          textAlign: "center",
          position: "relative"
        }}
      >
        <AvatarEditor
          ref={editorRef}
          image={image}
          width={200}
          height={200}
          border={50}
          color={[0, 0, 0, 0.8]}
          position={position}
          onPositionChange={handlePositionChange}
          scale={scale}
          rotate={rotate}
        />
        <AvatarUploadButton
          onUpload={onUpload}
          sx={{
            position: "absolute",
            top: "79.5%",
            right: "45%",
            color: "#fff"
          }}
        />
      </Box>
      <Box
        sx={{
          px: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            justifyContent: "center"
          }}
        >
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontFamily: "var(--font_family)"
            }}
          >
            Zoom
          </Typography>
          <CustomSlider
            value={scale}
            min={0}
            max={2}
            step={0.01}
            onChange={handleScale}
            sx={{ flex: 1, mx: 2 }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontFamily: "var(--font_family)"
            }}
          >
            Rotate
          </Typography>
          <Box
            sx={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              gap: "20px"
            }}
          >
            <IconButton onClick={rotateLeft}>
              <RotateLeftIcon fontSize="inherit" />
            </IconButton>
            <IconButton onClick={rotateRight}>
              <RotateRightIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          backgroundColor: "var(--color_background_light)",
          display: "flex",
          justifyContent: "space-between",
          padding: "20px",
          gap: "20px"
        }}
      >
        <Button onClick={handleClose}>Discard</Button>
        <Button onClick={handleSave} disabled={!newImage}>
          Update
        </Button>
      </Box>
    </>
  );
};

const AvatarEditorModal = ({
  userProfile,
  open,
  changePicture,
  handleClose,
}) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const [image, setImage] = useState(null);
  const [newImageSelected, setNewImageSelected] = useState(false);
  const [loadingPicture, setLoadingPicture] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    setLoadingPicture(true);
    getUserProfilePic(userProfile.picture)
      .then((imageObjectURL) => {
        setImage(imageObjectURL);
        setFetchError(false);
      })
      .catch(() => {
        setFetchError(true);
      })
      .finally(() => {
        setLoadingPicture(false);
      });
  }, [userProfile.picture]);

  const handleNewImage = (e) => {
    setImage(e.target.files[0]);
    setNewImageSelected(true);
    setFetchError(false);
  };

  const handleSave = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImage().toDataURL();
      fetch(canvas)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `${create_UUID()}.png`, {
            type: blob.type
          });
          changePicture(file);
        });
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="avatar-modal-title"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", sm: 400 },
          bgcolor: "var(--color_background_light)",
          color: "var(--color_text_dark)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          border: "1px solid #dbdbdb"
        }}
      >
        <Box
          sx={{
            padding: "7.5px 15px",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #dbdbdb"
          }}
        >
          <Typography
            id="avatar-modal-title"
            component="h2"
            sx={{
              fontWeight: "bold",
              color: "var(--color_text_dark)",
              fontFamily: "var(--font_family)",
              fontSize: "18px"
            }}
          >
            Edit Profile Picture
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              ml: "auto",
              fontSize: "16px",
              padding: 0
            }}
          >
            <i className="fa fa-times" />
          </IconButton>
        </Box>
        <Box>
          <AjaxLoader
            relative={true}
            color={"var(--color_background_light)"}
            show={loadingPicture}
            size={120}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            style={{ display: "none" }}
            onChange={handleNewImage}
          />
          {fetchError ? (
            <Box
                sx={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px"
                }}
              >
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontFamily: "var(--font_family)",
                  color: "var(--color_text_dark)"
                }}
              >
                There was an error retrieving your profile picture.
                Please upload a new one.
              </Typography>
              <AvatarUploadButton
                onUpload={() => fileInputRef.current.click()}
                sx={{
                  color: "var(--color-primary)",
                  border: "1px solid var(--color-primary)",
                  padding: "10px"
                }}
              />
            </Box>
          ) : (
            <AvatarEditorContent
              editorRef={editorRef}
              image={image}
              newImageSelected={newImageSelected}
              onUpload={() => fileInputRef.current.click()}
              handleSave={handleSave}
              handleClose={handleClose}
            />
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default AvatarEditorModal;
