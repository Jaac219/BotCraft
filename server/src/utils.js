const generateConfig = (url, accessToken, method = 'get') => {
  return {
    method,
    url: url,
    headers: {
      Authorization: `Bearer ${accessToken} `,
      "Content-type": "application/json",
    }
  };
};

module.exports = { generateConfig };