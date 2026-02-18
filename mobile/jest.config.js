module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '@stripe/stripe-react-native':
      '<rootDir>/__mocks__/@stripe/stripe-react-native.js',
  },
};
