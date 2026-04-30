const { db } = require('../config/firebase');
const { 
  getDoc, 
  getCollection, 
  createDoc, 
  updateDoc, 
  incrementField,
  paginatedQuery,
  countDocuments
} = require('../utils/db.helpers');
const { 
  EVENTS, 
  EVENT_RSVP, 
  EVENT_ATTENDEES, 
  EVENT_REMINDERS,
  SCHEDULED_TASKS,
  USERS,
  CLUBS,
  CLUB_MEMBERS,
  USER_POINTS,
  NOTIFICATIONS
} = require('../utils/collections');
const { 
  uploadEventImages 
} = require('../services/upload.service');
const { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  notFoundResponse 
} = require('../utils/response');

/**
 * Create a new event
 */
const createEvent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      startDate, 
      endDate, 
      timezone,
      location, 
      isOnline, 
      meetLink, 
      zoomLink, 
      platform, 
      maxAttendees, 
      university, 
      isGlobal, 
      tags 
    } = req.body;
    const userId = req.user.id;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start <= now) {
      return errorResponse(res, 'Start date must be in the future', 400);
    }

    if (end <= start) {
      return errorResponse(res, 'End date must be after start date', 400);
    }

    // Handle banner upload
    let banner = null;
    if (req.files && req.files.banner) {
      const uploadResult = await uploadEventImages(req.files.banner, 'temp');
      if (!uploadResult.success) {
        return errorResponse(res, 'Failed to upload banner', 400);
      }
      banner = {
        url: uploadResult.file.url,
        publicId: uploadResult.file.publicId,
        width: uploadResult.file.width,
        height: uploadResult.file.height
      };
    }

    // Generate Meet link if needed
    let generatedMeetLink = null;
    if (isOnline && platform === 'google_meet') {
      // TODO: Implement Google Calendar API integration
      // For now, we'll use a placeholder
      generatedMeetLink = `https://meet.google.com/placeholder-${Date.now()}`;
    }

    // Create event
    const eventData = {
      title: title.trim(),
      description: description.trim(),
      category,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      timezone: timezone || 'UTC',
      location: location?.trim() || null,
      isOnline: isOnline || false,
      meetLink: meetLink || generatedMeetLink || null,
      zoomLink: zoomLink || null,
      platform: platform || null,
      banner,
      maxAttendees: maxAttendees || null,
      university: university || req.user.university,
      isGlobal: isGlobal || false,
      tags: tags || [],
      organizer: userId,
      organizerName: `${req.user.firstName} ${req.user.lastName}`,
      organizerAvatar: req.user.profilePicture,
      attendeeCount: 0,
      rsvpCount: 0,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const event = await createDoc(EVENTS, eventData);

    // Schedule reminder notifications
    await scheduleEventReminders(event.id, start, end);

    return createdResponse(res, { event }, 'Event created successfully');

  } catch (error) {
    console.error('Error creating event:', error);
    return errorResponse(res, 'Failed to create event', 500);
  }
};

/**
 * Get all events (public feed)
 */
const getAllEvents = async (req, res) => {
  try {
    const { 
      category, 
      university, 
      from, 
      to, 
      isOnline, 
      page = 1, 
      limit = 20 
    } = req.query;

    const pageSize = Math.min(parseInt(limit), 50);
    const currentPage = Math.max(parseInt(page), 1);

    // Build filters
    const filters = [
      ['status', '==', 'upcoming'],
      ['isDeleted', '==', false]
    ];

    if (category) {
      filters.push(['category', '==', category]);
    }

    if (university) {
      filters.push(['university', '==', university]);
    } else {
      // If no university specified, include global events and user's university events
      filters.push(['isGlobal', '==', true]);
    }

    if (isOnline !== undefined) {
      filters.push(['isOnline', '==', isOnline === 'true']);
    }

    // Date range filtering
    if (from) {
      const fromDate = new Date(from);
      filters.push(['startDate', '>=', fromDate.toISOString()]);
    }

    if (to) {
      const toDate = new Date(to);
      filters.push(['endDate', '<=', toDate.toISOString()]);
    }

    // Get events sorted by start date (upcoming first)
    const result = await paginatedQuery(EVENTS, filters, pageSize, null, {
      field: 'startDate',
      direction: 'asc'
    });

    // Enrich events with RSVP status for logged-in user
    const enrichedEvents = await Promise.all(
      result.data.map(async (event) => {
        const enrichedEvent = { ...event };

        // Add RSVP status if user is logged in
        if (req.user) {
          const userRsvp = await getCollection(EVENT_RSVP, [
            ['eventId', '==', event.id],
            ['userId', '==', req.user.id]
          ]);
          enrichedEvent.userRsvp = userRsvp.length > 0 ? userRsvp[0] : null;
        }

        return enrichedEvent;
      })
    );

    return successResponse(res, {
      events: enrichedEvents,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: result.totalCount,
        totalPages: Math.ceil(result.totalCount / pageSize),
        hasNextPage: result.hasMore,
        nextCursor: result.nextCursor
      }
    });

  } catch (error) {
    console.error('Error getting events:', error);
    return errorResponse(res, 'Failed to fetch events', 500);
  }
};

