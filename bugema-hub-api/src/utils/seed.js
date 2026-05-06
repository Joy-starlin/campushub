const { 
  createDoc, 
  getCollection, 
  deleteDoc,
  updateDoc 
} = require('../utils/db.helpers');
const { 
  USERS, 
  UNIVERSITIES, 
  POSTS, 
  EVENTS, 
  CLUBS,
  USER_POINTS,
  USER_BADGES
} = require('../utils/collections');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * Database seed script for Bugema Hub
 * 
 * Usage:
 * node src/utils/seed.js                    # Seed data
 * node src/utils/seed.js --clear            # Clear all seed data
 * node src/utils/seed.js --clear --seed     # Clear and reseed
 */

const isClearMode = process.argv.includes('--clear');
const isSeedMode = process.argv.includes('--seed') || !isClearMode;

const seedData = {
  users: [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@bugema.edu',
      username: 'johndoe',
      password: 'password123',
      university: 'Bugema University',
      country: 'Uganda',
      role: 'student',
      bio: 'Computer Science student passionate about technology and innovation.',
      verifiedStudent: true,
      verifiedEmail: true
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@bugema.edu',
      username: 'janesmith',
      password: 'password123',
      university: 'Bugema University',
      country: 'Uganda',
      role: 'student',
      bio: 'Business Administration student with a focus on entrepreneurship.',
      verifiedStudent: true,
      verifiedEmail: true
    },
    {
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.j@bugema.edu',
      username: 'michaelj',
      password: 'password123',
      university: 'Bugema University',
      country: 'Uganda',
      role: 'student',
      bio: 'Engineering student interested in renewable energy solutions.',
      verifiedStudent: true,
      verifiedEmail: true
    },
    {
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.w@bugema.edu',
      username: 'sarahw',
      password: 'password123',
      university: 'Bugema University',
      country: 'Uganda',
      role: 'student',
      bio: 'Literature student and aspiring writer.',
      verifiedStudent: true,
      verifiedEmail: true
    },
    {
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@bugema.edu',
      username: 'davidb',
      password: 'password123',
      university: 'Bugema University',
      country: 'Uganda',
      role: 'student',
      bio: 'Mathematics student with a passion for data science.',
      verifiedStudent: true,
      verifiedEmail: true
    }
  ],
  
  universities: [
    {
      name: 'Bugema University',
      slug: 'bugema-university',
      description: 'A leading institution of higher learning in Uganda, dedicated to excellence in education and research.',
      location: 'Kampala, Uganda',
      country: 'Uganda',
      website: 'https://bugema.edu.ug',
      logo: 'https://example.com/logo.png',
      verified: true,
      studentCount: 5000,
      founded: 1948,
      type: 'private',
      programs: ['Computer Science', 'Business Administration', 'Engineering', 'Literature', 'Mathematics']
    },
    {
      name: 'Makerere University',
      slug: 'makerere-university',
      description: 'Uganda\'s largest and oldest university, known for its research excellence.',
      location: 'Kampala, Uganda',
      country: 'Uganda',
      website: 'https://mak.ac.ug',
      logo: 'https://example.com/mak-logo.png',
      verified: true,
      studentCount: 40000,
      founded: 1922,
      type: 'public',
      programs: ['Medicine', 'Law', 'Engineering', 'Arts', 'Sciences']
    },
    {
      name: 'Kyambogo University',
      slug: 'kyambogo-university',
      description: 'A comprehensive university offering diverse programs in arts, sciences, and education.',
      location: 'Kampala, Uganda',
      country: 'Uganda',
      website: 'https://kyu.ac.ug',
      logo: 'https://example.com/kyu-logo.png',
      verified: true,
      studentCount: 25000,
      founded: 2003,
      type: 'public',
      programs: ['Education', 'Arts', 'Sciences', 'Engineering', 'Business']
    }
  ],
  
  posts: [
    {
      title: 'Welcome to Bugema Hub!',
      content: 'I\'m excited to be part of this amazing platform that connects students across our university. Looking forward to collaborating with everyone!',
      category: 'general',
      tags: ['welcome', 'introduction', 'community'],
      status: 'approved'
    },
    {
      title: 'Study Group for Data Structures',
      content: 'Anyone interested in forming a study group for Data Structures and Algorithms? We can meet twice a week to work through problems together.',
      category: 'academic',
      tags: ['study', 'data-structures', 'algorithms', 'group'],
      status: 'approved'
    },
    {
      title: 'Campus Photography Walk',
      content: 'Planning a photography walk around campus this weekend to capture the beauty of our university. All skill levels welcome!',
      category: 'events',
      tags: ['photography', 'campus', 'weekend', 'art'],
      status: 'approved'
    },
    {
      title: 'Best Cafeteria Food?',
      content: 'What\'s your favorite meal at the campus cafeteria? I\'m looking for recommendations beyond the usual options.',
      category: 'general',
      tags: ['food', 'cafeteria', 'recommendations'],
      status: 'approved'
    },
    {
      title: 'Internship Opportunities',
      content: 'Found some great internship opportunities for CS students. Check out these companies: TechCorp, DataSolutions, and InnovateUg.',
      category: 'career',
      tags: ['internship', 'career', 'opportunities', 'tech'],
      status: 'approved'
    },
    {
      title: 'Library Study Tips',
      content: 'Here are my top tips for effective studying in the library: 1) Choose a quiet corner, 2) Use the Pomodoro technique, 3) Take regular breaks, 4) Stay hydrated!',
      category: 'academic',
      tags: ['study', 'library', 'tips', 'productivity'],
      status: 'approved'
    },
    {
      title: 'Sports Tournament Announcement',
      content: 'The annual inter-university sports tournament is coming up! Sign up for basketball, football, or volleyball.',
      category: 'sports',
      tags: ['sports', 'tournament', 'basketball', 'football'],
      status: 'approved'
    },
    {
      title: 'Coding Challenge Winners',
      content: 'Congratulations to the winners of last week\'s coding challenge! The solutions were impressive and creative.',
      category: 'academic',
      tags: ['coding', 'challenge', 'winners', 'programming'],
      status: 'approved'
    },
    {
      title: 'Campus Wi-Fi Issues',
      content: 'Has anyone been experiencing slow Wi-Fi in the engineering building? Looking for solutions or workarounds.',
      category: 'general',
      tags: ['wifi', 'technical', 'issues', 'engineering'],
      status: 'approved'
    },
    {
      title: 'Book Exchange Program',
      content: 'Starting a book exchange program for textbooks. Bring your old books and exchange for ones you need!',
      category: 'academic',
      tags: ['books', 'exchange', 'textbooks', 'program'],
      status: 'approved'
    }
  ],
  
  events: [
    {
      title: 'Tech Talk: AI in Education',
      description: 'Join us for an exciting discussion about the role of artificial intelligence in modern education systems.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      time: '14:00',
      location: 'Main Hall, Bugema University',
      category: 'academic',
      maxAttendees: 100,
      tags: ['AI', 'education', 'technology', 'talk'],
      isPublic: true,
      status: 'approved'
    },
    {
      title: 'Career Fair 2024',
      description: 'Meet with top employers and explore career opportunities. Bring your resumes!',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      time: '09:00',
      location: 'Sports Complex',
      category: 'career',
      maxAttendees: 500,
      tags: ['career', 'fair', 'jobs', 'networking'],
      isPublic: true,
      status: 'approved'
    },
    {
      title: 'Study Skills Workshop',
      description: 'Learn effective study techniques and time management skills to improve your academic performance.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      time: '16:00',
      location: 'Library Conference Room',
      category: 'academic',
      maxAttendees: 30,
      tags: ['study', 'workshop', 'skills', 'academic'],
      isPublic: true,
      status: 'approved'
    },
    {
      title: 'Chess Tournament',
      description: 'Annual chess tournament open to all students. Prizes for top 3 players!',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      time: '10:00',
      location: 'Student Center',
      category: 'sports',
      maxAttendees: 50,
      tags: ['chess', 'tournament', 'games', 'competition'],
      isPublic: true,
      status: 'approved'
    },
    {
      title: 'Photography Exhibition',
      description: 'Showcase your best campus photographs. Open to all skill levels.',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
      time: '11:00',
      location: 'Art Gallery',
      category: 'arts',
      maxAttendees: 100,
      tags: ['photography', 'exhibition', 'art', 'campus'],
      isPublic: true,
      status: 'approved'
    }
  ],
  
  clubs: [
    {
      name: 'Computer Science Club',
      description: 'A community for CS students to learn, share, and collaborate on tech projects.',
      category: 'academic',
      university: 'Bugema University',
      maxMembers: 50,
      tags: ['computer-science', 'technology', 'programming'],
      isPublic: true,
      status: 'approved'
    },
    {
      name: 'Photography Club',
      description: 'Capture campus life through the lens. Open to all photography enthusiasts.',
      category: 'arts',
      university: 'Bugema University',
      maxMembers: 30,
      tags: ['photography', 'art', 'creative'],
      isPublic: true,
      status: 'approved'
    },
    {
      name: 'Entrepreneurship Club',
      description: 'For students interested in startups, innovation, and business ideas.',
      category: 'business',
      university: 'Bugema University',
      maxMembers: 40,
      tags: ['entrepreneurship', 'business', 'startup'],
      isPublic: true,
      status: 'approved'
    }
  ]
};

