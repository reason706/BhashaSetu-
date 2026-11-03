# Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants
1. **Strict Owner Isolation**: A `/users/{userId}` document can only be created, read (`get`), updated, or deleted by the authenticated user whose `request.auth.uid == userId` AND whose email is verified (`request.auth.token.email_verified == true`).
2. **No Collection Scraping (`list` Denied)**: Listing `/users` is unconditionally forbidden (`allow list: if false;`) to prevent user enumeration or cross-account scraping.
3. **Identity & Immutable Fields**: `ownerId` must equal `request.auth.uid` and `userId` on creation, and `ownerId` and `createdAt` are strictly immutable on update (`incoming().ownerId == existing().ownerId && incoming().createdAt == existing().createdAt`).
4. **Temporal Integrity**: `createdAt` (on create) and `updatedAt` (on create and update) must equal the server timestamp `request.time`.
5. **Strict Schema & Volumetric Bounds**: Every string (`ownerId`, `displayName`, `selectedLevel`), number (`dailyGoalMinutes`, `currentStreakDays`, `streakFreezeShields`, `sprintHighScore`, `completedUnitIdsCount`, `masteredWordsCount`), and map (`progressSnapshot`) is strictly bounded in size and key allowlists (`hasAll` and `hasOnly`).

## 2. The "Dirty Dozen" Payloads
1. **Payload 1 (Unauthenticated Write)**: `auth = null` attempting `create` on `/users/user_123`. -> `PERMISSION_DENIED`
2. **Payload 2 (Unverified Email Write)**: `auth = { uid: 'user_123', token: { email_verified: false } }` attempting `create` on `/users/user_123`. -> `PERMISSION_DENIED`
3. **Payload 3 (Cross-User Identity Spoofing on Create)**: `auth.uid = 'attacker_99'` attempting `create` on `/users/victim_01` or setting `ownerId: 'victim_01'`. -> `PERMISSION_DENIED`
4. **Payload 4 (Shadow Field / Ghost Property Injection)**: Sending `isAdmin: true` or `role: 'superuser'` alongside valid fields in `/users/user_123`. -> `PERMISSION_DENIED`
5. **Payload 5 (OwnerId Mutation on Update)**: Attempting to change `ownerId` from `'user_123'` to `'user_456'` during `update`. -> `PERMISSION_DENIED`
6. **Payload 6 (CreatedAt Time-Travel Mutation)**: Attempting to modify `createdAt` during `update` or pass a forged past timestamp on `create`. -> `PERMISSION_DENIED`
7. **Payload 7 (Forged UpdatedAt Timestamp)**: Passing a client-forged timestamp instead of `request.time` for `updatedAt`. -> `PERMISSION_DENIED`
8. **Payload 8 (Invalid CEFR Level Enum)**: Setting `selectedLevel: 'Z9'` or a 10KB string instead of `'B1' | 'B2' | 'C1'`. -> `PERMISSION_DENIED`
9. **Payload 9 (Denial-of-Wallet Oversized String)**: Setting `displayName` to a 5000-character string (exceeding `maxLength: 100`). -> `PERMISSION_DENIED`
10. **Payload 10 (Negative or Out-of-Bounds Metrics)**: Setting `dailyGoalMinutes: -50` or `currentStreakDays: -1`. -> `PERMISSION_DENIED`
11. **Payload 11 (Oversized ProgressSnapshot Map)**: Sending a `progressSnapshot` with more than 30 keys or non-map type. -> `PERMISSION_DENIED`
12. **Payload 12 (Cross-User Read / Collection Listing)**: Authenticated user `'user_123'` attempting `get` on `/users/user_999` or `list` on `/users`. -> `PERMISSION_DENIED`
