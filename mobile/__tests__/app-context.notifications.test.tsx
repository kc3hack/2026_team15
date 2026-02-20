import React, { useEffect, useRef } from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AppProvider, useApp } from '../src/lib/app-context';
import { MOCK_APP_CATALOG, mockStore } from '../src/lib/mock-store';
import { notifyIfThresholdReached } from '../src/lib/usage-warning-notifier';

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
      signInAnonymously: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn(() => ({
      upsert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              id: 'test-user-id',
              apple_user_id: null,
              stripe_customer_id: null,
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
            },
            error: null,
          }),
        })),
      })),
    })),
  },
}));

function UsageSimulationHarness() {
  const { profile, grantPermission, setSelectedApps, createContract, simulateUsage } =
    useApp();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (!profile || didRunRef.current) {
      return;
    }
    didRunRef.current = true;

    const app = MOCK_APP_CATALOG[0];
    grantPermission();
    setSelectedApps([app]);
    createContract(3600);
    simulateUsage(app.bundleId, 1800);
  }, [profile, grantPermission, setSelectedApps, createContract, simulateUsage]);

  return null;
}

async function flush(): Promise<void> {
  await new Promise<void>(resolve => setTimeout(resolve, 0));
}

describe('AppContext notifications', () => {
  beforeEach(() => {
    mockStore.logout();
    jest.clearAllMocks();
  });

  it('calls notifier from simulateUsage flow', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <AppProvider>
          <UsageSimulationHarness />
        </AppProvider>,
      );
      await flush();
      await flush();
      await flush();
    });

    expect(notifyIfThresholdReached).toHaveBeenCalledTimes(1);
    expect(notifyIfThresholdReached).toHaveBeenCalledWith(
      expect.objectContaining({
        localDate: expect.any(String),
        usageSeconds: 1800,
        dailyLimitSeconds: 3600,
      }),
    );
  });
});
