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
  POSTS, 
  POST_COMMENTS, 
  POST_LIKES, 
  POST_BOOKMARKS, 
  REPORTS,
  USERS,
  NOTIFICATIONS,
  USER_POINTS
} = require('../utils/collections');
const { 
  uploadPostImages 
} = require('../services/upload.service');
const { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  notFoundResponse 
} = require('../utils/response');

/**
 * Create a new post
 */
const createPost = async (req, res) => {
  try {
    const { title, content, category, university, isGlobal } = req.body;
    const userId = req.user.id;

    // Validate category
    const validCategories = ['news', 'event', 'club', 'market', 'job', 'lost_found', 'announcement'];
    if (!validCategories.includes(category)) {
      return errorResponse(res, 'Invalid category', 400);
    }

    // Determine post status based on user role
    let status = 'pending';
    if (['admin', 'moderator'].includes(req.user.role)) {
      status = 'approved';
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.images) {
      const uploadResult = await uploadPostImages(req.files.images, 'temp');
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

    // Create post
    const postData = {
      title: title.trim(),
      content: content.trim(),
      category,
      author: userId,
      authorName: `${req.user.firstName} ${req.user.lastName}`,
      authorAvatar: req.user.profilePicture,
      authorVerified: req.user.verifiedStudent,
      university: university || req.user.university,
      isGlobal: isGlobal || false,
      status,
      images,
      likeCount: 0,
      commentCount: 0,
      viewCount: 0,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const post = await createDoc(POSTS, postData);

    // Notify admins of pending post (if not auto-approved)
    if (status === 'pending') {
      // TODO: Implement admin notification
      console.log('New pending post for admin review:', post.id);
    }

    const responseMessage = status === 'approved' 
      ? 'Post published successfully' 
      : 'Post submitted for review';

    return createdResponse(res, { post }, responseMessage);

  } catch (error) {
    console.error('Error creating post:', error);
    return errorResponse(res, 'Failed to create post', 500);
  }
};

/**
 * Get all posts (public feed)
 */
const getAllPosts = async (req, res) => {
  try {
    const { 
      category, 
      university, 
      page = 1, 
      limit = 20, 
      sort = 'newest' 
    } = req.query;

    const pageSize = Math.min(parseInt(limit), 50);
    const currentPage = Math.max(parseInt(page), 1);

    // Build filters
    const filters = [
      ['status', '==', 'approved'],
      ['isDeleted', '==', false]
    ];

    if (category) {
      filters.push(['category', '==', category]);
    }

    if (university) {
      filters.push(['university', '==', university]);
    } else {
      // If no university specified, include global posts and user's university posts
      filters.push(['isGlobal', '==', true]);
    }

    // Determine sort order
    let orderBy;
    if (sort === 'popular') {
      orderBy = { field: 'likeCount', direction: 'desc' };
    } else {
      orderBy = { field: 'createdAt', direction: 'desc' };
    }

    // Get posts
    const result = await paginatedQuery(POSTS, filters, pageSize, null, orderBy);

    // Enrich posts with author information
    const enrichedPosts = await Promise.all(
      result.data.map(async (post) => {
        const author = await getDoc(USERS, post.author);
        return {
          ...post,
          authorName: author ? `${author.firstName} ${author.lastName}` : 'Unknown',
          authorAvatar: author?.profilePicture || null,
          authorVerified: author?.verifiedStudent || false
        };
      })
    );

    return successResponse(res, {
      posts: enrichedPosts,
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
    console.error('Error getting posts:', error);
    return errorResponse(res, 'Failed to fetch posts', 500);
  }
};

/**
 * Get single post by ID
 */
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await getDoc(POSTS, id);
    if (!post || post.isDeleted) {
      return notFoundResponse(res, 'Post not found');
    }

    if (post.status !== 'approved') {
      // Only allow author, admin, or moderator to see unapproved posts
      const isAuthor = req.user && req.user.id === post.author;
      const isModerator = req.user && ['admin', 'moderator'].includes(req.user.role);
      
      if (!isAuthor && !isModerator) {
        return notFoundResponse(res, 'Post not found');
      }
    }

    // Increment view count
    await incrementField(POSTS, id, 'viewCount', 1);

    // Get author information
    const author = await getDoc(USERS, post.author);

    const enrichedPost = {
      ...post,
      authorName: author ? `${author.firstName} ${author.lastName}` : 'Unknown',
      authorAvatar: author?.profilePicture || null,
      authorVerified: author?.verifiedStudent || false
    };

    return successResponse(res, { post: enrichedPost });

  } catch (error) {
    console.error('Error getting post:', error);
    return errorResponse(res, 'Failed to fetch post', 500);
  }
};

/**
 * Update a post
 */
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, images } = req.body;
    const userId = req.user.id;

    const post = await getDoc(POSTS, id);
    if (!post || post.isDeleted) {
      return notFoundResponse(res, 'Post not found');
    }

    // Check permissions
    const isAuthor = post.author === userId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return errorResponse(res, 'You can only edit your own posts', 403);
    }

    // Validate category
    if (category) {
      const validCategories = ['news', 'event', 'club', 'market', 'job', 'lost_found', 'announcement'];
      if (!validCategories.includes(category)) {
        return errorResponse(res, 'Invalid category', 400);
      }
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (category !== undefined) updateData.category = category;

    // If author is editing, set status back to pending
    if (isAuthor && post.status === 'approved') {
      updateData.status = 'pending';
    }

    // Handle image updates
    if (req.files && req.files.images) {
      const uploadResult = await uploadPostImages(req.files.images, id);
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

    const updatedPost = await updateDoc(POSTS, id, updateData);

    return successResponse(res, { post: updatedPost }, 'Post updated successfully');

  } catch (error) {
    console.error('Error updating post:', error);
    return errorResponse(res, 'Failed to update post', 500);
  }
};

