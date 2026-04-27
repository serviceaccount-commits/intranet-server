// Entity Status
enum ES {
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DRAFT = 'draft',
  OUTDATED = 'outdated',
  UNPUBLISHED = 'unpublished',

  IN_PROGRESS = 'in-progress',
  AWAITING_APPROVAL = 'awaiting-approval',
  APPROVED = 'approved',

  CLASS_EXAM = 'class-exam',
  STANDALONE_EXAM = 'standalone-exam',

  ACTIVE = 'active',
  INACTIVE = 'inactive',

  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',

  PUBLIC = 'public',
  PRIVATE = 'private',

  STRING = 'string',
  BOOLEAN = 'boolean',
  DATE = 'date',

  NO_REPORTS_TO = 'no-reports-to',

  COMPLETED = 'completed',
  INCOMPLETE = 'incomplete',

  OPENED = 'opened',
  CLOSED = 'closed',

  MULTIPLE_SELECTION = 'multiple-selection',
  TRUE_FALSE = 'true-false',

  PASSED = 'passed',
  FAILED = 'failed',
  CAN_RETAKE = 'can-retake',
  NOT_ATTEMPTED = 'not-attempted',
  NO_EXAM = 'no-exam',

  REGULAR = 'regular',
  PERSISTENT = 'persistent',

  PARICUS_LLC = 'paricus-llc',
  PARICUS_COLOMBIA = 'paricus-colombia',
}

export default ES;
