import React from "react";
import { navigate } from "gatsby";
import { triggerLogoutEvent } from "@utils/eventTriggers";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";

export default class
  LogoutButton extends React.Component {

  onClickLogout() {
    triggerLogoutEvent();
    navigate("/auth/logout", {
      state: {
        backUrl: window.location.pathname
      }
    })
  }

  render() {
    let { isLoggedUser, styles, ...rest } = this.props;

    if (isLoggedUser) {
      return (
        <IconButton
          aria-label="logout"
          onClick={this.onClickLogout}
          styles={styles}
          {...rest}
        >
          <LogoutIcon 
            sx={{
              color: "white",
              fontSize: {
                xs: 18,
                lg: 19
              },
              padding: {
                xs: 0
              }
            }}
          />
        </IconButton>
      );
    } else {
      return null;
    }
  }
}