import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Report } from '../models/Report.js';

let csrfToken = '';
let csrfCookie = '';

// Helper to extract cookies from supertest response
function getCookie(res, name) {
  const cookies = res.headers['set-cookie'];
  if (!cookies) return null;
  const target = Array.isArray(cookies) ? cookies : [cookies];
  for (const c of target) {
    if (c.startsWith(`${name}=`)) {
      return c.split(';')[0];
    }
  }
  return null;
}

function authHeaders(authCookie, additional = {}) {
  const cookies = [csrfCookie];
  if (authCookie) cookies.push(authCookie);
  return {
    Cookie: cookies.join('; '),
    'X-CSRF-Token': csrfToken,
    ...additional,
  };
}

describe('UniMarket Backend API Tests', () => {
  beforeAll(async () => {
    await connectDatabase();
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Report.deleteMany({});
  }, 30000);

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('1. Health & CSRF Protection', () => {
    it('GET /api/v1/health returns ok status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
    });

    it('GET /api/v1/auth/csrf returns csrf token and sets cookie', async () => {
      const res = await request(app).get('/api/v1/auth/csrf');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.csrfToken).toBeDefined();

      csrfToken = res.body.data.csrfToken;
      csrfCookie = getCookie(res, 'unimarket_csrf');
      expect(csrfCookie).toBeDefined();
    });

    it('blocks POST request without CSRF token with 403', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'Password@123' });
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('CSRF_INVALID');
    });
  });

  describe('2. Authentication & Authorization', () => {
    let studentAuthCookie = '';
    let studentUser = null;
    let secondStudentCookie = '';
    let secondStudentUser = null;
    let adminAuthCookie = '';
    let adminUser = null;

    it('registers a new student account successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set(authHeaders())
        .send({
          name: 'Ananya Sharma',
          email: 'ananya@college.edu',
          password: 'Password@12345',
          confirmPassword: 'Password@12345',
          college: 'IIT Bombay',
          department: 'Computer Science',
          year: 'Third year',
          terms: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('student');
      expect(res.body.data.user.email).toBe('ananya@college.edu');

      studentUser = res.body.data.user;
      studentAuthCookie = getCookie(res, 'unimarket_token');
      expect(studentAuthCookie).toBeDefined();
    });

    it('registers a second student account for marketplace interactions', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set(authHeaders())
        .send({
          name: 'Kabir Verma',
          email: 'kabir@college.edu',
          password: 'Password@12345',
          confirmPassword: 'Password@12345',
          college: 'IIT Bombay',
          department: 'Mechanical Engineering',
          year: 'Second year',
          terms: true,
        });

      expect(res.status).toBe(201);
      secondStudentUser = res.body.data.user;
      secondStudentCookie = getCookie(res, 'unimarket_token');
      expect(secondStudentCookie).toBeDefined();
    });

    it('ensures public registration ignores any passed role=admin', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set(authHeaders())
        .send({
          name: 'Sneaky User',
          email: 'sneaky@college.edu',
          password: 'Password@12345',
          confirmPassword: 'Password@12345',
          college: 'IIT Bombay',
          role: 'admin',
          terms: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('student');
    });

    it('prevents registering duplicate email address', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set(authHeaders())
        .send({
          name: 'Duplicate Ananya',
          email: 'ananya@college.edu',
          password: 'Password@12345',
          confirmPassword: 'Password@12345',
          college: 'IIT Bombay',
          terms: true,
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('EMAIL_TAKEN');
    });

    it('logs in student and returns session', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .set(authHeaders())
        .send({
          email: 'ananya@college.edu',
          password: 'Password@12345',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Ananya Sharma');
      studentAuthCookie = getCookie(res, 'unimarket_token');
    });

    it('GET /api/v1/auth/me returns currently authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set(authHeaders(studentAuthCookie));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(studentUser.id);
    });

    it('creates an admin account directly for moderation testing', async () => {
      const adminHash = await User.hashPassword('Admin@Secret123');
      const adminDoc = await User.create({
        name: 'UniMarket Admin',
        email: 'admin@unimarket.test',
        passwordHash: adminHash,
        college: 'UniMarket HQ',
        role: 'admin',
        status: 'active',
      });
      adminUser = adminDoc;

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .set(authHeaders())
        .send({
          email: 'admin@unimarket.test',
          password: 'Admin@Secret123',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.user.role).toBe('admin');
      adminAuthCookie = getCookie(loginRes, 'unimarket_token');
      expect(adminAuthCookie).toBeDefined();
    });

    it('rejects student from admin routes with 403', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set(authHeaders(studentAuthCookie));

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('ADMIN_REQUIRED');
    });

    it('allows admin to access admin routes with 200', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set(authHeaders(adminAuthCookie));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users.total).toBeGreaterThan(0);
    });

    describe('3. Listing CRUD & Moderation Flow', () => {
      let createdListingId = '';

      it('creates a new listing as student (status pending)', async () => {
        const res = await request(app)
          .post('/api/v1/listings')
          .set(authHeaders(studentAuthCookie))
          .field('title', 'Data Structures in C++ (Mark Weiss)')
          .field('description', 'Standard textbook for CS second year. Complete with exercise solutions and no missing pages.')
          .field('price', 450)
          .field('category', 'Textbooks and Notes')
          .field('condition', 'good')
          .field('college', 'IIT Bombay')
          .field('pickupLocation', 'Hostel 4 Ground Floor')
          .attach('images', Buffer.from('fake-image-content'), {
            filename: 'book.jpg',
            contentType: 'image/jpeg',
          });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.listing.status).toBe('pending');
        createdListingId = res.body.data.listing._id || res.body.data.listing.id;
        expect(createdListingId).toBeDefined();
      });

      it('does not display pending listing in public marketplace', async () => {
        const res = await request(app).get('/api/v1/listings');
        expect(res.status).toBe(200);
        const exists = res.body.data.listings.some((l) => (l._id || l.id) === createdListingId);
        expect(exists).toBe(false);
      });

      it('allows seller to view their own pending listing', async () => {
        const res = await request(app)
          .get(`/api/v1/listings/${createdListingId}`)
          .set(authHeaders(studentAuthCookie));

        expect(res.status).toBe(200);
        expect(res.body.data.listing.isOwner).toBe(true);
      });

      it('admin approves the listing', async () => {
        const res = await request(app)
          .patch(`/api/v1/admin/listings/${createdListingId}/moderate`)
          .set(authHeaders(adminAuthCookie))
          .send({ action: 'approve' });

        expect(res.status).toBe(200);
        expect(res.body.data.listing.status).toBe('approved');
      });

      it('approved listing now appears in public marketplace and search', async () => {
        const res = await request(app).get('/api/v1/listings?category=Textbooks and Notes');
        expect(res.status).toBe(200);
        const match = res.body.data.listings.find((l) => (l._id || l.id) === createdListingId);
        expect(match).toBeDefined();
        expect(match.title).toContain('Data Structures');
      });

      it('prevents non-owner from updating the listing', async () => {
        const res = await request(app)
          .patch(`/api/v1/listings/${createdListingId}`)
          .set(authHeaders(secondStudentCookie))
          .field('price', 300);

        expect(res.status).toBe(403);
      });

      it('allows owner to mark listing as sold', async () => {
        const res = await request(app)
          .patch(`/api/v1/listings/${createdListingId}/status`)
          .set(authHeaders(studentAuthCookie))
          .send({ status: 'sold' });

        expect(res.status).toBe(200);
        expect(res.body.data.listing.status).toBe('sold');
      });

      it('allows owner to relist sold item (moves back to pending moderation)', async () => {
        const res = await request(app)
          .patch(`/api/v1/listings/${createdListingId}/status`)
          .set(authHeaders(studentAuthCookie))
          .send({ status: 'pending' });

        expect(res.status).toBe(200);
        expect(res.body.data.listing.status).toBe('pending');

        // Approve it again for downstream tests
        await request(app)
          .patch(`/api/v1/admin/listings/${createdListingId}/moderate`)
          .set(authHeaders(adminAuthCookie))
          .send({ action: 'approve' });
      });

      describe('4. Favourites Persistence', () => {
        it('adds listing to favourites', async () => {
          const res = await request(app)
            .post(`/api/v1/favorites/${createdListingId}`)
            .set(authHeaders(secondStudentCookie));

          expect(res.status).toBe(200);
          expect(res.body.data.favoriteIds).toContain(createdListingId);
        });

        it('lists favourites for the student', async () => {
          const res = await request(app)
            .get('/api/v1/favorites')
            .set(authHeaders(secondStudentCookie));

          expect(res.status).toBe(200);
          expect(res.body.data.favoriteIds).toContain(createdListingId);
          expect(res.body.data.listings.length).toBe(1);
        });

        it('removes listing from favourites', async () => {
          const res = await request(app)
            .delete(`/api/v1/favorites/${createdListingId}`)
            .set(authHeaders(secondStudentCookie));

          expect(res.status).toBe(200);
          expect(res.body.data.favoriteIds).not.toContain(createdListingId);
        });
      });

      describe('5. In-App Buyer-Seller Messaging', () => {
        let conversationId = '';

        it('prevents seller from starting a conversation with themselves', async () => {
          const res = await request(app)
            .post('/api/v1/conversations')
            .set(authHeaders(studentAuthCookie))
            .send({ listingId: createdListingId });

          expect(res.status).toBe(400);
          expect(res.body.code).toBe('CANNOT_MESSAGE_SELF');
        });

        it('buyer starts conversation with seller about listing', async () => {
          const res = await request(app)
            .post('/api/v1/conversations')
            .set(authHeaders(secondStudentCookie))
            .send({ listingId: createdListingId });

          expect(res.status).toBe(201);
          conversationId = res.body.data.conversation.id;
          expect(conversationId).toBeDefined();
        });

        it('buyer sends message in the conversation', async () => {
          const res = await request(app)
            .post(`/api/v1/conversations/${conversationId}/messages`)
            .set(authHeaders(secondStudentCookie))
            .send({ text: 'Hello Ananya! Is the book still available?' });

          expect(res.status).toBe(201);
          expect(res.body.data.message.text).toBe('Hello Ananya! Is the book still available?');
        });

        it('seller fetches messages and marks them as read', async () => {
          const res = await request(app)
            .get(`/api/v1/conversations/${conversationId}/messages`)
            .set(authHeaders(studentAuthCookie));

          expect(res.status).toBe(200);
          expect(res.body.data.messages.length).toBe(1);

          const readRes = await request(app)
            .patch(`/api/v1/conversations/${conversationId}/read`)
            .set(authHeaders(studentAuthCookie));

          expect(readRes.status).toBe(200);
          expect(readRes.body.data.markedRead).toBe(1);
        });

        it('third party cannot access conversation', async () => {
          // create a 3rd user to verify non-participant check
          const thirdUser = await User.create({
            name: 'Third Student',
            email: 'third@college.edu',
            passwordHash: 'hash',
            college: 'IIT Bombay',
            role: 'student',
            status: 'active',
          });
          const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .set(authHeaders())
            .send({ email: 'third@college.edu', password: 'Password@12345' });
          
          // Or using auth cookie directly:
          const { signAuthToken } = await import('../utils/tokens.js');
          const thirdCookie = `unimarket_token=${signAuthToken(thirdUser)}`;

          const res = await request(app)
            .get(`/api/v1/conversations/${conversationId}/messages`)
            .set(authHeaders(thirdCookie));

          expect(res.status).toBe(403);
          expect(res.body.code).toBe('NOT_PARTICIPANT');
        });
      });

      describe('6. Reports & Moderation Review', () => {
        let reportId = '';

        it('allows buyer to report a listing', async () => {
          const res = await request(app)
            .post('/api/v1/reports')
            .set(authHeaders(secondStudentCookie))
            .send({
              listingId: createdListingId,
              reason: 'misleading',
              description: 'Photos look like a different edition than described in the title.',
            });

          expect(res.status).toBe(201);
          expect(res.body.success).toBe(true);
        });

        it('admin retrieves reports list', async () => {
          const res = await request(app)
            .get('/api/v1/admin/reports')
            .set(authHeaders(adminAuthCookie));

          expect(res.status).toBe(200);
          expect(res.body.data.reports.length).toBeGreaterThan(0);
          reportId = res.body.data.reports[0].id || res.body.data.reports[0]._id;
        });

        it('admin reviews and resolves report', async () => {
          const res = await request(app)
            .patch(`/api/v1/admin/reports/${reportId}`)
            .set(authHeaders(adminAuthCookie))
            .send({
              status: 'resolved',
              resolutionNote: 'Listing reviewed and seller confirmed edition details.',
            });

          expect(res.status).toBe(200);
          expect(res.body.data.report.status).toBe('resolved');
        });
      });
    });
  });
});
