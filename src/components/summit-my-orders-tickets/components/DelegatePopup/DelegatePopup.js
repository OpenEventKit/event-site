/**
 * Copyright 2022
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import React, { useState } from 'react'
import { useTranslation } from "react-i18next";
import usePortal from 'react-useportal';

import './delegate-popup.scss';

export const DelegatePopup = ({ isOpen, onAccept, onReject }) => {
    var { Portal } = usePortal();
    const { t } = useTranslation();

    const handleAcceptClick = () => {
        if (onAccept) onAccept();
    };

    const handleRejectClick = () => {
        if (onReject) onReject();
    };

    return (
        <>
            {isOpen && (
                <Portal>
                    <div className="confirm-popup-bg">
                        <div className="confirm-popup">
                            <h4>Delegate Ticket</h4>
                            <p>Delegation will create a new attendee and require to you to fill the first Name, last Name and to answer the extra questions again</p>

                            <div className="buttons">
                                <span onClick={handleRejectClick}>{t("confirm_popup.cancel")}</span>
                                <span onClick={handleAcceptClick}>{t("confirm_popup.accept")}</span>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </>
    );
};
