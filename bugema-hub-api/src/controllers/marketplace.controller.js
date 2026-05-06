const { db } = require('../config/firebase');
const { 
  getDoc, 
  getCollection, 
  createDoc, 
  updateDoc, 
  incrementField,
  paginatedQuery
} = require('../utils/db.helpers');
const { 
  MARKETPLACE, 
  MARKETPLACE_MESSAGES,
  MARKETPLACE_SAVED,
  REPORTS,
  USERS,
  USER_POINTS,
  NOTIFICATIONS
} = require('../utils/collections');
const { 
  uploadMarketplaceImages 
} = require('../services/upload.service');
const { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  notFoundResponse 
} = require('../utils/response');

// Currency conversion rates (simplified - in production, use real API)
const CURRENCY_RATES = {
  UGX: 0.00027,  // 1 UGX = 0.00027 USD
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.27
};

/**
 * Create marketplace listing
 */
const createListing = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      price, 
      currency, 
      condition,
      location, 
      contactMethod, 
      contactValue 
    } = req.body;
    const userId = req.user.id;

    // Validate category
    const validCategories = ['textbooks', 'electronics', 'clothing', 'food', 'services', 'accommodation', 'transport', 'other'];
    if (!validCategories.includes(category)) {
      return errorResponse(res, 'Invalid category', 400);
    }

    // Validate condition
    const validConditions = ['new', 'good', 'fair'];
    if (!validConditions.includes(condition)) {
      return errorResponse(res, 'Invalid condition', 400);
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.images) {
      const uploadResult = await uploadMarketplaceImages(req.files.images, 'temp');
      if (!uploadResult.success) {
        return errorResponse(res, 'Failed to upload images', 400);
      }
      images = uploadResult.files.map(file => ({
        url: file.url,
        publicId: file.publicId,
        width: file.width,
        height: file.height
      }));
    }

    // Calculate price in USD
    const priceInUSD = price * (CURRENCY_RATES[currency] || 1);

    // Create listing
    const listingData = {
      title: title.trim(),
      description: description.trim(),
      category,
      price: parseFloat(price),
      currency: currency || 'USD',
      priceInUSD,
      condition,
      location: location?.trim() || '',
      contactMethod,
      contactValue: contactValue?.trim() || '',
      images,
      seller: userId,
      sellerName: `${req.user.firstName} ${req.user.lastName}`,
      sellerAvatar: req.user.profilePicture,
      university: req.user.university,
      status: 'active',
      viewCount: 0,
      saveCount: 0,
      messageCount: 0,
      isSold: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const listing = await createDoc(MARKETPLACE, listingData);

    return createdResponse(res, { listing }, 'Listing created successfully');

  } catch (error) {
    console.error('Error creating listing:', error);
    return errorResponse(res, 'Failed to create listing', 500);
  }
};

/**
 * Get all marketplace listings
 */
