const convertMMSSsssToS = (str) => {
  const mins = Number(str.slice(0, 2));
  const secs = Number(str.slice(3, 5));
  const fract = Number(str.slice(6)) / 1000;
  return mins * 60 + secs + fract;
};

module.exports = convertMMSSsssToS;
