// =============================================================================
// FIRESTORE COLLECTION CONSTANTS
// =============================================================================

// =============================================================================
// USER & AUTHENTICATION COLLECTIONS
// =============================================================================
const USERS = 'users';
const BADGES = 'badges';
const USER_ACHIEVEMENTS = 'user_achievements';
const API_KEYS = 'api_keys';

// =============================================================================
// SOCIAL & COMMUNITY COLLECTIONS
// =============================================================================
const POSTS = 'posts';
const POST_COMMENTS = 'post_comments';
const POST_LIKES = 'post_likes';
const POST_BOOKMARKS = 'post_bookmarks';
const CLUBS = 'clubs';
const CLUB_MEMBERS = 'club_members';
const CLUB_CHANNELS = 'club_channels';
const CLUB_JOIN_REQUESTS = 'club_join_requests';
const CHAT_MESSAGES = 'chat_messages';
const MESSAGE_REACTIONS = 'message_reactions';
const ONLINE_USERS = 'online_users';
const STUDY_GROUPS = 'study_groups';
const STUDY_GROUP_MEMBERS = 'study_group_members';
const ALUMNI = 'alumni';
const ALUMNI_CONNECTIONS = 'alumni_connections';

// =============================================================================
// EVENTS & ACTIVITIES COLLECTIONS
// =============================================================================
const EVENTS = 'events';
const EVENT_RSVP = 'event_rsvp';
const EVENT_REGISTRATIONS = 'event_registrations';
const EVENT_ATTENDEES = 'event_attendees';
const EVENT_REMINDERS = 'event_reminders';
const SCHEDULED_TASKS = 'scheduled_tasks';

// =============================================================================
// MARKETPLACE & JOBS COLLECTIONS
// =============================================================================
const MARKETPLACE = 'marketplace';
const MARKETPLACE_MESSAGES = 'marketplace_messages';
const MARKETPLACE_SAVED = 'marketplace_saved';
const JOBS = 'jobs';
const JOB_APPLICATIONS = 'job_applicants';

// =============================================================================
// CAMPUS SERVICES COLLECTIONS
// =============================================================================
const LOST_FOUND = 'lost_found';
const RIDES = 'rides';
const RIDE_BOOKINGS = 'ride_bookings';
const RESOURCES = 'resources';
const RESOURCE_DOWNLOADS = 'resource_downloads';

// =============================================================================
// UNIVERSITY & ACADEMIC COLLECTIONS
// =============================================================================
const UNIVERSITIES = 'universities';
const UNIVERSITY_STATS = 'university_stats';
const COURSES = 'courses';
const DEPARTMENTS = 'departments';

// =============================================================================
// NOTIFICATIONS & COMMUNICATION COLLECTIONS
// =============================================================================
const NOTIFICATIONS = 'notifications';
const EMAIL_TEMPLATES = 'email_templates';
const SMS_TEMPLATES = 'sms_templates';

// =============================================================================
// GAMIFICATION & ENGAGEMENT COLLECTIONS
// =============================================================================
const LEADERBOARD = 'leaderboard';
const USER_POINTS = 'user_points';
const USER_STATS = 'user_stats';
const USER_SETTINGS = 'user_settings';
const PAYMENTS = 'payments';
const SUBSCRIPTIONS = 'subscriptions';
const POINTS_HISTORY = 'points_history';
const USER_BADGES = 'user_badges';
const USER_FOLLOWING = 'user_following';

// =============================================================================
// FEEDBACK & SUPPORT COLLECTIONS
// =============================================================================
const FEEDBACK = 'feedback';
const REPORTS = 'reports';
const SUPPORT_TICKETS = 'support_tickets';
const ADMIN_STATS = 'admin_stats';
const ANNOUNCEMENTS = 'announcements';

// =============================================================================
// PAYMENTS & MONETIZATION COLLECTIONS
// =============================================================================
const TRANSACTIONS = 'transactions';
const REFUNDS = 'refunds';
const TOKEN_DENYLIST = 'token_denylist';
const OTP_CODES = 'otp_codes';

// =============================================================================
// SYSTEM & ADMIN COLLECTIONS
// =============================================================================
const SYSTEM_LOGS = 'system_logs';
const SYSTEM_SETTINGS = 'system_settings';
const ADMIN_ANNOUNCEMENTS = 'admin_announcements';
const ANALYTICS = 'analytics';
const BACKUP_LOGS = 'backup_logs';

// =============================================================================
// COLLECTION GROUPS FOR BATCH OPERATIONS
// =============================================================================

