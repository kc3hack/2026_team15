import React, { useEffect, useRef } from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AppProvider, useApp } from '../src/lib/app-context';
import { MOCK_APP_CATALOG, mockStore } from '../src/lib/mock-store';

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

      return {
        select: jest.fn(() => createOrderBuilder({ data: [], error: null })),
      };
    }),
  },
}));

type HarnessProps = {
  onCreated: (ok: boolean) => void;
};

function ContractCreationHarness({ onCreated }: HarnessProps) {
  const {
    profile,
    selectedApps,
    grantPermission,
    setSelectedApps,
    createContract,
  } = useApp();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!profile || startedRef.current) return;
    startedRef.current = true;
    grantPermission();
    setSelectedApps([MOCK_APP_CATALOG[0]]);
  }, [profile, grantPermission, setSelectedApps]);

  useEffect(() => {
    if (!profile || selectedApps.length === 0) return;
    void createContract(5400, 500, 'pi_test_contract').then(onCreated);
  }, [createContract, onCreated, profile, selectedApps]);

  return null;
}

async function flush(): Promise<void> {
  await new Promise<void>(resolve => setTimeout(resolve, 0));
}

describe('AppContext contract flow', () => {
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
          dailyLimitSeconds: 5400,
          penaltyPerDay: 500,
          depositTotal: 3500,
          status: 'active',
          selectedApps: [MOCK_APP_CATALOG[0]],
        },
      }),
    }) as unknown as typeof fetch;
  });

  it('sends mock date fields when creating contract', async () => {
    const onCreated = jest.fn();

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <AppProvider>
          <ContractCreationHarness onCreated={onCreated} />
        </AppProvider>,
      );
      await flush();
      await flush();
      await flush();
    });

    expect(onCreated).toHaveBeenCalledWith(true);
    const [, requestInit] = (globalThis.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(String(requestInit.body));
    expect(body.dailyLimitSeconds).toBe(5400);
    expect(body.clientNowIso).toEqual(expect.any(String));
    expect(body.clientLocalDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
