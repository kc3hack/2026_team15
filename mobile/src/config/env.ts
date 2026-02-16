import {SUPABASE_ANON_KEY, SUPABASE_URL} from '@env';

function assertEnv(name: string, value?: string): string {
  if (!value) {
    throw new Error(
      `${name} is not defined. Copy .env.example to .env and set ${name}.`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: assertEnv('SUPABASE_URL', SUPABASE_URL),
  supabaseAnonKey: assertEnv('SUPABASE_ANON_KEY', SUPABASE_ANON_KEY),
};
