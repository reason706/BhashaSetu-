/**
 * Firestore Security Rules Test Suite — Verifies all "Dirty Dozen" adversarial payloads
 * return PERMISSION_DENIED and valid owner operations succeed.
 */
export interface DirtyDozenTestCase {
  id: number;
  name: string;
  auth: { uid: string; email_verified: boolean } | null;
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TEST_CASES: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Write',
    auth: null,
    path: '/users/user_123',
    operation: 'create',
    payload: { ownerId: 'user_123' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Write',
    auth: { uid: 'user_123', email_verified: false },
    path: '/users/user_123',
    operation: 'create',
    payload: { ownerId: 'user_123' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Cross-User Identity Spoofing on Create',
    auth: { uid: 'attacker_99', email_verified: true },
    path: '/users/victim_01',
    operation: 'create',
    payload: { ownerId: 'victim_01' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection (isAdmin: true)',
    auth: { uid: 'user_123', email_verified: true },
    path: '/users/user_123',
    operation: 'create',
    payload: { ownerId: 'user_123', isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'OwnerId Mutation on Update',
    auth: { uid: 'user_123', email_verified: true },
    path: '/users/user_123',
    operation: 'update',
    payload: { ownerId: 'user_456' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'CreatedAt Mutation on Update',
    auth: { uid: 'user_123', email_verified: true },
    path: '/users/user_123',
    operation: 'update',
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Forged UpdatedAt Timestamp',
    auth: { uid: 'user_123', email_verified: true },
    path: '/users/user_123',
    operation: 'update',
    payload: { updatedAt: '2099-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Invalid CEFR Level Enum',
    auth: { uid: 'user_123', email_verified: true },
    path: '/users/user_123',
    operation: 'update',
    payload: { selectedLevel: 'INVALID_LEVEL' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Oversized DisplayName String (>100 chars)',
    auth: { uid: 'user_123', email_verified: true },
    path: '/users/user_123',
    operation: 'update',
    payload: { displayName: 'A'.repeat(500) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Negative Metric Injection',
    auth: { uid: 'user_123', email_verified: true },
    path: '/users/user_123',
    operation: 'update',
    payload: { dailyGoalMinutes: -10, currentStreakDays: -5 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Invalid Non-Map ProgressSnapshot',
    auth: { uid: 'user_123', email_verified: true },
    path: '/users/user_123',
    operation: 'update',
    payload: { progressSnapshot: 'not-a-map' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Cross-User Read and Collection Listing',
    auth: { uid: 'user_123', email_verified: true },
    path: '/users/user_999',
    operation: 'get',
    expectedResult: 'PERMISSION_DENIED',
  },
];