// All user-related collections
const USER_COLLECTIONS = [
  USERS,
  BADGES,
  USER_POINTS,
  USER_ACHIEVEMENTS,
  NOTIFICATIONS,
  LEADERBOARD
];

// All community-related collections
const COMMUNITY_COLLECTIONS = [
  POSTS,
  CLUBS,
  CLUB_MEMBERS,
  CHAT_MESSAGES,
  STUDY_GROUPS,
  STUDY_GROUP_MEMBERS,
  ALUMNI,
  ALUMNI_CONNECTIONS
];

// All event-related collections
const EVENT_COLLECTIONS = [
  EVENTS,
  EVENT_REGISTRATIONS,
  EVENT_ATTENDEES
];

// All marketplace-related collections
const MARKETPLACE_COLLECTIONS = [
  MARKETPLACE,
  JOBS,
  JOB_APPLICATIONS
];

// All campus service collections
const CAMPUS_SERVICE_COLLECTIONS = [
  LOST_FOUND,
  RIDES,
  RIDE_BOOKINGS,
  RESOURCES,
  RESOURCE_DOWNLOADS
];

// All academic collections
const ACADEMIC_COLLECTIONS = [
  UNIVERSITIES,
  UNIVERSITY_STATS,
  COURSES,
  DEPARTMENTS
];

// All payment collections
const PAYMENT_COLLECTIONS = [
  PAYMENTS,
  SUBSCRIPTIONS,
  TRANSACTIONS,
  REFUNDS
];

// All admin collections
const ADMIN_COLLECTIONS = [
  SYSTEM_LOGS,
  SYSTEM_SETTINGS,
  ADMIN_ANNOUNCEMENTS,
  ANALYTICS,
  REPORTS,
  SUPPORT_TICKETS,
  BACKUP_LOGS
];

// =============================================================================
// COLLECTION INDEXING REQUIREMENTS
// =============================================================================

// Collections that need compound indexes
const COMPOUND_INDEX_REQUIRED = {
  [EVENTS]: [
    ['date', 'desc'],
    ['category', 'asc'],
    ['university', 'asc'],
    ['status', 'asc']
  ],
  [POSTS]: [
    ['createdAt', 'desc'],
    ['author', 'asc'],
    ['university', 'asc'],
    ['type', 'asc']
  ],
  [MARKETPLACE]: [
    ['category', 'asc'],
    ['status', 'asc'],
    ['price', 'asc'],
    ['createdAt', 'desc']
  ],
  [JOBS]: [
    ['type', 'asc'],
    ['status', 'asc'],
    ['deadline', 'asc'],
    ['createdAt', 'desc']
  ],
  [NOTIFICATIONS]: [
    ['userId', 'asc'],
    ['createdAt', 'desc'],
    ['read', 'asc'],
    ['type', 'asc']
  ],
  [PAYMENTS]: [
    ['userId', 'asc'],
    ['status', 'asc'],
    ['createdAt', 'desc'],
    ['type', 'asc']
  ]
};

// Collections that need single field indexes
const SINGLE_INDEX_REQUIRED = {
  [USERS]: ['email', 'uid', 'university', 'role'],
  [CLUBS]: ['name', 'category', 'university'],
  [EVENTS]: ['title', 'location', 'date'],
  [RIDES]: ['origin', 'destination', 'departureTime'],
  [LOST_FOUND]: ['type', 'category', 'location'],
  [RESOURCES]: ['subject', 'category', 'type'],
  [FEEDBACK]: ['type', 'status', 'createdAt']
};

// =============================================================================
// COLLECTION VALIDATION RULES
// =============================================================================

// Required fields for each collection
const REQUIRED_FIELDS = {
  [USERS]: ['email', 'uid', 'firstName', 'lastName', 'university', 'role'],
  [POSTS]: ['author', 'content', 'type', 'university'],
  [EVENTS]: ['title', 'description', 'date', 'time', 'location', 'organizer'],
  [CLUBS]: ['name', 'description', 'category', 'founder', 'university'],
  [MARKETPLACE]: ['title', 'description', 'price', 'category', 'seller'],
  [JOBS]: ['title', 'description', 'company', 'type', 'location'],
  [RIDES]: ['origin', 'destination', 'departureTime', 'seatsAvailable', 'driver'],
  [LOST_FOUND]: ['title', 'description', 'type', 'category', 'location'],
  [RESOURCES]: ['title', 'description', 'subject', 'type', 'uploader'],
  [PAYMENTS]: ['userId', 'type', 'amount', 'currency', 'status'],
  [NOTIFICATIONS]: ['userId', 'title', 'message', 'type'],
  [FEEDBACK]: ['userId', 'type', 'title', 'description']
};