/**
 * Delete a post (soft delete)
 */
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await getDoc(POSTS, id);
    if (!post || post.isDeleted) {
      return notFoundResponse(res, 'Post not found');
    }

    // Check permissions
    const isAuthor = post.author === userId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return errorResponse(res, 'You can only delete your own posts', 403);
    }

    await updateDoc(POSTS, id, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: userId
    });

    return successResponse(res, null, 'Post deleted successfully');

  } catch (error) {
    console.error('Error deleting post:', error);
    return errorResponse(res, 'Failed to delete post', 500);
  }
};

/**
 * Toggle like on a post
 */
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await getDoc(POSTS, id);
    if (!post || post.isDeleted) {
      return notFoundResponse(res, 'Post not found');
    }

    // Check if user already liked the post
    const existingLikes = await getCollection(POST_LIKES, [
      ['postId', '==', id],
      ['userId', '==', userId]
    ]);

    let liked;
    let newLikeCount;

    if (existingLikes.length > 0) {
      // Unlike the post
      await db.collection(POST_LIKES).doc(existingLikes[0].id).delete();
      await incrementField(POSTS, id, 'likeCount', -1);
      liked = false;
      newLikeCount = Math.max(0, (post.likeCount || 0) - 1);
    } else {
      // Like the post
      await createDoc(POST_LIKES, {
        postId: id,
        userId,
        likedAt: new Date().toISOString()
      });
      
      const updatedPost = await incrementField(POSTS, id, 'likeCount', 1);
      newLikeCount = updatedPost.likeCount;
      liked = true;

      // Notify post author (only for first like)
      if (newLikeCount === 1 && post.author !== userId) {
        // TODO: Implement notification
        console.log('Notifying post author of first like');
      }

      // Award bonus points if likeCount reaches 10
      if (newLikeCount === 10) {
        await incrementField(USER_POINTS, post.author, 'points', 5);
        // TODO: Implement notification for bonus points
        console.log('Awarding 5 bonus points to post author');
      }
    }

    return successResponse(res, {
      liked,
      likeCount: newLikeCount
    }, liked ? 'Post liked' : 'Post unliked');

  } catch (error) {
    console.error('Error toggling like:', error);
    return errorResponse(res, 'Failed to toggle like', 500);
  }
};

/**
 * Add comment to a post
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return errorResponse(res, 'Comment content is required', 400);
    }

    const post = await getDoc(POSTS, id);
    if (!post || post.isDeleted) {
      return notFoundResponse(res, 'Post not found');
    }

    // Validate parent comment if provided
    if (parentId) {
      const parentComment = await getDoc(POST_COMMENTS, parentId);
      if (!parentComment || parentComment.postId !== id) {
        return errorResponse(res, 'Invalid parent comment', 400);
      }

      // Check nesting level (max 2 levels)
      if (parentComment.parentId) {
        return errorResponse(res, 'Maximum comment nesting level reached', 400);
      }
    }

    // Create comment
    const commentData = {
      postId: id,
      userId,
      authorName: `${req.user.firstName} ${req.user.lastName}`,
      authorAvatar: req.user.profilePicture,
      authorVerified: req.user.verifiedStudent,
      content: content.trim(),
      parentId: parentId || null,
      likeCount: 0,
      replyCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const comment = await createDoc(POST_COMMENTS, commentData);

    // Increment comment count on post
    await incrementField(POSTS, id, 'commentCount', 1);

    // Increment reply count on parent comment if it's a reply
    if (parentId) {
      await incrementField(POST_COMMENTS, parentId, 'replyCount', 1);
    }

    // Notify post author (if not commenting on own post)
    if (post.author !== userId) {
      // TODO: Implement notification
      console.log('Notifying post author of new comment');
    }

    return createdResponse(res, { comment }, 'Comment added successfully');

  } catch (error) {
    console.error('Error adding comment:', error);
    return errorResponse(res, 'Failed to add comment', 500);
  }
};

/**
 * Get comments for a post
 */
