// public/config.js
(function () {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  window.env = {
    API_BASE_URL: isLocalhost
      ? 'http://localhost:3000/api'
      : 'https://api.dro-app.com/api'
  };
})();
