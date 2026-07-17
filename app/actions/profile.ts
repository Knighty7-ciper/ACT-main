'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { profiles, wallets } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getProfile() {
  const userId = await getUserId()

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))

  return profile || null
}

export async function updateProfile(data: {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  country?: string
  profilePictureUrl?: string
}) {
  const userId = await getUserId()

  const updated = await db
    .update(profiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, userId))
    .returning()

  revalidatePath('/')
  return updated[0] || null
}

export async function createProfile(data: {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  country?: string
}) {
  const userId = await getUserId()

  // Check if profile exists
  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))

  if (existing.length > 0) {
    return updateProfile(data)
  }

  const created = await db
    .insert(profiles)
    .values({
      id: `prof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...data,
    })
    .returning()

  revalidatePath('/')
  return created[0]
}

export async function getUserWallets() {
  const userId = await getUserId()

  return db.select().from(wallets).where(eq(wallets.userId, userId))
}

export async function createWallet(walletAddress: string) {
  const userId = await getUserId()

  const created = await db
    .insert(wallets)
    .values({
      id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      walletAddress,
      currency: 'ACT',
      walletType: 'main',
    })
    .returning()

  revalidatePath('/')
  return created[0]
}
