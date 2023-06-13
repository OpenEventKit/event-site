import * as React from "react";
import { withPrefix } from "gatsby";

export const HtmlAttributes = {
  lang: "en"
};

export const HeadComponents = [
  <link
    key="font-awesome"
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw=="
    crossOrigin="anonymous"
    referrerPolicy="no-referrer"
  />,
  <link
    key="awesome-bootstrap-checkbox"
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/awesome-bootstrap-checkbox/1.0.2/awesome-bootstrap-checkbox.min.css" integrity="sha512-zAQ4eQ+PGbYf6BknDx0m2NhTcOnHWpMdJCFaPvcv5BpMTR5edqr/ZRuluUcNave6IEpRCoT67/3hVVmm5ODpqA=="
    crossOrigin="anonymous"
    referrerPolicy="no-referrer"
  />,
  <link
    key="fonts"
    rel="stylesheet"
    type="text/css"
    href={withPrefix("/fonts/fonts.css")}
  />
];

export const PreBodyComponents = [
  <link
    key="bootstrap"
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css"
    integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
    crossOrigin="anonymous"
  />
];