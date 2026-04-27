// This file is intended to allow for theme extension with component shadowing.
// You can add your component imports and map them here to be used as shortcodes in MDX content.

// Import components here when needed
// import Grid from "../../components/Grid";
// import SpeakerCard from "../../components/SpeakerCard";
import ResponsiveImage from "../../components/ResponsiveImage";
import RegistrationForm from "../../components/RegistrationFormShortcode";

const shortcodes = {
  ResponsiveImage,
  RegistrationForm
};

export default shortcodes;