const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageSize = Math.min(parseInt(limit), 50);
    const currentPage = Math.max(parseInt(page), 1);

    const post = await getDoc(POSTS, id);
    if (!post || post.isDeleted) {
      return notFoundResponse(res, 'Post not found');
    }

    // Get top-level comments (no parentId)
    const filters = [['postId', '==', id], ['parentId', '==', null]];
    const result = await paginatedQuery(POST_COMMENTS, filters, pageSize, null, {
      field: 'createdAt',
      direction: 'asc'
    });

    // Get replies for each comment (max 2 levels)
    const commentsWithReplies = await Promise.all(
      result.data.map(async (comment) => {
        const replies = await getCollection(POST_COMMENTS, [
          ['postId', '==', id],
          ['parentId', '==', comment.id]
        ]);

        return {
          ...comment,
          replies: replies.sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
          )
        };
      })
    );

    return successResponse(res, {
      comments: commentsWithReplies,
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
    console.error('Error getting comments:', error);
    return errorResponse(res, 'Failed to fetch comments', 500);
  }
};

/**
 * Toggle bookmark on a post
 */
const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await getDoc(POSTS, id);
    if (!post || post.isDeleted) {
      return notFoundResponse(res, 'Post not found');
    }

    // Check if user already bookmarked the post
    const existingBookmarks = await getCollection(POST_BOOKMARKS, [
      ['postId', '==', id],
      ['userId', '==', userId]
    ]);

    let bookmarked;

    if (existingBookmarks.length > 0) {
      // Remove bookmark
      await db.collection(POST_BOOKMARKS).doc(existingBookmarks[0].id).delete();
      bookmarked = false;
    } else {
      // Add bookmark
      await createDoc(POST_BOOKMARKS, {
        postId: id,
        userId,
        bookmarkedAt: new Date().toISOString()
      });
      bookmarked = true;
    }

    return successResponse(res, {
      bookmarked
    }, bookmarked ? 'Post bookmarked' : 'Post unbookmarked');

  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return errorResponse(res, 'Failed to toggle bookmark', 500);
  }
};

/**
 * Report a post
 */
const reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason || reason.trim().length === 0) {
      return errorResponse(res, 'Report reason is required', 400);
    }

    const post = await getDoc(POSTS, id);
    if (!post || post.isDeleted) {
      return notFoundResponse(res, 'Post not found');
    }

    // Check if user already reported this post
    const existingReports = await getCollection(REPORTS, [
      ['resourceType', '==', 'post'],
      ['resourceId', '==', id],
      ['reportedBy', '==', userId]
    ]);

    if (existingReports.length > 0) {
      return errorResponse(res, 'You have already reported this post', 409);
    }

    // Create report
    await createDoc(REPORTS, {
      resourceType: 'post',
      resourceId: id,
      reportedBy: userId,
      reason: reason.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    // Check if post has 5+ reports and auto-flag for review
    const reportCount = await countDocuments(REPORTS, [
      ['resourceType', '==', 'post'],
      ['resourceId', '==', id],
      ['status', '==', 'pending']
    ]);

    if (reportCount >= 5) {
      await updateDoc(POSTS, id, {
        status: 'flagged',
        flaggedAt: new Date().toISOString()
      });
      
      // TODO: Notify admins
      console.log('Post auto-flagged for admin review due to multiple reports');
    }

    return successResponse(res, null, 'Post reported successfully');

  } catch (error) {
    console.error('Error reporting post:', error);
    return errorResponse(res, 'Failed to report post', 500);
  }
};

/**
 * Get user's bookmarked posts
 */
const getBookmarkedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const pageSize = Math.min(parseInt(limit), 50);
    const currentPage = Math.max(parseInt(page), 1);

    // Get user's bookmarks
    const bookmarks = await getCollection(POST_BOOKMARKS, [
      ['userId', '==', userId]
    ]);

    // Get post IDs
    const postIds = bookmarks.map(bookmark => bookmark.postId);

    if (postIds.length === 0) {
      return successResponse(res, {
        posts: [],
        pagination: {
          page: currentPage,
          limit: pageSize,
          total: 0,
          totalPages: 0
        }
      });
    }

    // Get posts
    const posts = await Promise.all(
      postIds.map(async (postId) => {
        const post = await getDoc(POSTS, postId);
        if (post && !post.isDeleted && post.status === 'approved') {
          const author = await getDoc(USERS, post.author);
          return {
            ...post,
            authorName: author ? `${author.firstName} ${author.lastName}` : 'Unknown',
            authorAvatar: author?.profilePicture || null,
            authorVerified: author?.verifiedStudent || false
          };
        }
        return null;
      })
    );

    const validPosts = posts.filter(post => post !== null);

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedPosts = validPosts.slice(startIndex, startIndex + pageSize);

    return successResponse(res, {
      posts: paginatedPosts,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: validPosts.length,
        totalPages: Math.ceil(validPosts.length / pageSize)
      }
    });

  } catch (error) {
    console.error('Error getting bookmarked posts:', error);
    return errorResponse(res, 'Failed to fetch bookmarked posts', 500);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getComments,
  toggleBookmark,
  reportPost,
  getBookmarkedPosts
};