const getAllListings = async (req, res) => {
  try {
    const { 
      category, 
      condition, 
      minPrice, 
      maxPrice, 
      university,
      currency,
      search, 
      sort = 'newest',
      page = 1, 
      limit = 20 
    } = req.query;

    const pageSize = Math.min(parseInt(limit), 50);
    const currentPage = Math.max(parseInt(page), 1);

    // Build filters
    const filters = [
      ['status', '==', 'active'],
      ['isDeleted', '==', false],
      ['isSold', '==', false]
    ];

    if (category) {
      filters.push(['category', '==', category]);
    }

    if (condition) {
      filters.push(['condition', '==', condition]);
    }

    if (university) {
      filters.push(['university', '==', university]);
    }

    // Price filtering - use USD for comparison
    if (minPrice || maxPrice) {
      const minPriceUSD = minPrice ? parseFloat(minPrice) : 0;
      const maxPriceUSD = maxPrice ? parseFloat(maxPrice) : Infinity;
      
      if (currency && currency !== 'USD') {
        // Convert to USD for filtering
        const conversionRate = CURRENCY_RATES[currency] || 1;
        filters.push(['priceInUSD', '>=', minPriceUSD / conversionRate]);
        filters.push(['priceInUSD', '<=', maxPriceUSD / conversionRate]);
      } else {
        filters.push(['priceInUSD', '>=', minPriceUSD]);
        filters.push(['priceInUSD', '<=', maxPriceUSD]);
      }
    }

    // Get listings
    let orderBy;
    if (sort === 'price_asc') {
      orderBy = { field: 'priceInUSD', direction: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { field: 'priceInUSD', direction: 'desc' };
    } else {
      orderBy = { field: 'createdAt', direction: 'desc' };
    }

    const result = await paginatedQuery(MARKETPLACE, filters, pageSize, null, orderBy);

    // Apply search filter if provided
    let listings = result.data;
    if (search) {
      listings = listings.filter(listing => {
        const searchLower = search.toLowerCase();
        return listing.title.toLowerCase().includes(searchLower) ||
               listing.description.toLowerCase().includes(searchLower);
      });
    }

    // Enrich listings with seller information and convert prices
    const enrichedListings = await Promise.all(
      listings.map(async (listing) => {
        const seller = await getDoc(USERS, listing.seller);
        
        // Convert price to requested currency
        let displayPrice = listing.price;
        let displayCurrency = listing.currency;
        
        if (currency && currency !== listing.currency) {
          const fromRate = CURRENCY_RATES[listing.currency] || 1;
          const toRate = CURRENCY_RATES[currency] || 1;
          displayPrice = (listing.price / fromRate) * toRate;
          displayCurrency = currency;
        }

        return {
          ...listing,
          sellerName: seller ? `${seller.firstName} ${seller.lastName}` : 'Unknown',
          sellerAvatar: seller?.profilePicture || null,
          sellerVerified: seller?.verifiedStudent || false,
          sellerJoinedAt: seller?.createdAt || null,
          displayPrice,
          displayCurrency
        };
      })
    );

    return successResponse(res, {
      listings: enrichedListings,
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
    console.error('Error getting listings:', error);
    return errorResponse(res, 'Failed to fetch listings', 500);
  }
};

/**
 * Get single listing by ID
 */
const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await getDoc(MARKETPLACE, id);
    if (!listing || listing.isDeleted || listing.status !== 'active') {
      return notFoundResponse(res, 'Listing not found');
    }

    // Increment view count
    await incrementField(MARKETPLACE, id, 'viewCount', 1);

    // Get seller information
    const seller = await getDoc(USERS, listing.seller);

    // Check if user saved this listing
    let isSaved = false;
    if (req.user) {
      const savedListing = await getCollection(MARKETPLACE_SAVED, [
        ['listingId', '==', id],
        ['userId', '==', req.user.id]
      ]);
      isSaved = savedListing.length > 0;
    }

    const enrichedListing = {
      ...listing,
      sellerName: seller ? `${seller.firstName} ${seller.lastName}` : 'Unknown',
      sellerAvatar: seller?.profilePicture || null,
      sellerVerified: seller?.verifiedStudent || false,
      sellerJoinedAt: seller?.createdAt || null,
      isSaved
    };

    return successResponse(res, { listing: enrichedListing });

  } catch (error) {
    console.error('Error getting listing:', error);
    return errorResponse(res, 'Failed to fetch listing', 500);
  }
};

/**
 * Update listing
 */
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      category, 
      price, 
      currency, 
      condition,
      location, 
      contactMethod, 
      contactValue 
    } = req.body;
    const userId = req.user.id;

    const listing = await getDoc(MARKETPLACE, id);
    if (!listing || listing.isDeleted) {
      return notFoundResponse(res, 'Listing not found');
    }

    // Check if user is the seller
    if (listing.seller !== userId) {
      return errorResponse(res, 'You can only edit your own listings', 403);
    }

    // Validate updates
    if (category && !['textbooks', 'electronics', 'clothing', 'food', 'services', 'accommodation', 'transport', 'other'].includes(category)) {
      return errorResponse(res, 'Invalid category', 400);
    }

    if (condition && !['new', 'good', 'fair'].includes(condition)) {
      return errorResponse(res, 'Invalid condition', 400);
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    // Update fields if provided
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (currency !== undefined) updateData.currency = currency;
    if (condition !== undefined) updateData.condition = condition;
    if (location !== undefined) updateData.location = location?.trim() || '';
    if (contactMethod !== undefined) updateData.contactMethod = contactMethod;
    if (contactValue !== undefined) updateData.contactValue = contactValue?.trim() || '';

    // Recalculate price in USD if price or currency changed
    if (price !== undefined || currency !== undefined) {
      const finalPrice = price !== undefined ? parseFloat(price) : listing.price;
      const finalCurrency = currency !== undefined ? currency : listing.currency;
      updateData.priceInUSD = finalPrice * (CURRENCY_RATES[finalCurrency] || 1);
    }

    // Handle image uploads
    if (req.files && req.files.images) {
      const uploadResult = await uploadMarketplaceImages(req.files.images, id);
      if (!uploadResult.success) {
        return errorResponse(res, 'Failed to upload images', 400);
      }
      updateData.images = uploadResult.files.map(file => ({
        url: file.url,
        publicId: file.publicId,
        width: file.width,
        height: file.height
      }));
    }

    const updatedListing = await updateDoc(MARKETPLACE, id, updateData);

    return successResponse(res, { listing: updatedListing }, 'Listing updated successfully');

  } catch (error) {
    console.error('Error updating listing:', error);
    return errorResponse(res, 'Failed to update listing', 500);
  }
};

