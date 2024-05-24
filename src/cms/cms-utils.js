/*
  Workaround for text editor
  @see https://github.com/decaporg/decap-cms/issues/5092
*/
const injectCustomStyle = () => {
  const style = document.createElement("style");
  style.innerHTML = `
    div[data-slate-editor] {
      -webkit-user-modify: read-write !important;
    }
  `;
  document.head.appendChild(style);
};

injectCustomStyle();