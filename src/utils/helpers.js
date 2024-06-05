import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faFacebook, 
    faXTwitter, 
    faLinkedinIn, 
    faInstagram,
    faTiktok, 
    faSnapchat, 
    faVimeo, 
    faYoutube
} from "@fortawesome/free-brands-svg-icons"

export const getFASocialIcons = (network) => {
    switch(network) {
        case 'fa-facebook': 
            return <FontAwesomeIcon icon={faFacebook} />
        case 'fa-linkedin':
            return <FontAwesomeIcon icon={faLinkedinIn} />
        case 'fa-twitter':
            return <FontAwesomeIcon icon={faXTwitter} />
        case 'fa-x':
            return <FontAwesomeIcon icon={faXTwitter} />
        case 'fa-instagram': 
            return <FontAwesomeIcon icon={faInstagram} />
        case 'fa-tiktok':
            return <FontAwesomeIcon icon={faTiktok} />
        case 'fa-snapchat':
            return<FontAwesomeIcon icon={faSnapchat} />
        case 'fa-vimeo':
            return <FontAwesomeIcon icon={faVimeo} />
        case 'fa-youtube':
            return <FontAwesomeIcon icon={faYoutube} />
        default:
            return null
    }
}