import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { navigate } from 'gatsby'
import { connect } from 'react-redux'
import AjaxLoader from 'openstack-uicore-foundation/lib/components/ajaxloader'
import CountryInput from 'openstack-uicore-foundation/lib/components/inputs/country-input'
import LanguageInput from 'openstack-uicore-foundation/lib/components/inputs/language-input'
import DateTimePicker from 'openstack-uicore-foundation/lib/components/inputs/datetimepicker'
import moment from "moment-timezone";

import Swal from 'sweetalert2';

import Layout from '../components/Layout'
import withOrchestra from "../utils/widgetOrchestra";

import LiteScheduleComponent from '../components/LiteScheduleComponent'
import ProfilePopupComponent from '../components/ProfilePopupComponent'
import ChangePasswordComponent from '../components/ChangePasswordComponent';

import { updateProfilePicture, updateProfile, getIDPProfile, updatePassword } from '../actions/user-actions'

import styles from '../styles/full-profile.module.scss'

import "openstack-uicore-foundation/lib/css/components/inputs/datetimepicker.css";

export const FullProfilePageTemplate = ({ user, getIDPProfile, updateProfile, updateProfilePicture, updatePassword }) => {

    const [showProfile, setShowProfile] = useState(false);
    const [personalProfile, setPersonalProfile] = useState({
        firstName: '',
        lastName: '',
        identifier: '',
        email: '',
        company: '',
        jobTitle: '',
        birthday: null,
        gender: '',
        specifyGender: '',
        github: '',
        irc: '',
        linkedin: '',
        twitter: '',
        language: ''
    });

    const [showFullName, setShowFullName] = useState(false);
    const [allowChatWithMe, setAllowChatWithMe] = useState(false)
    const [showEmail, setShowEmail] = useState(false);
    const [bio, setBio] = useState('');
    const [statementOfInterest, setStatementOfInterest] = useState('');

    const [address, setAddress] = useState({
        street: '',
        floor: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: ''
    });

    const [image, setImage] = useState(null);

    useEffect(() => {
        handleTogglePopup();
        if (!user.idpProfile) {
            getIDPProfile();
        } else {
            setImage(user.idpProfile.picture);
            let birthdate = user.idpProfile.birthdate ?
                moment.tz(user.idpProfile.birthdate.date, user.idpProfile.birthdate.timezone || 'UTC') : null;
            setPersonalProfile({
                firstName: user.idpProfile.given_name || '',
                lastName: user.idpProfile.family_name || '',
                identifier: user.idpProfile.nickname || '',
                email: user.idpProfile.email || '',
                company: user.idpProfile.company || '',
                jobTitle: user.idpProfile.job_title || '',
                birthday: birthdate,
                gender: user.idpProfile.gender || '',
                specifyGender: user.idpProfile.gender_specify,
                irc: user.idpProfile.irc || '',
                github: user.idpProfile.github_user || '',
                twitter: user.idpProfile.twitter_name || '',
                linkedin: user.idpProfile.linked_in_profile || '',
                language: user.idpProfile.locale || ''
            });
            setShowFullName(user.idpProfile.public_profile_show_fullname);
            setAllowChatWithMe(user.idpProfile.public_profile_allow_chat_with_me);
            setShowEmail(user.idpProfile.public_profile_show_email);
            setBio(user.idpProfile.bio || '');
            setStatementOfInterest(user.idpProfile.statement_of_interest || '');
            setAddress({
                street: user.idpProfile.address1 || '',
                floor: user.idpProfile.address2 || '',
                city: user.idpProfile.locality || '',
                state: user.idpProfile.region || '',
                zipCode: user.idpProfile.postal_code || '',
                country: user.idpProfile.country || '',
                phone: user.idpProfile.phone_number || ''
            });
        }
        return () => {
            setPersonalProfile({
                firstName: '',
                lastName: '',
                company: ''
            });
        };
    }, [user.idpProfile, getIDPProfile]);

    const handlePictureUpdate = (picture) => {
        updateProfilePicture(picture);
    };

    const handleProfileUpdate = (fromPopup) => {
        if (fromPopup) {
            updateProfile(fromPopup)
        } else {
            if (!personalProfile.firstName || !personalProfile.lastName || !personalProfile.identifier || !personalProfile.email) {
                const msg = `Required field missing`;
                Swal.fire("Validation error", msg, "warning");
            } else {
                const newProfile = {
                    first_name: personalProfile.firstName,
                    last_name: personalProfile.lastName,
                    identifier: personalProfile.identifier,
                    email: personalProfile.email,
                    company: personalProfile.company,
                    job_title: personalProfile.jobTitle,
                    birthday: personalProfile.birthday?.unix(),
                    gender: personalProfile.gender,
                    gender_specify: personalProfile.gender === 'Specify' ? personalProfile.specifyGender : null,
                    github_user: personalProfile.github,
                    irc: personalProfile.irc,
                    linked_in_profile: personalProfile.linkedin,
                    twitter_name: personalProfile.twitter,
                    language: personalProfile.language,
                    public_profile_show_fullname: showFullName,
                    public_profile_allow_chat_with_me: allowChatWithMe,
                    public_profile_show_email: showEmail,
                    bio: bio,
                    statement_of_interest: statementOfInterest,
                    address1: address.street,
                    address2: address.floor,
                    city: address.city,
                    state: address.state,
                    post_code: address.zipCode,
                    country_iso_code: address.country,
                    phone_number: address.phone,
                };
                updateProfile(newProfile);
            }
        }
    };

    const handlePasswordUpdate = (current_password, password, password_confirmation) => {
        const passwordObject = {
            current_password,
            password,
            password_confirmation
        };
        updatePassword(passwordObject);
    };

    const handleTogglePopup = (profile) => {
        if (profile) {
            document.body.classList.add('is-clipped');
        } else {
            document.body.classList.remove('is-clipped');
        }
        setShowProfile(profile)
    };

    const onEventChange = (ev) => {
        navigate(`/a/event/${ev.id}`);
    };

    const onViewAllEventsClick = () => {
        navigate('/a/my-schedule')
    };

    const discardChanges = (state) => {
        switch (state) {
            case 'profile':
                let birthdate = user.idpProfile.birthdate ?
                    moment.tz(user.idpProfile.birthdate.date, user.idpProfile.birthdate.timezone || 'UTC') : null;
                setPersonalProfile({
                    firstName: user.idpProfile.given_name,
                    lastName: user.idpProfile.family_name,
                    identifier: user.idpProfile.nickname || '',
                    email: user.idpProfile.email || '',
                    company: user.idpProfile.company || '',
                    jobTitle: user.idpProfile.job_title || '',
                    birthday: birthdate,
                    gender: user.idpProfile.gender || '',
                    specifyGender: user.idpProfile.gender_specify,
                    github: user.idpProfile.github_user || '',
                    irc: user.idpProfile.irc || '',
                    linkedin: user.idpProfile.linked_in_profile || '',
                    twitter: user.idpProfile.twitter_user || '',
                    language: user.idpProfile.locale || ''
                });
                setShowFullName(user.idpProfile.public_profile_show_fullname);
                setAllowChatWithMe(user.idpProfile.public_profile_allow_chat_with_me);
                setShowEmail(user.idpProfile.public_profile_show_email);
                break;
            case 'bio':
                setBio(user.idpProfile.bio || '');
                break;
            case 'statementOfInterest':
                setStatementOfInterest(user.idpProfile.statement_of_interest || '');
                break;
            case 'address':
                setAddress({
                    street: user.idpProfile.street_address || '',
                    floor: user.idpProfile.street_address2 || '',
                    city: user.idpProfile.locality || '',
                    state: user.idpProfile.region || '',
                    zipCode: user.idpProfile.postal_code || '',
                    country: user.idpProfile.country || '',
                    phone: user.idpProfile.phone_number || ''
                });
                break;
            default:
                return;
        }
    };
    return (
        <React.Fragment>
            <AjaxLoader relative={false} color={'#ffffff'} show={user.loadingIDP} size={120} />
            <div className="px-6 py-6 mb-6">
                <div className={`columns is-3 ${styles.fullProfile}`} >
                    <div className="column is-3">
                        <button className="link" onClick={() => handleTogglePopup(!showProfile)}>
                            <div className={styles.profilePicture}>
                                <img alt="profile pic" src={image} />
                                <div className={styles.imageUpload}>
                                    <i className={`${styles.pictureIcon} fa fa-2x fa-pencil icon is-large`} />
                                </div>
                            </div>
                        </button>
                        <h3>
                            Hello, <br />
                            {user.idpProfile.given_name} {user.idpProfile.family_name}
                        </h3>
                        <h4>
                            @{user.idpProfile?.nickname}
                        </h4>
                        <ChangePasswordComponent updatePassword={handlePasswordUpdate} />
                    </div>
                    <div className="column">
                        <div className={styles.formContainer}>
                            <div className={styles.header}>Personal Profile</div>
                            <div className={styles.form}>
                                <div className={`columns is-mobile ${styles.inputRow}`}>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>First Name *</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge} ${!personalProfile.firstName ? styles.isDanger : ''}`}
                                            type="text"
                                            placeholder="First Name"
                                            onChange={e => setPersonalProfile({ ...personalProfile, firstName: e.target.value })}
                                            value={personalProfile.firstName}
                                        />
                                    </div>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Last Name *</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge} ${!personalProfile.lastName ? styles.isDanger : ''}`}
                                            type="text"
                                            placeholder="Last Name"
                                            onChange={e => setPersonalProfile({ ...personalProfile, lastName: e.target.value })}
                                            value={personalProfile.lastName}
                                        />
                                    </div>
                                </div>
                                <div className={`columns is-mobile ${styles.inputRow}`}>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Identifier *</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge} ${!personalProfile.identifier ? styles.isDanger : ''}`}
                                            type="text"
                                            placeholder="Identifier"
                                            onChange={e => setPersonalProfile({ ...personalProfile, identifier: e.target.value })}
                                            value={personalProfile.identifier}
                                        />
                                    </div>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Email *</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge} ${!personalProfile.email ? styles.isDanger : ''}`}
                                            type="text"
                                            placeholder="Email"
                                            onChange={e => setPersonalProfile({ ...personalProfile, email: e.target.value })}
                                            value={personalProfile.email}
                                        />
                                    </div>
                                </div>
                                <div className={`columns is-mobile ${styles.inputRow}`}>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Company</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge}`}
                                            type="text"
                                            placeholder="Company"
                                            onChange={e => setPersonalProfile({ ...personalProfile, company: e.target.value })}
                                            value={personalProfile.company}
                                        />
                                    </div>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Job Title</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge}`}
                                            type="text"
                                            placeholder="Job Title"
                                            onChange={e => setPersonalProfile({ ...personalProfile, jobTitle: e.target.value })}
                                            value={personalProfile.jobTitle}
                                        />
                                    </div>
                                </div>
                                <div className={`columns is-mobile ${styles.inputRow}`}>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Birthday</b>
                                        <div className="columns field">
                                            <div className={`column ${styles.control}`}>
                                                <DateTimePicker
                                                    onChange={e => setPersonalProfile({ ...personalProfile, birthday: e.target.value })}
                                                    format={{ date: 'MM/DD/YYYY', time: '' }}
                                                    value={personalProfile.birthday || null}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Gender</b>
                                        <div className={styles.control}>
                                            <div className={`${styles.select} ${styles.isLarge}`}>
                                                {/* eslint-disable-next-line jsx-a11y/no-onchange */}
                                                <select
                                                    onChange={e => setPersonalProfile({ ...personalProfile, gender: e.target.value })}
                                                    value={personalProfile.gender}
                                                >
                                                    <option>Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Prefer not to say">Prefer not to say</option>
                                                    <option value="Specify">Let me specify</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {personalProfile.gender === 'Specify' &&
                                    <React.Fragment>
                                        <div className={`columns is-mobile ${styles.inputRow}`}>
                                            <div className={`column is-half ${styles.inputField}`}></div>
                                            <div className={`column is-half ${styles.inputField}`}>
                                                <b>Specify gender</b>
                                                <input
                                                    className={`${styles.input} ${styles.isLarge}`}
                                                    type="text"
                                                    placeholder="Specify your gender"
                                                    onChange={e => setPersonalProfile({ ...personalProfile, specifyGender: e.target.value })}
                                                    value={personalProfile.specifyGender}
                                                />
                                            </div>
                                        </div>
                                    </React.Fragment>
                                }
                                <div className={`columns is-mobile ${styles.inputRow}`}>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Github</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge}`}
                                            type="text"
                                            placeholder="Github"
                                            onChange={e => setPersonalProfile({ ...personalProfile, github: e.target.value })}
                                            value={personalProfile.github}
                                        />
                                    </div>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>IRC</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge}`}
                                            type="text"
                                            placeholder="IRC"
                                            onChange={e => setPersonalProfile({ ...personalProfile, irc: e.target.value })}
                                            value={personalProfile.irc}
                                        />
                                    </div>
                                </div>
                                <div className={`columns is-mobile ${styles.inputRow}`}>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>LinkedIn</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge}`}
                                            type="text"
                                            placeholder="LinkedIn"
                                            onChange={e => setPersonalProfile({ ...personalProfile, linkedin: e.target.value })}
                                            value={personalProfile.linkedin}
                                        />
                                    </div>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Twitter</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge}`}
                                            type="text"
                                            placeholder="Twitter"
                                            onChange={e => setPersonalProfile({ ...personalProfile, twitter: e.target.value })}
                                            value={personalProfile.twitter}
                                        />
                                    </div>
                                </div>
                                <div className={`columns is-mobile ${styles.inputRow}`}>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Language</b>
                                        <LanguageInput
                                            onChange={e => setPersonalProfile({ ...personalProfile, language: e.target.value })}
                                            className={styles.dropdown}
                                            value={personalProfile.language}
                                        />
                                    </div>
                                </div>
                            </div>
                            <label className={styles.checkbox}>
                                <input type="checkbox" checked={showFullName} onChange={e => setShowFullName(e.target.checked)} />
                                Show full name on public profile
                            </label>
                            <br />
                            <label className={styles.checkbox}>
                                <input type="checkbox" checked={showEmail} onChange={e => setShowEmail(e.target.checked)} />
                                Show email on public profile
                            </label>
                            <br />
                            <label className={styles.checkbox}>
                                <input type="checkbox" checked={allowChatWithMe} onChange={e => setAllowChatWithMe(e.target.checked)} />
                                Allow people to chat with me?
                            </label>
                            <div className={`columns is-mobile ${styles.buttons}`}>
                                <div className={`column is-half`}>
                                    <button className={`button is-large ${styles.profileButton}`} onClick={() => discardChanges('profile')}>Discard</button>
                                </div>
                                <div className={`column is-half`}>
                                    <button className="button is-large" onClick={() => handleProfileUpdate()}>Update</button>
                                </div>
                            </div>
                        </div>
                        <div className={styles.formContainer}>
                            <span className={styles.header}>Bio</span>
                            <div className={styles.form}>
                                <div className={`columns is-mobile ${styles.inputRow}`}>
                                    <div className={`column is-full ${styles.inputField}`}>
                                        <b id="bioLabel">Bio</b>
                                        <textarea
                                            aria-labelledby='bioLabel'
                                            className={`textarea ${styles.textarea}`}
                                            placeholder=''
                                            rows="6"
                                            onChange={e => setBio(e.target.value)}
                                            value={bio}
                                        >
                                        </textarea>
                                    </div>
                                </div>
                                <div className={`columns is-mobile ${styles.inputRow}`}>
                                    <div className={`column is-full ${styles.inputField}`}>
                                        <b id="sOILabel">Statement of Interest</b>
                                        <textarea
                                            className={`textarea ${styles.textarea}`}
                                            aria-labelledby="sOILabel"
                                            placeholder=''
                                            rows="6"
                                            onChange={e => setStatementOfInterest(e.target.value)}
                                            value={statementOfInterest}
                                        >
                                        </textarea>
                                    </div>
                                </div>
                            </div>
                            <div className={`columns is-mobile ${styles.buttons}`}>
                                <div className={`column is-half`}>
                                    <button className={`button is-large ${styles.profileButton}`} onClick={() => discardChanges('bio')}>Discard</button>
                                </div>
                                <div className={`column is-half`}>
                                    <button className="button is-large" onClick={() => handleProfileUpdate()}>Update</button>
                                </div>
                            </div>
                        </div>
                        <div className={styles.formContainer}>
                            <div className={styles.header}>Address</div>
                            <div className={styles.form}>
                                <div className={`columns is-mobile ${styles.inputRow}`}>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Address 1</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge}`}
                                            type="text"
                                            placeholder="Complete your address"
                                            onChange={e => setAddress({ ...address, street: e.target.value })}
                                            value={address.street}
                                        />
                                    </div>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Address 2</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge}`}
                                            type="text"
                                            placeholder="Complete your address"
                                            onChange={e => setAddress({ ...address, floor: e.target.value })}
                                            value={address.floor}
                                        />
                                    </div>
                                </div>
                                <div className={`columns is-mobile ${styles.inputRow}`}>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>City</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge}`}
                                            type="text"
                                            placeholder="Complete your city"
                                            onChange={e => setAddress({ ...address, city: e.target.value })}
                                            value={address.city}
                                        />
                                    </div>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>State</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge}`}
                                            type="text"
                                            placeholder="Complete your state"
                                            onChange={e => setAddress({ ...address, state: e.target.value })}
                                            value={address.state}
                                        />
                                    </div>
                                </div>
                                <div className={`columns is-mobile ${styles.inputRow}`}>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Zip Code</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge}`}
                                            type="text"
                                            placeholder="Complete your zip code"
                                            onChange={e => setAddress({ ...address, zipCode: e.target.value })}
                                            value={address.zipCode}
                                        />
                                    </div>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Country</b>
                                        <CountryInput
                                            onChange={e => setAddress({ ...address, country: e.target.value })}
                                            className={styles.dropdown}
                                            value={address.country}
                                        />
                                    </div>
                                </div>
                                <div className={`columns is-mobile ${styles.inputRow}`}>
                                    <div className={`column is-half ${styles.inputField}`}>
                                        <b>Phone</b>
                                        <input
                                            className={`${styles.input} ${styles.isLarge}`}
                                            type="text"
                                            placeholder="Complete your phone"
                                            onChange={e => setAddress({ ...address, phone: e.target.value })}
                                            value={address.phone}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={`columns is-mobile ${styles.buttons}`}>
                                <div className={`column is-half`}>
                                    <button className={`button is-large ${styles.profileButton}`} onClick={() => discardChanges('address')}>Discard</button>
                                </div>
                                <div className={`column is-half`}>
                                    <button className="button is-large" onClick={() => handleProfileUpdate()}>Update</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="column is-3">
                        <h2 className={styles.header}>My Schedule</h2>
                        <LiteScheduleComponent
                            onEventClick={(ev) => onEventChange(ev)}
                            onViewAllEventsClick={() => onViewAllEventsClick()}
                            title=''
                            yourSchedule={true}
                            showNav={true}
                            eventCount={10}
                            schedKey="my-schedule-main"
                        />
                    </div>
                </div>
            </div>
            {showProfile &&
                <ProfilePopupComponent
                    userProfile={user.idpProfile}
                    showProfile={showProfile}
                    idpLoading={user.loadingIDP}
                    fromFullProfile={true}
                    changePicture={(pic) => handlePictureUpdate(pic)}
                    changeProfile={(profile) => handleProfileUpdate(profile)}
                    closePopup={() => handleTogglePopup(!showProfile)}
                />
            }
        </React.Fragment>
    )
};

const OrchestedTemplate = withOrchestra(FullProfilePageTemplate);

const FullProfilePage = (
    {
        location,
        user,
        getIDPProfile,
        updateProfile,
        updateProfilePicture,
        updatePassword,
    }
) => {
    return (
        <Layout location={location}>
            <OrchestedTemplate
                user={user}
                getIDPProfile={getIDPProfile}
                updateProfile={updateProfile}
                updateProfilePicture={updateProfilePicture}
                updatePassword={updatePassword} />
        </Layout>
    )
};

FullProfilePage.propTypes = {
    user: PropTypes.object,
    getIDPProfile: PropTypes.func,
    updateProfile: PropTypes.func,
    updateProfilePicture: PropTypes.func,
    updatePassword: PropTypes.func
};

FullProfilePageTemplate.propTypes = {
    user: PropTypes.object,
    getIDPProfile: PropTypes.func,
    updateProfile: PropTypes.func,
    updateProfilePicture: PropTypes.func,
    updatePassword: PropTypes.func
};

const mapStateToProps = ({ userState }) => ({
    user: userState,
});

export default connect(mapStateToProps,
    {
        getIDPProfile,
        updateProfile,
        updateProfilePicture,
        updatePassword
    }
)(FullProfilePage);