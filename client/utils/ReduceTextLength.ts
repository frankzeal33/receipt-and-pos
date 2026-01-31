const ReduceTextLength = (text: string, length: number) => {
  if (!text) return ""; // handles undefined, null, empty string
  if (length <= 0) return "";
  return text.length > length ? text.slice(0, length) + '...' : text;
};

export default ReduceTextLength;