const levenshtein = function (s1, s2) {
  // init
  const d = [];
  const m = s1.length;
  const n = s2.length;
  let i;
  let j;

  for (i = 0; i <= m; i++) {
    d[i] = [];
    d[i][0] = i;
  }
  for (j = 0; j <= n; j++) {
    d[0][j] = j;
  }

  for (j = 1; j <= n; j++) {
    for (i = 1; i <= m; i++) {
      if (s1[i] === s2[j]) {
        d[i][j] = d[i - 1][j - 1];
      } else {
        d[i][j] = Math.min(
          d[i - 1][j] + 1, // a deletion
          d[i][j - 1] + 1, // an insertion
          d[i - 1][j - 1] + 1 // a substitution
        );
      }
    }
  }

  return d[m][n];
};

module.exports = function (s1, s2) {
  return 1 - levenshtein(s1, s2) / Math.max(s1.length, s2.length);
};
