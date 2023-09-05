// next-i18next.config.js
const path = require('path');

module.exports = {
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: process.env.DEFAULT_LOCALE || 'en',
  },
  localePath: path.resolve('./public/locales'),
};