/**
 * Mark listing as sold
 */
const markAsSold = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const listing = await getDoc(MARKETPLACE, id);
    if (!listing || listing.isDeleted) {
      return notFoundResponse(res, 'Listing not found');
    }

    // Check if user is the seller
    if (listing.seller !== userId) {
      return errorResponse(res, 'You can only mark your own listings as sold', 403);
    }

    if (listing.isSold) {
      return errorResponse(res, 'Listing is already marked as sold', 409);
    }

    // Check if this is the first sale
    const sellerListings = await getCollection(MARKETPLACE, [
      ['seller', '==', userId],
      ['isSold', '==', true]
    ]);

    const isFirstSale = sellerListings.length === 0;

    // Mark as sold
    await updateDoc(MARKETPLACE, id, {
      isSold: true,
      soldAt: new Date().toISOString()
    });

    // Award points if first sale
    if (isFirstSale) {
      await incrementField(USER_POINTS, userId, 'points', 10);
    }

    // Notify users who saved this listing
    const savedListings = await getCollection(MARKETPLACE_SAVED, [
      ['listingId', '==', id]
    ]);

    for (const saved of savedListings) {
      // TODO: Implement notification service
      console.log('Notifying user of sold listing:', saved.userId);
    }

    return successResponse(res, null, 'Listing marked as sold');

  } catch (error) {
    console.error('Error marking listing as sold:', error);
    return errorResponse(res, 'Failed to mark listing as sold', 500);
  }
};

/**
 * Delete listing
 */
const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const listing = await getDoc(MARKETPLACE, id);
    if (!listing || listing.isDeleted) {
      return notFoundResponse(res, 'Listing not found');
    }

    // Check if user is the seller or admin
    const isSeller = listing.seller === userId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isSeller && !isAdmin) {
      return errorResponse(res, 'You can only delete your own listings', 403);
    }

    await updateDoc(MARKETPLACE, id, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: userId
    });

    return successResponse(res, null, 'Listing deleted successfully');

  } catch (error) {
    console.error('Error deleting listing:', error);
    return errorResponse(res, 'Failed to delete listing', 500);
  }
};

/**
 * Toggle save listing
 */
const toggleSaveListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const listing = await getDoc(MARKETPLACE, id);
    if (!listing || listing.isDeleted || listing.status !== 'active') {
      return notFoundResponse(res, 'Listing not found');
    }

    // Check if already saved
    const existingSave = await getCollection(MARKETPLACE_SAVED, [
      ['listingId', '==', id],
      ['userId', '==', userId]
    ]);

    let isSaved;

    if (existingSave.length > 0) {
      // Remove save
      await db.collection(MARKETPLACE_SAVED).doc(existingSave[0].id).delete();
      await incrementField(MARKETPLACE, id, 'saveCount', -1);
      isSaved = false;
    } else {
      // Add save
      await createDoc(MARKETPLACE_SAVED, {
        listingId: id,
        userId,
        savedAt: new Date().toISOString()
      });
      await incrementField(MARKETPLACE, id, 'saveCount', 1);
      isSaved = true;
    }

    return successResponse(res, { isSaved }, isSaved ? 'Listing saved' : 'Listing unsaved');

  } catch (error) {
    console.error('Error toggling save listing:', error);
    return errorResponse(res, 'Failed to toggle save listing', 500);
  }
};

/**
 * Report listing
 */
const reportListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason || reason.trim().length === 0) {
      return errorResponse(res, 'Report reason is required', 400);
    }

    const listing = await getDoc(MARKETPLACE, id);
    if (!listing || listing.isDeleted) {
      return notFoundResponse(res, 'Listing not found');
    }

    // Check if already reported
    const existingReport = await getCollection(REPORTS, [
      ['resourceType', '==', 'marketplace'],
      ['resourceId', '==', id],
      ['reportedBy', '==', userId]
    ]);

    if (existingReport.length > 0) {
      return errorResponse(res, 'You have already reported this listing', 409);
    }

    // Create report
    await createDoc(REPORTS, {
      resourceType: 'marketplace',
      resourceId: id,
      reportedBy: userId,
      reason: reason.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    return successResponse(res, null, 'Listing reported successfully');

  } catch (error) {
    console.error('Error reporting listing:', error);
    return errorResponse(res, 'Failed to report listing', 500);
  }
};

/**
 * Get user's listings
 */
const getUserListings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const pageSize = Math.min(parseInt(limit), 50);
    const currentPage = Math.max(parseInt(page), 1);

    // Get user's listings
    const listings = await getCollection(MARKETPLACE, [
      ['seller', '==', userId],
      ['isDeleted', '==', false]
    ]);

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedListings = listings.slice(startIndex, startIndex + pageSize);

    return successResponse(res, {
      listings: paginatedListings,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: listings.length,
        totalPages: Math.ceil(listings.length / pageSize)
      }
    });

  } catch (error) {
    console.error('Error getting user listings:', error);
    return errorResponse(res, 'Failed to fetch your listings', 500);
  }
};

/**
 * Get user's saved listings
 */
const getUserSavedListings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const pageSize = Math.min(parseInt(limit), 50);
    const currentPage = Math.max(parseInt(page), 1);

    // Get user's saved listings
    const savedListings = await getCollection(MARKETPLACE_SAVED, [
      ['userId', '==', userId]
    ]);

    // Get listing IDs
    const listingIds = savedListings.map(save => save.listingId);

    if (listingIds.length === 0) {
      return successResponse(res, {
        listings: [],
        pagination: {
          page: currentPage,
          limit: pageSize,
          total: 0,
          totalPages: 0
        }
      });
    }

    // Get listings
    const listings = await Promise.all(
      listingIds.map(async (listingId) => {
        const listing = await getDoc(MARKETPLACE, listingId);
        if (listing && !listing.isDeleted && listing.status === 'active') {
          const seller = await getDoc(USERS, listing.seller);
          return {
            ...listing,
            sellerName: seller ? `${seller.firstName} ${seller.lastName}` : 'Unknown',
            sellerAvatar: seller?.profilePicture || null,
            sellerVerified: seller?.verifiedStudent || false
          };
        }
        return null;
      })
    );

    const validListings = listings.filter(listing => listing !== null);

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedListings = validListings.slice(startIndex, startIndex + pageSize);

    return successResponse(res, {
      listings: paginatedListings,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: validListings.length,
        totalPages: Math.ceil(validListings.length / pageSize)
      }
    });

  } catch (error) {
    console.error('Error getting saved listings:', error);
    return errorResponse(res, 'Failed to fetch saved listings', 500);
  }
};

