export interface SoundCloudConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  defaultScopes: string[];
}

const DEFAULT_SCOPES = ['non-expiring'];

export function getSoundCloudConfig(): SoundCloudConfig {
  const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
  const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET;
  const redirectUri = process.env.SOUNDCLOUD_REDIRECT_URI;
  const scopeEnv = process.env.SOUNDCLOUD_SCOPES;

  if (!clientId) {
    throw new Error('Missing SOUNDCLOUD_CLIENT_ID env var');
  }

  if (!clientSecret) {
    throw new Error('Missing SOUNDCLOUD_CLIENT_SECRET env var');
  }

  if (!redirectUri) {
    throw new Error('Missing SOUNDCLOUD_REDIRECT_URI env var');
  }

  const defaultScopes =
    scopeEnv?.split(',')
      .map((scope) => scope.trim())
      .filter(Boolean) || DEFAULT_SCOPES;

  return {
    clientId,
    clientSecret,
    redirectUri,
    defaultScopes,
  };
}

