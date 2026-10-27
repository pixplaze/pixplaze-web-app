export const classIf = (className, condition) => {
  return (condition === undefined && className) || condition ? className : '';
}

export const copyToClipboard = async (value) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const el = document.createElement('textarea');
  el.value = value;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};
