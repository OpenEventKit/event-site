export * from './capitalizeFirstLetter';
export * from './createReducer';
export * from './getDayNumberFromDate';
export * from './getDaysBetweenDates';
export * from './getDocumentOffset';
export * from './getFormattedDate';
export * from './getFormattedTime';
export * from './getWindowScroll';
export * from './formatCurrency';


export const processActionError = (err) => {
  if(err?.status == 412) {
    let msg = '';
    for (const [key, value] of Object.entries(err.response.body.errors)) {
      msg += isNaN(key) ? `${key}: ` : "";
      msg += `${value}`;
    }
    throw msg;
  }
  throw err;
}
