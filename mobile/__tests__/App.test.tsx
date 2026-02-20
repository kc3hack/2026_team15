/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/navigation/AppNavigator', () => ({
  AppNavigator: () => null,
}));

jest.mock('../src/lib/usage-warning-notifier', () => ({
  requestPermission: jest.fn().mockResolvedValue(true),
  notifyIfThresholdReached: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
      signInAnonymously: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn((table: string) => {
      const createMaybeSingleBuilder = (result: unknown) => {
        const builder: {
          eq: jest.Mock;
          maybeSingle: jest.Mock;
        } = {
          eq: jest.fn(),
          maybeSingle: jest.fn().mockResolvedValue(result),
        };
        builder.eq.mockReturnValue(builder);
        return builder;
      };

      const createOrderBuilder = (result: unknown) => {
        const builder: {
          eq: jest.Mock;
          order: jest.Mock;
          maybeSingle: jest.Mock;
        } = {
          eq: jest.fn(),
          order: jest.fn().mockResolvedValue(result),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
        builder.eq.mockReturnValue(builder);
        return builder;
      };

      if (table === 'profiles') {
        return {
          upsert: jest.fn().mockResolvedValue({ error: null }),
          select: jest.fn(() =>
            createMaybeSingleBuilder({
              data: {
                id: 'test-user-id',
                apple_user_id: null,
                stripe_customer_id: null,
                created_at: '2026-01-01T00:00:00.000Z',
                updated_at: '2026-01-01T00:00:00.000Z',
              },
              error: null,
            }),
          ),
        };
      }

      if (table === 'contracts') {
        return {
          select: jest.fn(() =>
            createMaybeSingleBuilder({ data: null, error: null }),
          ),
        };
      }

      return {
        select: jest.fn(() => createOrderBuilder({ data: [], error: null })),
      };
    }),
  },
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