/**
 * Start conversation about listing
 */
const startConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return errorResponse(res, 'Message is required', 400);
    }

    const listing = await getDoc(MARKETPLACE, id);
    if (!listing || listing.isDeleted || listing.status !== 'active') {
      return notFoundResponse(res, 'Listing not found');
    }

    // Check if user is not the seller
    if (listing.seller === userId) {
      return errorResponse(res, 'You cannot message yourself', 400);
    }

    // Create conversation
    const conversationData = {
      listingId: id,
      buyerId: userId,
      sellerId: listing.seller,
      lastMessage: message.trim(),
      lastMessageAt: new Date().toISOString(),
      lastMessageBy: userId,
      createdAt: new Date().toISOString()
    };

    const conversation = await createDoc(MARKETPLACE_MESSAGES, conversationData);

    // Notify seller
    // TODO: Implement notification service
    console.log('Notifying seller of new conversation:', listing.seller);

    return createdResponse(res, { conversation }, 'Conversation started');

  } catch (error) {
    console.error('Error starting conversation:', error);
    return errorResponse(res, 'Failed to start conversation', 500);
  }
};

/**
 * Get conversation messages
 */
const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    const listing = await getDoc(MARKETPLACE, id);
    if (!listing || listing.isDeleted) {
      return notFoundResponse(res, 'Listing not found');
    }

    // Check if user is buyer or seller
    const isBuyer = userId !== listing.seller;
    const isSeller = userId === listing.seller;

    if (!isBuyer && !isSeller) {
      return errorResponse(res, 'Not authorized to view this conversation', 403);
    }

    // Get conversation
    const conversations = await getCollection(MARKETPLACE_MESSAGES, [
      ['listingId', '==', id]
    ]);

    if (conversations.length === 0) {
      return successResponse(res, { messages: [] });
    }

    const conversation = conversations[0];

    // Get messages (this would be a subcollection in production)
    // For now, return the conversation details
    return successResponse(res, { conversation });

  } catch (error) {
    console.error('Error getting conversation messages:', error);
    return errorResponse(res, 'Failed to fetch conversation', 500);
  }
};

/**
 * Send message in conversation
 */
const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return errorResponse(res, 'Message content is required', 400);
    }

    const listing = await getDoc(MARKETPLACE, id);
    if (!listing || listing.isDeleted) {
      return notFoundResponse(res, 'Listing not found');
    }

    // Check if user is buyer or seller
    const isBuyer = userId !== listing.seller;
    const isSeller = userId === listing.seller;

    if (!isBuyer && !isSeller) {
      return errorResponse(res, 'Not authorized to message in this conversation', 403);
    }

    // Get conversation
    const conversations = await getCollection(MARKETPLACE_MESSAGES, [
      ['listingId', '==', id]
    ]);

    if (conversations.length === 0) {
      return notFoundResponse(res, 'Conversation not found', 404);
    }

    const conversation = conversations[0];

    // Update conversation with new message
    await updateDoc(MARKETPLACE_MESSAGES, conversation.id, {
      lastMessage: content.trim(),
      lastMessageAt: new Date().toISOString(),
      lastMessageBy: userId
    });

    // Emit message via Socket.io
    const io = req.app.get('io');
    if (io) {
      const recipientId = isBuyer ? listing.seller : userId;
      io.to(`user-${recipientId}`).emit('marketplace_message', {
        listingId: id,
        message: content.trim(),
        senderId: userId,
        senderName: `${req.user.firstName} ${req.user.lastName}`,
        timestamp: new Date().toISOString()
      });
    }

    return successResponse(res, null, 'Message sent');

  } catch (error) {
    console.error('Error sending message:', error);
    return errorResponse(res, 'Failed to send message', 500);
  }
};

module.exports = {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  markAsSold,
  deleteListing,
  toggleSaveListing,
  reportListing,
  getUserListings,
  getUserSavedListings,
  startConversation,
  getConversationMessages,
  sendMessage
};