// =============================================================================
// EXPORT ALL COLLECTIONS AS OBJECT FOR CONVENIENCE
// =============================================================================

const COLLECTIONS = {
  // User & Authentication
  USERS,
  BADGES,
  API_KEYS,

  // Social & Community
  POSTS,
  CLUBS,
  CLUB_MEMBERS,
  CHAT_MESSAGES,
  STUDY_GROUPS,
  STUDY_GROUP_MEMBERS,
  ALUMNI,
  ALUMNI_CONNECTIONS,

  // Events & Activities
  EVENTS,
  EVENT_REGISTRATIONS,
  EVENT_ATTENDEES,

  // Marketplace & Jobs
  MARKETPLACE,
  JOBS,
  JOB_APPLICATIONS,

  // Campus Services
  LOST_FOUND,
  RIDES,
  RIDE_BOOKINGS,
  RESOURCES,
  RESOURCE_DOWNLOADS,

  // University & Academic
  UNIVERSITIES,
  UNIVERSITY_STATS,
  COURSES,
  DEPARTMENTS,

  // Notifications & Communication
  NOTIFICATIONS,
  EMAIL_TEMPLATES,
  SMS_TEMPLATES,

  // Gamification & Engagement
  LEADERBOARD,
  USER_POINTS,
  USER_ACHIEVEMENTS,

  // Feedback & Support
  FEEDBACK,
  REPORTS,
  SUPPORT_TICKETS,

  // Payments & Monetization
  PAYMENTS,
  SUBSCRIPTIONS,
  TRANSACTIONS,
  REFUNDS,

  // System & Admin
  SYSTEM_LOGS,
  SYSTEM_SETTINGS,
  ADMIN_ANNOUNCEMENTS,
  ANALYTICS,
  BACKUP_LOGS
};

module.exports = {
  USERS,
  BADGES,
  USER_ACHIEVEMENTS,
  API_KEYS,
  POSTS,
  POST_COMMENTS,
  POST_LIKES,
  POST_BOOKMARKS,
  CLUBS,
  CLUB_MEMBERS,
  CLUB_CHANNELS,
  CLUB_JOIN_REQUESTS,
  CHAT_MESSAGES,
  MESSAGE_REACTIONS,
  ONLINE_USERS,
  STUDY_GROUPS,
  STUDY_GROUP_MEMBERS,
  ALUMNI,
  ALUMNI_CONNECTIONS,
  EVENTS,
  EVENT_RSVP,
  EVENT_REGISTRATIONS,
  EVENT_ATTENDEES,
  EVENT_REMINDERS,
  SCHEDULED_TASKS,
  MARKETPLACE,
  MARKETPLACE_MESSAGES,
  MARKETPLACE_SAVED,
  JOBS,
  JOB_APPLICATIONS,
  LOST_FOUND,
  RIDES,
  RIDE_BOOKINGS,
  RESOURCES,
  RESOURCE_DOWNLOADS,
  UNIVERSITIES,
  UNIVERSITY_STATS,
  COURSES,
  DEPARTMENTS,
  NOTIFICATIONS,
  EMAIL_TEMPLATES,
  SMS_TEMPLATES,
  LEADERBOARD,
  USER_POINTS,
  USER_STATS,
  USER_SETTINGS,
  PAYMENTS,
  SUBSCRIPTIONS,
  POINTS_HISTORY,
  USER_BADGES,
  USER_FOLLOWING,
  FEEDBACK,
  REPORTS,
  SUPPORT_TICKETS,
  ADMIN_STATS,
  ANNOUNCEMENTS,
  TRANSACTIONS,
  REFUNDS,
  TOKEN_DENYLIST,
  OTP_CODES,
  SYSTEM_LOGS,
  SYSTEM_SETTINGS,
  ADMIN_ANNOUNCEMENTS,
  ANALYTICS,
  BACKUP_LOGS,
  USER_COLLECTIONS,
  COMMUNITY_COLLECTIONS,
  EVENT_COLLECTIONS,
  MARKETPLACE_COLLECTIONS,
  CAMPUS_SERVICE_COLLECTIONS,
  ACADEMIC_COLLECTIONS,
  PAYMENT_COLLECTIONS,
  ADMIN_COLLECTIONS,
  COMPOUND_INDEX_REQUIRED,
  SINGLE_INDEX_REQUIRED,
  REQUIRED_FIELDS,
  COLLECTIONS
};
