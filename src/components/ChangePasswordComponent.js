import React, { useState, useEffect } from "react";

import styles from "../styles/change-password.module.scss";

const ChangePasswordComponent = ({ updatePassword }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [displayCurrentPassword, setDisplayCurrentPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [displayNewPassword, setDisplayNewPassword] = useState(false);
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [displayNewPasswordConfirm, setDisplayNewPasswordConfirm] =
    useState(false);
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    return () => {
      setCurrentPassword("");
      setNewPassword("");
      setChangePassword(false);
      setDisplayCurrentPassword(false);
      setDisplayNewPassword(false);
    };
  }, []);

  return (
    <div className={styles.changePassowordContainer}>
      <div className={styles.title}>
        <b>Password</b>{" "}
        <button className="link" onClick={() => setChangePassword(!changePassword)}>
          {changePassword ? "Hide" : "Change password"}
        </button>
      </div>
      {changePassword && (
        <>
          <div className={`columns is-mobile ${styles.passwordFields}`}>
            <div className={`columns column is-full ${styles.inputField}`}>
              <b>Current Password</b>
              <i className={styles.subLabel}>(leave blank if you don't have one)</i>
              <div>
                <input
                  className={`column is-11 ${styles.input} ${styles.isLarge}`}
                  type={displayCurrentPassword ? "text" : "password"}
                  placeholder="Current Password"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  value={currentPassword}
                />
                <button className="link" onClick={() => setDisplayCurrentPassword(!displayCurrentPassword)}>
                  <i className={`fa fa-2x ${displayCurrentPassword ? "fa-eye-slash" : "fa-eye"} icon is-large`} />
                </button>
              </div>
            </div>
            <div className={`columns column is-full ${styles.inputField}`}>
              <b>New Password</b>
              <div>
                <input
                  className={`column is-11 ${styles.input} ${styles.isLarge}`}
                  type={displayNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  value={newPassword}
                />
                <button className="link" onClick={() => setDisplayNewPassword(!displayNewPassword)}>
                  <i className={`fa fa-2x ${displayNewPassword ? "fa-eye-slash" : "fa-eye"} icon is-large`} />
                </button>
              </div>
            </div>
            <div className={`columns column is-full ${styles.inputField}`}>
              <b>Confirm New Password</b>
              <div>
                <input
                  className={`column is-11 ${styles.input} ${styles.isLarge}`}
                  type={displayNewPasswordConfirm ? "text" : "password"}
                  placeholder="Confirm New Password"
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  value={newPasswordConfirm}
                />
                <button className="link" onClick={() => setDisplayNewPasswordConfirm(!displayNewPasswordConfirm)}>
                  <i className={`fa fa-2x ${displayNewPasswordConfirm ? "fa-eye-slash" : "fa-eye"} icon is-large`} />
                </button>
              </div>
            </div>
          </div>
          <div className={`columns is-mobile ${styles.buttons}`}>
            <div className={`column is-full`}>
              <button disabled={!newPassword || !newPasswordConfirm}
                className="button is-large"
                onClick={() => updatePassword(currentPassword, newPassword, newPasswordConfirm)}
              >
                Update
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChangePasswordComponent;
