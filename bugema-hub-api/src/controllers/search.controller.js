const { 
  searchDocuments 
} = require('../utils/db.helpers');
const { 
  EVENTS, 
  CLUBS, 
  JOBS, 
  MARKETPLACE, 
  USERS, 
  POSTS 
} = require('../utils/collections');
const { 
  successResponse, 
  errorResponse 
} = require('../utils/response');

/**
 * Global search across multiple collections
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return successResponse(res, { results: [] }, 'Empty search query');
    }

    const query = q.trim();

    // Perform searches across multiple collections in parallel
    const [
      events,
      clubs,
      jobs,
      marketplace,
      users,
      posts
    ] = await Promise.all([
      searchDocuments(EVENTS, 'title', query, [['isDeleted', '==', false]], { limit: 10 }),
      searchDocuments(CLUBS, 'name', query, [['isDeleted', '==', false]], { limit: 10 }),
      searchDocuments(JOBS, 'title', query, [['isDeleted', '==', false]], { limit: 10 }),
      searchDocuments(MARKETPLACE, 'title', query, [['isDeleted', '==', false]], { limit: 10 }),
      searchDocuments(USERS, 'firstName', query, [], { limit: 10 }),
      searchDocuments(POSTS, 'title', query, [['isDeleted', '==', false]], { limit: 10 })
    ]);

    // Transform and unify results into a common format for the frontend
    const unifiedResults = [
      ...events.map(item => ({
        id: item.id,
        type: 'event',
        title: item.title,
        subtitle: item.organizerName || 'University Event',
        description: item.description,
        url: `/events/${item.id}`,
        image: item.banner?.url || null,
        metadata: {
          date: item.startDate,
          location: item.location
        }
      })),
      ...clubs.map(item => ({
        id: item.id,
        type: 'club',
        title: item.name,
        subtitle: `${item.category || 'Student Club'} • ${item.memberCount || 0} members`,
        description: item.description,
        url: `/clubs/${item.id}`,
        image: item.logo?.url || null,
        metadata: {
          memberCount: item.memberCount
        }
      })),
      ...jobs.map(item => ({
        id: item.id,
        type: 'job',
        title: item.title,
        subtitle: item.company || 'Campus Opportunity',
        description: item.description,
        url: `/jobs/${item.id}`,
        metadata: {
          author: item.company
        }
      })),
      ...marketplace.map(item => ({
        id: item.id,
        type: 'marketplace',
        title: item.title,
        subtitle: `${item.category || 'Electronics'} • UGX ${item.price?.toLocaleString() || 'Contact for price'}`,
        description: item.description,
        url: `/marketplace/${item.id}`,
        image: item.images?.[0]?.url || null,
        metadata: {
          price: item.price,
          currency: 'UGX'
        }
      })),
      ...users.map(item => ({
        id: item.id,
        type: 'person',
        title: `${item.firstName} ${item.lastName}`,
        subtitle: `${item.department || 'Student'} • ${item.year || 'N/A'}`,
        description: item.bio,
        url: `/profile/${item.id}`,
        image: item.profilePicture || null
      })),
      ...posts.map(item => ({
        id: item.id,
        type: 'post',
        title: item.title || 'Untitled Post',
        subtitle: `Posted by ${item.authorName || 'Anonymous'}`,
        description: item.content,
        url: `/feed/${item.id}`,
        metadata: {
          author: item.authorName,
          date: item.createdAt
        }
      }))
    ];

    // Sort results (optional: by relevance or date)
    // For now, we'll keep them grouped by type as returned by Promise.all

    return successResponse(res, { 
      results: unifiedResults,
      count: unifiedResults.length,
      query
    }, `Found ${unifiedResults.length} results for "${query}"`);

  } catch (error) {
    console.error('Global search error:', error);
    return errorResponse(res, 'Failed to perform search', 500);
  }
};

module.exports = {
  globalSearch
};
