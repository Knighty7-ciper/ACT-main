import { pgTable, text, timestamp, decimal, index, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Better Auth Tables
export const user = pgTable(
  'user',
  {
    id: text('id').primaryKey(),
    email: text('email').unique().notNull(),
    emailVerified: timestamp('emailVerified'),
    name: text('name'),
    image: text('image'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  }
)

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  }
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refreshToken: text('refreshToken'),
    accessToken: text('accessToken'),
    expiresAt: timestamp('expiresAt'),
    tokenType: text('tokenType'),
    scope: text('scope'),
    idToken: text('idToken'),
    sessionState: text('sessionState'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  }
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    token: text('token').notNull().unique(),
    expires: timestamp('expires').notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  }
)

// ACT Coin Platform Tables
export const profiles = pgTable(
  'profiles',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: 'cascade' }),
    firstName: text('first_name'),
    lastName: text('last_name'),
    phoneNumber: text('phone_number'),
    country: text('country'),
    profilePictureUrl: text('profile_picture_url'),
    kycStatus: text('kyc_status').default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('profiles_user_id_idx').on(table.userId),
  })
)

export const wallets = pgTable(
  'wallets',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    walletAddress: text('wallet_address').notNull().unique(),
    balance: decimal('balance', { precision: 20, scale: 8 }).default('0'),
    currency: text('currency').default('ACT'),
    walletType: text('wallet_type').default('main'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('wallets_user_id_idx').on(table.userId),
    walletAddressIdx: index('wallets_address_idx').on(table.walletAddress),
  })
)

export const transactions = pgTable(
  'transactions',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    fromWalletAddress: text('from_wallet_address'),
    toWalletAddress: text('to_wallet_address'),
    amount: decimal('amount', { precision: 20, scale: 8 }).notNull(),
    transactionType: text('transaction_type').notNull(),
    status: text('status').default('pending'),
    description: text('description'),
    transactionHash: text('transaction_hash').unique(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('transactions_user_id_idx').on(table.userId),
    hashIdx: index('transactions_hash_idx').on(table.transactionHash),
  })
)

export const pppData = pgTable(
  'ppp_data',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    country: text('country').notNull(),
    pppValue: decimal('ppp_value', { precision: 10, scale: 2 }),
    currency: text('currency'),
    dataSource: text('data_source'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('ppp_data_user_id_idx').on(table.userId),
    countryIdx: index('ppp_data_country_idx').on(table.country),
  })
)

// Relations
export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  profile: one(profiles),
  wallets: many(wallets),
  transactions: many(transactions),
  pppData: many(pppData),
}))

export const profileRelations = relations(profiles, ({ one }) => ({
  user: one(user, {
    fields: [profiles.userId],
    references: [user.id],
  }),
}))

export const walletRelations = relations(wallets, ({ one, many }) => ({
  user: one(user, {
    fields: [wallets.userId],
    references: [user.id],
  }),
  transactions: many(transactions),
}))

export const transactionRelations = relations(transactions, ({ one }) => ({
  user: one(user, {
    fields: [transactions.userId],
    references: [user.id],
  }),
}))

export const pppDataRelations = relations(pppData, ({ one }) => ({
  user: one(user, {
    fields: [pppData.userId],
    references: [user.id],
  }),
}))