/**
 * Get single event by ID
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await getDoc(EVENTS, id);
    if (!event || event.isDeleted) {
      return notFoundResponse(res, 'Event not found');
    }

    // Get attendees preview (first 5 avatars)
    const attendees = await getCollection(EVENT_RSVP, [
      ['eventId', '==', id]
    ], { limit: 5 });

    const attendeesPreview = await Promise.all(
      attendees.map(async (rsvp) => {
        const user = await getDoc(USERS, rsvp.userId);
        return {
          userId: rsvp.userId,
          name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          avatar: user?.profilePicture || null,
          rsvpType: rsvp.type,
          rsvpAt: rsvp.rsvpAt
        };
      })
    );

    // Add user RSVP status if logged in
    let userRsvp = null;
    if (req.user) {
      const userRsvpRecords = await getCollection(EVENT_RSVP, [
        ['eventId', '==', id],
        ['userId', '==', req.user.id]
      ]);
      userRsvp = userRsvpRecords.length > 0 ? userRsvpRecords[0] : null;
    }

    const enrichedEvent = {
      ...event,
      attendeesPreview,
      userRsvp,
      attendeeCount: event.rsvpCount
    };

    return successResponse(res, { event: enrichedEvent });

  } catch (error) {
    console.error('Error getting event:', error);
    return errorResponse(res, 'Failed to fetch event', 500);
  }
};

/**
 * Update an event
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      category, 
      startDate, 
      endDate, 
      timezone,
      location, 
      isOnline, 
      meetLink, 
      zoomLink, 
      platform, 
      maxAttendees, 
      university, 
      isGlobal, 
      tags 
    } = req.body;
    const userId = req.user.id;

    const event = await getDoc(EVENTS, id);
    if (!event || event.isDeleted) {
      return notFoundResponse(res, 'Event not found');
    }

    // Check permissions (organizer or admin)
    const isOrganizer = event.organizer === userId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOrganizer && !isAdmin) {
      return errorResponse(res, 'You can only edit your own events', 403);
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      if (start <= now) {
        return errorResponse(res, 'Start date must be in the future', 400);
      }

      if (end <= start) {
        return errorResponse(res, 'End date must be after start date', 400);
      }
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    // Update fields if provided
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (startDate !== undefined) updateData.startDate = new Date(startDate).toISOString();
    if (endDate !== undefined) updateData.endDate = new Date(endDate).toISOString();
    if (timezone !== undefined) updateData.timezone = timezone;
    if (location !== undefined) updateData.location = location?.trim() || null;
    if (isOnline !== undefined) updateData.isOnline = isOnline;
    if (meetLink !== undefined) updateData.meetLink = meetLink;
    if (zoomLink !== undefined) updateData.zoomLink = zoomLink;
    if (platform !== undefined) updateData.platform = platform;
    if (maxAttendees !== undefined) updateData.maxAttendees = maxAttendees;
    if (university !== undefined) updateData.university = university;
    if (isGlobal !== undefined) updateData.isGlobal = isGlobal;
    if (tags !== undefined) updateData.tags = tags;

    // Handle banner upload
    if (req.files && req.files.banner) {
      const uploadResult = await uploadEventImages(req.files.banner, id);
      if (!uploadResult.success) {
        return errorResponse(res, 'Failed to upload banner', 400);
      }
      updateData.banner = {
        url: uploadResult.file.url,
        publicId: uploadResult.file.publicId,
        width: uploadResult.file.width,
        height: uploadResult.file.height
      };
    }

    const updatedEvent = await updateDoc(EVENTS, id, updateData);

    // Reschedule reminders if dates changed
    if (startDate || endDate) {
      await scheduleEventReminders(id, 
        new Date(updatedEvent.startDate), 
        new Date(updatedEvent.endDate)
      );
    }

    return successResponse(res, { event: updatedEvent }, 'Event updated successfully');

  } catch (error) {
    console.error('Error updating event:', error);
    return errorResponse(res, 'Failed to update event', 500);
  }
};

/**
 * Delete an event
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await getDoc(EVENTS, id);
    if (!event || event.isDeleted) {
      return notFoundResponse(res, 'Event not found');
    }

    // Check permissions (organizer or admin)
    const isOrganizer = event.organizer === userId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOrganizer && !isAdmin) {
      return errorResponse(res, 'You can only delete your own events', 403);
    }

    await updateDoc(EVENTS, id, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: userId
    });

    // Cancel scheduled reminders
    await cancelEventReminders(id);

    return successResponse(res, null, 'Event deleted successfully');

  } catch (error) {
    console.error('Error deleting event:', error);
    return errorResponse(res, 'Failed to delete event', 500);
  }
};

/**
 * RSVP to an event
 */
const rsvpEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const userId = req.user.id;

    if (!['in_person', 'online'].includes(type)) {
      return errorResponse(res, 'Invalid RSVP type', 400);
    }

    const event = await getDoc(EVENTS, id);
    if (!event || event.isDeleted) {
      return notFoundResponse(res, 'Event not found');
    }

    // Check if event is full
    if (event.maxAttendees && event.rsvpCount >= event.maxAttendees) {
      return errorResponse(res, 'Event is full', 400);
    }

    // Check if already RSVP'd
    const existingRsvp = await getCollection(EVENT_RSVP, [
      ['eventId', '==', id],
      ['userId', '==', userId]
    ]);

    if (existingRsvp.length > 0) {
      return errorResponse(res, 'Already RSVP\'d to this event', 409);
    }

    // Create RSVP
    const rsvpData = {
      eventId: id,
      userId,
      type,
      status: 'confirmed',
      rsvpAt: new Date().toISOString(),
      checkedIn: false
    };

    const rsvp = await createDoc(EVENT_RSVP, rsvpData);

    // Increment RSVP count
    await incrementField(EVENTS, id, 'rsvpCount', 1);

    // Determine join link based on RSVP type
    let joinLink = null;
    if (type === 'online' && event.meetLink) {
      joinLink = event.meetLink;
    } else if (type === 'online' && event.zoomLink) {
      joinLink = event.zoomLink;
    }

    return successResponse(res, {
      rsvp,
      joinLink
    }, 'RSVP confirmed');

  } catch (error) {
    console.error('Error RSVPing to event:', error);
    return errorResponse(res, 'Failed to RSVP to event', 500);
  }
};

/**
 * Cancel RSVP
 */
const cancelRsvp = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await getDoc(EVENTS, id);
    if (!event || event.isDeleted) {
      return notFoundResponse(res, 'Event not found');
    }

    // Find RSVP
    const existingRsvp = await getCollection(EVENT_RSVP, [
      ['eventId', '==', id],
      ['userId', '==', userId]
    ]);

    if (existingRsvp.length === 0) {
      return errorResponse(res, 'No RSVP found for this event', 404);
    }

    // Delete RSVP
    await db.collection(EVENT_RSVP).doc(existingRsvp[0].id).delete();

    // Decrement RSVP count
    await incrementField(EVENTS, id, 'rsvpCount', -1);

    return successResponse(res, null, 'RSVP cancelled');

  } catch (error) {
    console.error('Error cancelling RSVP:', error);
    return errorResponse(res, 'Failed to cancel RSVP', 500);
  }
};

/**
 * Check in to an event
 */
const checkInEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await getDoc(EVENTS, id);
    if (!event || event.isDeleted) {
      return notFoundResponse(res, 'Event not found');
    }

    // Find RSVP
    const existingRsvp = await getCollection(EVENT_RSVP, [
      ['eventId', '==', id],
      ['userId', '==', userId]
    ]);

    if (existingRsvp.length === 0) {
      return errorResponse(res, 'No RSVP found for this event', 404);
    }

    const rsvp = existingRsvp[0];

    if (rsvp.checkedIn) {
      return errorResponse(res, 'Already checked in', 409);
    }

    // Mark as checked in
    await updateDoc(EVENT_RSVP, rsvp.id, {
      checkedIn: true,
      checkedInAt: new Date().toISOString()
    });

    // Award points
    await incrementField(USER_POINTS, userId, 'points', 15);

    // Update attended events count on user profile
    await incrementField(USERS, userId, 'attendedEvents', 1);

    return successResponse(res, null, 'Check-in successful');

  } catch (error) {
    console.error('Error checking in to event:', error);
    return errorResponse(res, 'Failed to check in to event', 500);
  }
};

