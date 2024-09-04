import { selectOption } from "./fields";

export const mapObjectToSelectOptions = (object) => 
  Object.entries(object).map(([key, value]) => selectOption({ label: value, value: value }));