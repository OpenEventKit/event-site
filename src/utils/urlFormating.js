export const getSponsorURL = (id, name) => {  
  let formattedName = name.toLowerCase().replace(/\s/g, '-');
  return `${id}-${formattedName}`;
}

export const titleFromPathname = (pathname) => {
  const segments = pathname.split("/");
  const lastSegment = segments.filter(Boolean).pop();
  return lastSegment?.replace("-", " ").replace(/\b\w/g, (word) => word.toUpperCase());
}
