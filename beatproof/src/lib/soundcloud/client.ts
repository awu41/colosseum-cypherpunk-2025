import { getSoundCloudConfig } from './config';

const SOUND_CLOUD_CONNECT_URL = 'https://soundcloud.com/connect';
const SOUND_CLOUD_TOKEN_URL = 'https://api.soundcloud.com/oauth2/token';
const SOUND_CLOUD_API_BASE = 'https://api.soundcloud.com';

export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string[];
}

interface ExchangeCodeOptions {
  code: string;
  redirectUri?: string;
}

interface TrackLookupOptions {
  accessToken?: string;
  trackId?: string | number;
  trackUrl?: string;
}

function ensureSuccessfulResponse(res: Response, context: string) {
  if (!res.ok) {
    throw new Error(
      `${context} failed with status ${res.status}: ${res.statusText}`,
    );
  }
}

export function buildAuthorizeUrl(params?: {
  state?: string;
  scope?: string[];
  redirectUriOverride?: string;
}): string {
  const config = getSoundCloudConfig();
  const url = new URL(SOUND_CLOUD_CONNECT_URL);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set(
    'redirect_uri',
    params?.redirectUriOverride ?? config.redirectUri,
  );
  url.searchParams.set('response_type', 'code');
  url.searchParams.set(
    'scope',
    (params?.scope?.length ? params.scope : config.defaultScopes).join(' '),
  );

  if (params?.state) {
    url.searchParams.set('state', params.state);
  }

  return url.toString();
}

export async function exchangeCodeForToken(
  options: ExchangeCodeOptions,
): Promise<OAuthTokenResponse> {
  const config = getSoundCloudConfig();
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'authorization_code',
    redirect_uri: options.redirectUri ?? config.redirectUri,
    code: options.code,
  });

  const res = await fetch(SOUND_CLOUD_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  ensureSuccessfulResponse(res, 'Token exchange');

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope?.split(' ') ?? undefined,
  };
}

export async function fetchCurrentSoundCloudUser(accessToken: string) {
  const res = await fetch(`${SOUND_CLOUD_API_BASE}/me`, {
    headers: {
      Authorization: `OAuth ${accessToken}`,
    },
  });

  ensureSuccessfulResponse(res, 'Current user fetch');

  return (await res.json()) as SoundCloudUser;
}

async function fetchTrackById(trackId: string | number) {
  const { clientId } = getSoundCloudConfig();
  const res = await fetch(
    `${SOUND_CLOUD_API_BASE}/tracks/${trackId}?client_id=${clientId}`,
  );

  ensureSuccessfulResponse(res, 'Track fetch');

  return (await res.json()) as SoundCloudTrack;
}

async function resolveTrackUrl(trackUrl: string) {
  const { clientId } = getSoundCloudConfig();
  const resolveUrl = new URL(`${SOUND_CLOUD_API_BASE}/resolve`);
  resolveUrl.searchParams.set('url', trackUrl);
  resolveUrl.searchParams.set('client_id', clientId);

  const res = await fetch(resolveUrl.toString(), {
    redirect: 'follow',
  });

  ensureSuccessfulResponse(res, 'Track resolve');

  // SoundCloud resolve endpoint may return the track payload directly.
  const data = (await res.json()) as SoundCloudTrack | { location?: string };
  if ('location' in data && data.location) {
    const trackRes = await fetch(`${data.location}?client_id=${clientId}`);
    ensureSuccessfulResponse(trackRes, 'Resolved track fetch');
    return (await trackRes.json()) as SoundCloudTrack;
  }

  return data as SoundCloudTrack;
}

export async function fetchTrackMetadata(
  options: TrackLookupOptions,
): Promise<SoundCloudTrack> {
  if (!options.trackId && !options.trackUrl) {
    throw new Error('trackId or trackUrl is required');
  }

  if (options.trackId) {
    return fetchTrackById(options.trackId);
  }

  return resolveTrackUrl(options.trackUrl!);
}

export interface SoundCloudUser {
  id: number;
  username: string;
  permalink_url?: string;
}

export interface SoundCloudTrack {
  id: number;
  title: string;
  permalink_url: string;
  description?: string;
  tag_list?: string;
  user?: SoundCloudUser;
  user_id?: number;
}

