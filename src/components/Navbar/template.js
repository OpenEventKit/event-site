import React, { useState } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar"
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SvgIcon from "@mui/material/SvgIcon";
import Avatar from "@mui/material/Avatar";
import Link from "../Link";
import AnimatedLink from "../AnimatedLink";
import ProfilePopupComponent from "@openeventkit/event-site/src/components/ProfilePopupComponent";
import LogoutButton from "../LogoutButton";

import styles from "../../styles/navbar.module.scss";

import { useLocation } from "@reach/router";
import useMediaQuery from "@mui/material/useMediaQuery";

const MenuIcon = () =>
    <SvgIcon viewBox="0 0 22 18">
      <svg width="22" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1H21" stroke="white" strokeWidth="1.33333" strokeLinecap="square" strokeLinejoin="round"/>
        <path d="M1 9H21" stroke="white" strokeWidth="1.33333" strokeLinecap="square" strokeLinejoin="round"/>
        <path d="M1 17H21" stroke="white" strokeWidth="1.33333" strokeLinecap="square" strokeLinejoin="round"/>
      </svg>
    </SvgIcon>
  ;
  
  const CloseIcon = () =>
    <SvgIcon viewBox="0 0 18 18">
      <svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 1L1 17" stroke="white" strokeWidth="1.33333" strokeLinecap="square" strokeLinejoin="round"/>
        <path d="M1 1L17 17" stroke="white" strokeWidth="1.33333" strokeLinecap="square" strokeLinejoin="round"/>
      </svg>
    </SvgIcon>
  ;
  
  const NavbarTemplate = ({
    data: pages,
    summit,
    isLoggedUser,
    idpLoading,
    idpProfile,
    updateProfile,
    updateProfilePicture,
    defaultPath,
    logo
  }) => {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [anchorElProfile, setAnchorElProfile] = React.useState(null);
    const handleOpenProfile = (event) => {
      setAnchorElProfile(event.currentTarget);
    };
    const handleCloseProfile = () => {
      setAnchorElProfile(null);
    };
    const toggleMenu = (open) => (event) => {
      setMenuOpen(open);
    };
    // needed to identify schedule page, to change sticky breakpoint for fnevent stock breakpoints handling 
    const location = useLocation();
    const isSchedulePage = location.pathname.startsWith("/a/schedule") || location.pathname.startsWith("/a/my-schedule");
    const matchesStockEventSiteDesktopBreakpoint = useMediaQuery("(min-width: 991px)");
    const navbarPosition = matchesStockEventSiteDesktopBreakpoint ? "relative" : "sticky";
    return (
      <>
      <AppBar
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: isSchedulePage ?
            navbarPosition
            :
            {
              xs: "sticky",
              md: "relative"
            }
        }}
      >
        <Container
          sx={{
            px: {
              xs: 2,
              md: 3,
              lg: 4
            }
          }}
          maxWidth="xl"
        >
          <Toolbar
            disableGutters
            sx={{
              minHeight: {
                xs: 46,
                md: 64,
                lg: 84,
                xl: 100
              }
            }}
          >
            {logo &&   
            <Box
              sx={{
                flexGrow: 1,
                display: {
                  xs: "flex"
                },
              }}
            >
              <Link
                to={isLoggedUser ? defaultPath : "/"}
              >
                <Box
                  sx={{
                    img: {
                      height: {
                        xs: 16,
                        lg: 20
                      },
                      width: {
                        xs: 71.89,
                        lg: 89.87
                      }
                    }
                  }}
                >
                  <img
                    src={logo}
                    alt={summit.name}
                  />
                </Box>
              </Link>
            </Box>
            }
            <Box
              sx={{
                flexGrow: 0,
                display: {
                  xs: "flex",
                  md: "none"
                }
              }}
            >
              <IconButton
                aria-label="navigation menu"
                aria-controls="menu-navbar"
                aria-haspopup="true"
                onClick={toggleMenu(!menuOpen)}
                sx={{
                  p: 0,
                  borderRadius: 0,
                  ".MuiTouchRipple-ripple .MuiTouchRipple-child": {
                    borderRadius: 0,
                  }
                }}
              >
                { menuOpen ?
                <CloseIcon />
                :
                <MenuIcon />
                }
              </IconButton>
            </Box>
            <Stack
              direction="row"
              spacing={{
                md: 4
              }}
              sx={{
                flexGrow: 0,
                display: {
                  xs: "none",
                  md: "flex"
                }
              }}
            >
              {pages.map((page) => (
                <AnimatedLink
                  key={page.title}
                  to={page.link}
                >
                  <Typography
                    variant="caption2"
                  >
                    {page.title}
                  </Typography>
                </AnimatedLink>
              ))}
            </Stack>
            {isLoggedUser && idpProfile &&
            <Box
              sx={{
                flexGrow: 0,
                display: {
                  xs: "none",
                  md: "flex"
                },
                ml: 4
              }}
            >
              <Tooltip
                title="Edit Profile"
              >
                <IconButton
                  onClick={handleOpenProfile}
                  sx={{
                    p: 0
                  }}
                >
                  <Avatar
                    alt={idpProfile?.name}
                    src={idpProfile?.picture}
                  />
                </IconButton>
              </Tooltip>
            </Box>
            }
            {isLoggedUser &&
            <Box
              sx={{
                flexGrow: 0,
                display: {
                  xs: "none",
                  md: "flex"
                },
                ml: 1
              }}
            >
              <LogoutButton
                isLoggedUser={isLoggedUser}
                styles={styles}
              />
            </Box>
            }
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        anchor="top"
        open={menuOpen}
        onClick={toggleMenu(false)}
        ModalProps={{
          // Better open performance on mobile.
          keepMounted: true
        }}
        sx={{
          display: {
            xs: "flex",
            md: "none"
          },
          flexShrink: 0,
          [`& .${drawerClasses.paper}`]: {
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            backgroundColor: "black"
          }
        }}
      >
        <Toolbar
          style={{
            minHeight: 46
          }}
        />
        <Stack
          direction="column"
          spacing={4}
          sx={{
            py: 6,
            pl: 2
          }}
        >
          {pages.map((page) => (
          <AnimatedLink
            key={page.title}
            to={page.link}
            style={{
              width: "fit-content"
            }}
          >
            <Typography
              variant="caption1"
            >
              {page.title}
            </Typography>
          </AnimatedLink>
          ))}
          {isLoggedUser && idpProfile &&
          <Box>
            <IconButton
              onClick={handleOpenProfile}
              sx={{
                p: 0
              }}
            >
              <Avatar
                alt={idpProfile?.name}
                src={idpProfile?.picture}
              />
            </IconButton>
          </Box>
          }
          {isLoggedUser &&
          <Box>
            <LogoutButton
              sx={{
                p: 0
              }}
              isLoggedUser={isLoggedUser}
              styles={styles}
            />
          </Box>
          }
        </Stack>
      </Drawer>
      {isLoggedUser && idpProfile &&
      <ProfilePopupComponent
        userProfile={idpProfile}
        showProfile={Boolean(anchorElProfile)}
        idpLoading={idpLoading}
        changePicture={updateProfilePicture}
        changeProfile={updateProfile}
        closePopup={handleCloseProfile}
        style={{
          zIndex: 10000
        }}
      />
      }
      </>
    );
  }
  export default NavbarTemplate;
  