/**
 * Get user's RSVP'd events
 */
const getUserRsvps = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const pageSize = Math.min(parseInt(limit), 50);
    const currentPage = Math.max(parseInt(page), 1);

    // Get user's RSVPs
    const rsvps = await getCollection(EVENT_RSVP, [
      ['userId', '==', userId]
    ]);

    // Get event IDs
    const eventIds = rsvps.map(rsvp => rsvp.eventId);

    if (eventIds.length === 0) {
      return successResponse(res, {
        events: [],
        pagination: {
          page: currentPage,
          limit: pageSize,
          total: 0,
          totalPages: 0
        }
      });
    }

    // Get events
    const events = await Promise.all(
      eventIds.map(async (eventId) => {
        const event = await getDoc(EVENTS, eventId);
        if (event && !event.isDeleted) {
          const userRsvp = rsvps.find(rsvp => rsvp.eventId === eventId);
          return {
            ...event,
            userRsvp
          };
        }
        return null;
      })
    );

    const validEvents = events.filter(event => event !== null);

    // Sort by start date
    validEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedEvents = validEvents.slice(startIndex, startIndex + pageSize);

    return successResponse(res, {
      events: paginatedEvents,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: validEvents.length,
        totalPages: Math.ceil(validEvents.length / pageSize)
      }
    });

  } catch (error) {
    console.error('Error getting user RSVPs:', error);
    return errorResponse(res, 'Failed to fetch RSVPs', 500);
  }
};

/**
 * Opt in to event reminders
 */
const toggleEventReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await getDoc(EVENTS, id);
    if (!event || event.isDeleted) {
      return notFoundResponse(res, 'Event not found');
    }

    // Check if already opted in
    const existingReminder = await getCollection(EVENT_REMINDERS, [
      ['eventId', '==', id],
      ['userId', '==', userId]
    ]);

    let reminderOptedIn;

    if (existingReminder.length > 0) {
      // Remove reminder preference
      await db.collection(EVENT_REMINDERS).doc(existingReminder[0].id).delete();
      reminderOptedIn = false;
    } else {
      // Add reminder preference
      await createDoc(EVENT_REMINDERS, {
        eventId: id,
        userId,
        optedInAt: new Date().toISOString()
      });
      reminderOptedIn = true;
    }

    return successResponse(res, {
      reminderOptedIn
    }, reminderOptedIn ? 'Reminders enabled' : 'Reminders disabled');

  } catch (error) {
    console.error('Error toggling event reminder:', error);
    return errorResponse(res, 'Failed to toggle reminders', 500);
  }
};

/**
 * Schedule event reminders
 */
const scheduleEventReminders = async (eventId, startDate, endDate) => {
  try {
    const now = new Date();
    
    // Schedule 24-hour reminder
    const reminder24h = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > now) {
      await createDoc(SCHEDULED_TASKS, {
        type: 'event_reminder',
        eventId,
        reminderType: '24h',
        scheduledFor: reminder24h.toISOString(),
        status: 'scheduled',
        createdAt: now.toISOString()
      });
    }

    // Schedule 30-minute reminder
    const reminder30m = new Date(startDate.getTime() - 30 * 60 * 1000);
    if (reminder30m > now) {
      await createDoc(SCHEDULED_TASKS, {
        type: 'event_reminder',
        eventId,
        reminderType: '30m',
        scheduledFor: reminder30m.toISOString(),
        status: 'scheduled',
        createdAt: now.toISOString()
      });
    }

  } catch (error) {
    console.error('Error scheduling event reminders:', error);
  }
};

/**
 * Cancel event reminders
 */
const cancelEventReminders = async (eventId) => {
  try {
    const reminders = await getCollection(SCHEDULED_TASKS, [
      ['type', '==', 'event_reminder'],
      ['eventId', '==', eventId],
      ['status', '==', 'scheduled']
    ]);

    for (const reminder of reminders) {
      await updateDoc(SCHEDULED_TASKS, reminder.id, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error cancelling event reminders:', error);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  cancelRsvp,
  checkInEvent,
  getUserRsvps,
  toggleEventReminder
};
