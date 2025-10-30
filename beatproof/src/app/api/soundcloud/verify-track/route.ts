import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  SoundCloudTrack,
  fetchCurrentSoundCloudUser,
  fetchTrackMetadata,
} from '@/lib/soundcloud/client';

const BodySchema = z
  .object({
    accessToken: z.string().min(1),
    trackId: z.union([z.string(), z.number()]).optional(),
    trackUrl: z.string().url().optional(),
    expectedUserId: z.union([z.string(), z.number()]).optional(),
    expectedBeatHash: z.string().min(1).optional(),
  })
  .refine(
    (data) => data.trackId !== undefined || data.trackUrl !== undefined,
    'trackId or trackUrl is required',
  );

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = BodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      accessToken,
      trackId,
      trackUrl,
      expectedUserId,
      expectedBeatHash,
    } = parsed.data;

    const [currentUser, track] = await Promise.all([
      fetchCurrentSoundCloudUser(accessToken),
      fetchTrackMetadata({ trackId, trackUrl }),
    ]);

    const ownerId = track.user?.id ?? track.user_id;
    const currentUserId = currentUser.id;
    const expectedUserIdNormalized =
      expectedUserId !== undefined ? Number(expectedUserId) : undefined;

    const ownershipVerified =
      expectedUserIdNormalized !== undefined
        ? ownerId === expectedUserIdNormalized
        : ownerId === currentUserId;

    const beatHashVerified = expectedBeatHash
      ? trackMatchesBeatHash(track, expectedBeatHash)
      : undefined;

    return NextResponse.json({
      verified: ownershipVerified && (beatHashVerified ?? true),
      ownershipVerified,
      beatHashVerified,
      track: summarizeTrack(track),
      currentUser: {
        id: currentUser.id,
        username: currentUser.username,
        permalinkUrl: currentUser.permalink_url,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Unexpected error' },
      { status: 500 },
    );
  }
}

function trackMatchesBeatHash(track: SoundCloudTrack, beatHash: string) {
  const normalizedHash = beatHash.trim().toLowerCase();
  const haystacks = [
    track.description ?? '',
    track.tag_list ?? '',
  ].map((value) => value.toLowerCase());

  return haystacks.some((value) => value.includes(normalizedHash));
}

function summarizeTrack(track: SoundCloudTrack) {
  return {
    id: track.id,
    title: track.title,
    permalinkUrl: track.permalink_url,
    description: track.description,
    tagList: track.tag_list,
    user: track.user
      ? {
          id: track.user.id,
          username: track.user.username,
          permalinkUrl: track.user.permalink_url,
        }
      : undefined,
  };
}

