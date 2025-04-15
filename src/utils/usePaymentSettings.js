import {
    graphql,
    useStaticQuery
  } from "gatsby";
  
  const paymentSettingsQuery = graphql`
    query {
      paymentsJson {
        hidePostalCode
      }
    }
  `;
  
  const usePaymentSettings = () => {
    const { paymentsJson } = useStaticQuery(paymentSettingsQuery);
    return paymentsJson;
  };
  
  export default usePaymentSettings;
  