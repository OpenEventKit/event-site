import React, { useState, useRef, useEffect } from "react";
import AvatarEditor from "react-avatar-editor";
import { Box, Typography, Slider, Modal } from "@mui/material";
import { Button, IconButton } from "../ui";
import { styled } from "@mui/system";
import {
  //Close as CloseIcon,
  CameraAlt as CameraAltIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
} from "@mui/icons-material";

const CustomSlider = styled(Slider)(({ theme }) => ({
  color: "var(--color-primary)"
}));

const AvatarEditorModal = ({
  userProfile,
  open,
  changePicture,
  handleClose
}) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const [image, setImage] = useState(userProfile.picture || null);
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [newImage, setNewImage] = useState(false);

  useEffect(() => {
    setImage(userProfile.picture);
  }, [userProfile.picture]);

  const handleNewImage = (e) => {
    setImage(e.target.files[0]);
    setNewImage(true);
  };

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

  const handleSave = () => {
    if (editorRef.current && newImage) {
      const canvas = editorRef.current.getImage().toDataURL();
      fetch(canvas)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "profile-pic.png", { type: blob.type });
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
          <IconButton
            onClick={() => fileInputRef.current.click()}
            sx={{
              position: "absolute",
              top: "79.5%",
              right: "44%",
              color: "#fff"
            }}
          >
            <CameraAltIcon fontSize="inherit" />
          </IconButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            style={{ display: "none" }}
            onChange={handleNewImage}
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
              }
            }>
              Zoom
            </Typography>
            <CustomSlider
              value={scale}
              min={1}
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
          <Button onClick={handleClose}>
            Discard
          </Button>
          <Button onClick={handleSave} disabled={!newImage}>
            Update
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AvatarEditorModal;