async function clearSeedData() {
  console.log('🧹 Clearing seed data...');
  
  try {
    // Clear posts
    const posts = await getCollection(POSTS, []);
    for (const post of posts) {
      await deleteDoc(POSTS, post.id);
    }
    console.log(`✅ Cleared ${posts.length} posts`);

    // Clear events
    const events = await getCollection(EVENTS, []);
    for (const event of events) {
      await deleteDoc(EVENTS, event.id);
    }
    console.log(`✅ Cleared ${events.length} events`);

    // Clear clubs
    const clubs = await getCollection(CLUBS, []);
    for (const club of clubs) {
      await deleteDoc(CLUBS, club.id);
    }
    console.log(`✅ Cleared ${clubs.length} clubs`);

    // Clear universities
    const universities = await getCollection(UNIVERSITIES, []);
    for (const university of universities) {
      await deleteDoc(UNIVERSITIES, university.id);
    }
    console.log(`✅ Cleared ${universities.length} universities`);

    // Clear user points and badges
    const userPoints = await getCollection(USER_POINTS, []);
    for (const point of userPoints) {
      await deleteDoc(USER_POINTS, point.id);
    }
    console.log(`✅ Cleared ${userPoints.length} user points`);

    const userBadges = await getCollection(USER_BADGES, []);
    for (const badge of userBadges) {
      await deleteDoc(USER_BADGES, badge.id);
    }
    console.log(`✅ Cleared ${userBadges.length} user badges`);

    // Clear users (last, to avoid foreign key issues)
    const users = await getCollection(USERS, []);
    for (const user of users) {
      await deleteDoc(USERS, user.uid);
    }
    console.log(`✅ Cleared ${users.length} users`);

    console.log('🎉 Seed data cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing seed data:', error);
  }
}

