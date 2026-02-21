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
        .mockResolvedValueOnce({ data: { session: null }, error: null })
        .mockResolvedValue({
          data: {
            session: {
              access_token: 'test-access-token',
              user: { id: 'test-user-id' },
            },
          },
          error: null,
        }),
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
        } = {
          eq: jest.fn(),
          order: jest.fn().mockResolvedValue(result),
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

      if (table === 'violations') {
        return {
          select: jest.fn(() => createOrderBuilder({ data: [], error: null })),
        };
      }

      if (table === 'ledger_entries') {
        return {
          select: jest.fn(() => createOrderBuilder({ data: [], error: null })),
        };
      }

      return {
        select: jest.fn(() =>
          createMaybeSingleBuilder({ data: null, error: null }),
        ),
      };
    }),
  },
}));

function UsageSimulationHarness() {
  const {
    profile,
    grantPermission,
    selectedApps,
    setSelectedApps,
    createContract,
    simulateUsage,
  } = useApp();
  const didSelectRef = useRef(false);
  const didSimulateRef = useRef(false);

  useEffect(() => {
    if (!profile || didSelectRef.current) {
      return;
    }
    didSelectRef.current = true;

    const app = MOCK_APP_CATALOG[0];
    grantPermission();
    setSelectedApps([app]);
  }, [profile, grantPermission, setSelectedApps]);

  useEffect(() => {
    if (!profile || selectedApps.length === 0 || didSimulateRef.current) {
      return;
    }
    didSimulateRef.current = true;

    const app = selectedApps[0];
    void createContract(3600, 500, 'pi_test_notifications').then(() => {
      simulateUsage(app.bundleId, 1800);
    });
  }, [profile, selectedApps, setSelectedApps, createContract, simulateUsage]);

  return null;
}

async function flush(): Promise<void> {
  await new Promise<void>(resolve => setTimeout(resolve, 0));
}

describe('AppContext notifications', () => {
  beforeEach(() => {
    mockStore.logout();
    jest.clearAllMocks();
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        contract: {
          id: 'contract-1',
          startAt: '2026-02-20T00:00:00.000Z',
          endAt: '2026-02-27T00:00:00.000Z',
          dailyLimitSeconds: 3600,
          penaltyPerDay: 500,
          depositTotal: 3500,
          status: 'active',
          selectedApps: [MOCK_APP_CATALOG[0]],
        },
      }),
    }) as unknown as typeof fetch;
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
