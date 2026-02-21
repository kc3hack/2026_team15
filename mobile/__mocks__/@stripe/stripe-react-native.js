import React from 'react';

export const StripeProvider = ({ children }) => children;

export const CardField = props => {
  return null;
};

export const useStripe = () => ({
  confirmPayment: jest.fn(),
  createPaymentMethod: jest.fn(),
  initPaymentSheet: jest.fn(),
  presentPaymentSheet: jest.fn(),
});

export const useConfirmPayment = () => ({
  confirmPayment: jest.fn(),
  loading: false,
});

export const CardFieldInput = {
  Details: {},
};