async function seedDatabase() {
  console.log('🌱 Seeding database with test data...');
  
  try {
    // Seed universities first (users reference them)
    console.log('📚 Seeding universities...');
    const createdUniversities = [];
    for (const universityData of seedData.universities) {
      const id = universityData.slug;
      const university = {
        id,
        ...universityData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await createDoc(UNIVERSITIES, id, university);
      createdUniversities.push(university);
    }
    console.log(`✅ Created ${createdUniversities.length} universities`);

    // Seed users
    console.log('👥 Seeding users...');
    const createdUsers = [];
    for (const userData of seedData.users) {
      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = {
        uid: userId,
        id: userId,
        ...userData,
        password: hashedPassword,
        status: 'active',
        loginStreak: 0,
        points: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      
      await createDoc(USERS, userId, user);
      createdUsers.push({ ...user, password: userData.password }); // Keep original password for reference
      
      // Create user points record
      await createDoc(USER_POINTS, userId, {
        userId,
        points: 0,
        level: 1,
        badges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log(`✅ Created ${createdUsers.length} users`);

    // Seed posts
    console.log('📝 Seeding posts...');
    const createdPosts = [];
    for (let i = 0; i < seedData.posts.length; i++) {
      const postData = seedData.posts[i];
      const postId = `post_${uuidv4()}`;
      const author = createdUsers[i % createdUsers.length]; // Rotate through users
      
      const post = {
        id: postId,
        ...postData,
        author: author.id,
        likes: [],
        comments: 0,
        shares: 0,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last week
        updatedAt: new Date().toISOString()
      };
      
      await createDoc(POSTS, postId, post);
      createdPosts.push(post);
    }
    console.log(`✅ Created ${createdPosts.length} posts`);

    // Seed events
    console.log('📅 Seeding events...');
    const createdEvents = [];
    for (let i = 0; i < seedData.events.length; i++) {
      const eventData = seedData.events[i];
      const eventId = `event_${uuidv4()}`;
      const organizer = createdUsers[i % createdUsers.length]; // Rotate through users
      
      const event = {
        id: eventId,
        ...eventData,
        organizer: organizer.id,
        attendees: [],
        rsvps: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await createDoc(EVENTS, eventId, event);
      createdEvents.push(event);
    }
    console.log(`✅ Created ${createdEvents.length} events`);

    // Seed clubs
    console.log('🏛️ Seeding clubs...');
    const createdClubs = [];
    for (let i = 0; i < seedData.clubs.length; i++) {
      const clubData = seedData.clubs[i];
      const clubId = `club_${uuidv4()}`;
      const founder = createdUsers[i % createdUsers.length]; // Rotate through users
      
      const club = {
        id: clubId,
        ...clubData,
        founder: founder.id,
        members: [founder.id], // Founder is automatically a member
        admins: [founder.id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await createDoc(CLUBS, clubId, club);
      createdClubs.push(club);
    }
    console.log(`✅ Created ${createdClubs.length} clubs`);

    // Add some sample interactions
    console.log('🔄 Adding sample interactions...');
    
    // Add some likes to posts
    for (let i = 0; i < Math.min(createdPosts.length, 5); i++) {
      const post = createdPosts[i];
      const likers = createdUsers.slice(0, Math.floor(Math.random() * 3) + 1); // 1-3 random users
      
      for (const liker of likers) {
        if (liker.id !== post.author) { // Don't let users like their own posts
          post.likes.push(liker.id);
        }
      }
      
      await updateDoc(POSTS, post.id, { likes: post.likes });
    }
    
    // Add some RSVPs to events
    for (let i = 0; i < Math.min(createdEvents.length, 3); i++) {
      const event = createdEvents[i];
      const attendees = createdUsers.slice(0, Math.floor(Math.random() * 5) + 2); // 2-6 random users
      
      for (const attendee of attendees) {
        if (attendee.id !== event.organizer) { // Don't auto-add organizer
          event.attendees.push(attendee.id);
          event.rsvps.push({
            userId: attendee.id,
            status: 'attending',
            rsvpedAt: new Date().toISOString()
          });
        }
      }
      
      await updateDoc(EVENTS, event.id, { 
        attendees: event.attendees,
        rsvps: event.rsvps
      });
    }
    
    console.log('✅ Added sample interactions');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Universities: ${createdUniversities.length}`);
    console.log(`   Posts: ${createdPosts.length}`);
    console.log(`   Events: ${createdEvents.length}`);
    console.log(`   Clubs: ${createdClubs.length}`);
    
    console.log('\n🔑 Test User Credentials:');
    createdUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

async function main() {
  console.log('🚀 Bugema Hub Database Seeder');
  console.log('================================');
  
  if (isClearMode) {
    await clearSeedData();
  }
  
  if (isSeedMode) {
    await seedDatabase();
  }
  
  console.log('\n✨ Done!');
  process.exit(0);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the seeder
if (require.main === module) {
  main();
}

module.exports = {
  seedDatabase,
  clearSeedData,
  seedData
};
