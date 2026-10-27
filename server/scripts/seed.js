import fs from 'node:fs/promises';
import path from 'node:path';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import mongoose from 'mongoose';
import { env, validateEnv } from '../config/env.js';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Report } from '../models/Report.js';
import { ModerationLog } from '../models/ModerationLog.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { uploadsRoot } from '../middleware/upload.js';

const STUDENT_PASSWORD = 'Student@12345';
const demoDir = path.join(uploadsRoot, 'demo');

const imagePalettes = {
  book: ['#E7EDE4', '#1F5A43', '#C9D8C9'],
  calculator: ['#F2EBDD', '#876A2E', '#E0CFA8'],
  drafting: ['#E9E4DB', '#4A514C', '#D5CFC3'],
  lab: ['#E7ECEB', '#3D5F5A', '#C9D8D4'],
  stationery: ['#F1E7E0', '#8C4F32', '#E3C8B7'],
  lamp: ['#F3EEDC', '#6D6335', '#DED2A8'],
  notes: ['#EEE9E1', '#4A5A6A', '#D5DCE2'],
  kettle: ['#E9EEEE', '#3F5963', '#C8D7DB'],
  apron: ['#E8EEE8', '#3C624A', '#C7D8C8'],
  headphones: ['#ECE8E5', '#514A45', '#D8CFC8'],
  tools: ['#ECE9E1', '#4A4E47', '#D5D1C5'],
};

async function ensureDemoImages() {
  await fs.mkdir(demoDir, { recursive: true });
  const clientListings = path.resolve(process.cwd(), 'client', 'public', 'images', 'listings');
  try {
    const files = await fs.readdir(clientListings);
    for (const f of files) {
      if (f.endsWith('.jpg')) {
        await fs.copyFile(path.join(clientListings, f), path.join(demoDir, f));
      }
    }
  } catch {}
  for (const [slug, [background, ink, accent]] of Object.entries(imagePalettes)) {
    const label = slug.replaceAll('-', ' ').toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="${label} demo placeholder">
  <rect width="1200" height="900" fill="${background}"/>
  <circle cx="955" cy="190" r="190" fill="${accent}" opacity="0.55"/>
  <circle cx="190" cy="740" r="140" fill="${accent}" opacity="0.4"/>
  <rect x="120" y="170" width="720" height="520" rx="26" fill="#FFFDF8" stroke="${ink}" stroke-opacity="0.18" stroke-width="3"/>
  <path d="M180 510 L330 330 L455 455 L565 300 L790 560" fill="none" stroke="${ink}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity="0.82"/>
  <rect x="180" y="592" width="270" height="18" rx="9" fill="${ink}" opacity="0.72"/>
  <rect x="180" y="628" width="170" height="12" rx="6" fill="${ink}" opacity="0.28"/>
  <text x="120" y="800" font-family="Inter, Arial, sans-serif" font-size="36" font-weight="600" fill="${ink}">${label}</text>
  <text x="120" y="838" font-family="Inter, Arial, sans-serif" font-size="21" fill="${ink}" opacity="0.58">UniMarket demo image</text>
</svg>`;
    await fs.writeFile(path.join(demoDir, `${slug}.svg`), svg, 'utf8');
  }
}


function daysAgo(days, hours = 0) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000);
}

async function seed() {
  validateEnv();

  if (env.isProduction && process.env.ALLOW_PROD_SEED !== 'true') {
    throw new Error('Refusing to seed a production database. Set ALLOW_PROD_SEED=true only if you are certain.');
  }

  if (!env.seedAdmin.password || env.seedAdmin.password.length < 10) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 10 characters.');
  }

  if (mongoose.connection.readyState !== 1) {
    await connectDatabase();
  }
  await ensureDemoImages();

  console.log('[seed] Clearing existing UniMarket collections...');
  await Promise.all([
    ModerationLog.deleteMany({}),
    Report.deleteMany({}),
    Message.deleteMany({}),
    Conversation.deleteMany({}),
    Listing.deleteMany({}),
    PasswordResetToken.deleteMany({}),
    User.deleteMany({}),
  ]);

  const [studentHash, adminHash] = await Promise.all([
    User.hashPassword(STUDENT_PASSWORD),
    User.hashPassword(env.seedAdmin.password),
  ]);

  const admin = await User.create({
    name: env.seedAdmin.name,
    email: env.seedAdmin.email,
    passwordHash: adminHash,
    college: 'UniMarket Campus Team',
    department: 'Platform moderation',
    year: '',
    role: 'admin',
    status: 'active',
  });

  const studentRows = [
    {
      name: 'Aarav Mehta',
      email: 'aarav@unimarket.demo',
      college: "St. Xavier's College",
      department: 'Computer Science',
      year: 'Third year',
    },
    {
      name: 'Priya Nair',
      email: 'priya@unimarket.demo',
      college: 'College of Engineering, Pune',
      department: 'Mechanical Engineering',
      year: 'Second year',
    },
    {
      name: 'Rohan Kulkarni',
      email: 'rohan@unimarket.demo',
      college: 'Veermata Jijabai Technological Institute',
      department: 'Electronics Engineering',
      year: 'Final year',
    },
    {
      name: 'Sana Khan',
      email: 'sana@unimarket.demo',
      college: 'Fergusson College',
      department: 'Chemistry',
      year: 'Third year',
    },
    {
      name: 'Dev Patel',
      email: 'dev@unimarket.demo',
      college: "St. Xavier's College",
      department: 'Commerce',
      year: 'First year',
    },
  ];

  const students = await User.insertMany(
    studentRows.map((student) => ({
      ...student,
      passwordHash: studentHash,
      role: 'student',
      status: 'active',
    }))
  );

  const [aarav, priya, rohan, sana, dev] = students;

  const listingRows = [
    {
      title: 'Introduction to Algorithms — CLRS (3rd Edition)',
      description:
        'Well-kept CLRS textbook used for two semesters of data structures and algorithms. All pages are intact; a few pencil annotations in the graph chapters, which are easy to erase. Great reference for placements too.',
      price: 850,
      category: 'Textbooks and Notes',
      condition: 'like_new',
      images: ['/uploads/demo/book.jpg'],
      seller: aarav._id,
      college: aarav.college,
      pickupLocation: 'Central library entrance, after 3 PM',
      isNegotiable: true,
      status: 'approved',
      views: 48,
      createdAt: daysAgo(9, 2),
    },
    {
      title: 'Casio FX-991EX Classwiz Scientific Calculator',
      description:
        'Fully working Casio Classwiz calculator with slide cover. Bought last year for engineering maths. Display is clear, keys are responsive, and the battery was replaced recently.',
      price: 950,
      category: 'Calculators and Electronics',
      condition: 'good',
      images: ['/uploads/demo/calculator.jpg'],
      seller: rohan._id,
      college: rohan.college,
      pickupLocation: 'Electronics lab corridor',
      isNegotiable: false,
      status: 'approved',
      views: 37,
      createdAt: daysAgo(8, 4),
    },
    {
      title: 'Engineering Drawing Kit — Complete Set',
      description:
        'Complete drawing kit with compass, divider, set squares, protractor, and mini drafter. Everything is in the original box and has barely been used. Ideal for first-year engineering students.',
      price: 650,
      category: 'Engineering Instruments',
      condition: 'new',
      images: ['/uploads/demo/drafting.jpg'],
      seller: priya._id,
      college: priya.college,
      pickupLocation: 'Mechanical workshop notice board',
      isNegotiable: true,
      status: 'approved',
      views: 29,
      createdAt: daysAgo(7, 1),
    },
    {
      title: 'Organic Chemistry Lab Coat and Safety Goggles',
      description:
        'Lab coat in medium size with two working pockets, plus clear safety goggles. Used for one chemistry practical module. Cleaned and ready for the next student. No stains or tears.',
      price: 400,
      category: 'Lab Equipment',
      condition: 'good',
      images: ['/uploads/demo/lab.jpg'],
      seller: sana._id,
      college: sana.college,
      pickupLocation: 'Chemistry department lobby',
      isNegotiable: true,
      status: 'approved',
      views: 18,
      createdAt: daysAgo(6, 7),
    },
    {
      title: 'Fineliner Pen Set and A3 Sketchbook',
      description:
        'Set of 12 fineliner pens in a zip pouch along with an A3 sketchbook. Nine pens are unused; the black and brown pens are partially used. Sketchbook has 32 blank pages remaining.',
      price: 500,
      category: 'Stationery and Art Supplies',
      condition: 'good',
      images: ['/uploads/demo/stationery.jpg'],
      seller: priya._id,
      college: priya.college,
      pickupLocation: 'Design studio, second floor',
      isNegotiable: false,
      status: 'approved',
      views: 12,
      createdAt: daysAgo(5, 3),
    },
    {
      title: 'Clip-On Study Lamp with Three Brightness Levels',
      description:
        'Compact clip-on reading lamp with warm, neutral, and cool light settings. Works perfectly for hostel desks and late-night reading. USB-powered with a sturdy clamp.',
      price: 550,
      category: 'Hostel Essentials',
      condition: 'like_new',
      images: ['/uploads/demo/lamp.jpg'],
      seller: dev._id,
      college: dev.college,
      pickupLocation: 'Hostel B common room',
      isNegotiable: true,
      status: 'approved',
      views: 26,
      createdAt: daysAgo(4, 6),
    },
    {
      title: 'A2 Mechanical Drafting Board with Clips',
      description:
        'A2 drafting board with two metal clips and a smooth working surface. Minor scuffs on the back, front surface is clean. Suitable for engineering drawing, architecture, and design courses.',
      price: 700,
      category: 'Engineering Instruments',
      condition: 'good',
      images: ['/uploads/demo/drafting.jpg'],
      seller: aarav._id,
      college: aarav.college,
      pickupLocation: 'Design block atrium',
      isNegotiable: true,
      status: 'approved',
      views: 21,
      createdAt: daysAgo(4, 1),
    },
    {
      title: 'Class 11 and 12 Physics Notes Bundle',
      description:
        'Handwritten and printed physics notes covering mechanics, optics, electricity, and modern physics. Organised chapter-wise in two ring binders. Helpful for revision and entrance exam prep.',
      price: 300,
      category: 'Textbooks and Notes',
      condition: 'good',
      images: ['/uploads/demo/notes.jpg'],
      seller: sana._id,
      college: sana.college,
      pickupLocation: 'Fergusson library reading room',
      isNegotiable: false,
      status: 'approved',
      views: 31,
      createdAt: daysAgo(3, 5),
    },
    {
      title: 'Casio FX-82MS Scientific Calculator',
      description:
        'Reliable non-programmable scientific calculator for school and college exams. Shows light signs of use on the casing. All functions and keys work; cover is included.',
      price: 450,
      category: 'Calculators and Electronics',
      condition: 'fair',
      images: ['/uploads/demo/calculator.jpg'],
      seller: dev._id,
      college: dev.college,
      pickupLocation: 'Main canteen, lunch break',
      isNegotiable: true,
      status: 'approved',
      views: 8,
      createdAt: daysAgo(3, 1),
    },
    {
      title: 'Mini Electric Kettle — 0.5 Litre',
      description:
        'Compact electric kettle for tea and instant noodles in the hostel. Auto shut-off works, cord is undamaged, and the inside has been descaled. Moving out, so it needs a new home.',
      price: 400,
      category: 'Hostel Essentials',
      condition: 'like_new',
      images: ['/uploads/demo/kettle.jpg'],
      seller: rohan._id,
      college: rohan.college,
      pickupLocation: 'Hostel C reception',
      isNegotiable: true,
      status: 'approved',
      views: 15,
      createdAt: daysAgo(2, 8),
    },
    {
      title: 'Introduction to Algorithms — Fourth Edition',
      description:
        'Fourth edition hardcover, used for one semester. Clean text with a small name sticker inside the front cover. Sold as a single book, no markings in the exercise pages.',
      price: 900,
      category: 'Textbooks and Notes',
      condition: 'good',
      images: ['/uploads/demo/book.jpg'],
      seller: priya._id,
      college: priya.college,
      pickupLocation: 'Central library gate',
      isNegotiable: false,
      status: 'sold',
      soldAt: daysAgo(1),
      views: 33,
      createdAt: daysAgo(12),
    },
    {
      title: 'TI-84 Plus Graphing Calculator',
      description:
        'Graphing calculator with charging cable and slide cover. Used for statistics coursework. Screen and all keys are working; minor cosmetic wear on the back. Awaiting moderation.',
      price: 4200,
      category: 'Calculators and Electronics',
      condition: 'good',
      images: ['/uploads/demo/calculator.jpg'],
      seller: aarav._id,
      college: aarav.college,
      pickupLocation: 'Computer science department',
      isNegotiable: true,
      status: 'pending',
      views: 0,
      createdAt: daysAgo(1, 2),
    },
    {
      title: 'Lab Apron and Safety Goggles Set',
      description:
        'Unused lab apron with adjustable ties and a fresh pair of sealed safety goggles. Bought an extra set by mistake. Suitable for first-year chemistry and biology labs.',
      price: 350,
      category: 'Lab Equipment',
      condition: 'new',
      images: ['/uploads/demo/apron.jpg'],
      seller: dev._id,
      college: dev.college,
      pickupLocation: 'Science block reception',
      isNegotiable: false,
      status: 'pending',
      views: 0,
      createdAt: daysAgo(0, 6),
    },
    {
      title: 'Premium Noise-Cancelling Headphones',
      description:
        'Over-ear wireless headphones with active noise cancellation and a hard travel case. Demo listing retained in a rejected state to demonstrate moderation feedback and seller editing.',
      price: 1200,
      category: 'Other Student Items',
      condition: 'like_new',
      images: ['/uploads/demo/headphones.jpg'],
      seller: rohan._id,
      college: rohan.college,
      pickupLocation: 'Hostel C entrance',
      isNegotiable: false,
      status: 'rejected',
      rejectionReason:
        'This item is not related to academic or student life on campus. Please relist textbooks, study equipment, or hostel essentials.',
      moderatedBy: admin._id,
      moderatedAt: daysAgo(1, 5),
      views: 0,
      createdAt: daysAgo(2),
    },
    {
      title: 'Mystery Stationery Box',
      description:
        'A mixed box advertised as a mystery bundle. Demo listing retained in a removed state so administrators can demonstrate the removal workflow and moderation history.',
      price: 2000,
      category: 'Other Student Items',
      condition: 'fair',
      images: ['/uploads/demo/stationery.jpg'],
      seller: sana._id,
      college: sana.college,
      pickupLocation: 'Library entrance',
      isNegotiable: true,
      status: 'removed',
      rejectionReason: 'Removed for a vague description and an unreasonable price. Demo moderation record.',
      moderatedBy: admin._id,
      moderatedAt: daysAgo(1),
      views: 2,
      createdAt: daysAgo(2, 2),
    },
    {
      title: 'Combination Wrench Set — 8 Pieces',
      description:
        'Eight-piece combination wrench set in a canvas roll. Used for a single workshop module and kept oiled. Sizes range from 8 mm to 19 mm. Pickup from the workshop area.',
      price: 800,
      category: 'Engineering Instruments',
      condition: 'good',
      images: ['/uploads/demo/tools.jpg'],
      seller: rohan._id,
      college: rohan.college,
      pickupLocation: 'Workshop tool room',
      isNegotiable: true,
      status: 'approved',
      views: 11,
      createdAt: daysAgo(1, 3),
    },
  ];


  const listings = await Listing.insertMany(listingRows);
  const listingByTitle = new Map(listings.map((listing) => [listing.title, listing]));

  const conversationOne = await Conversation.create({
    participants: [sana._id, aarav._id],
    listing: listingByTitle.get('Introduction to Algorithms — CLRS (3rd Edition)')._id,
    participantKey: `${listingByTitle.get('Introduction to Algorithms — CLRS (3rd Edition)')._id}:${[String(sana._id), String(aarav._id)].sort().join(':')}`,
    lastMessage: 'That works for me. I will bring the book to the library entrance.',
    lastMessageAt: daysAgo(1, 2),
  });

  const conversationTwo = await Conversation.create({
    participants: [dev._id, aarav._id],
    listing: listingByTitle.get('A2 Mechanical Drafting Board with Clips')._id,
    participantKey: `${listingByTitle.get('A2 Mechanical Drafting Board with Clips')._id}:${[String(dev._id), String(aarav._id)].sort().join(':')}`,
    lastMessage: 'Is the board still available?',
    lastMessageAt: daysAgo(0, 4),
  });

  await Message.insertMany([
    {
      conversation: conversationOne._id,
      sender: sana._id,
      text: 'Hi Aarav! Is the CLRS book still available? Are the annotations very heavy?',
      createdAt: daysAgo(1, 6),
    },
    {
      conversation: conversationOne._id,
      sender: aarav._id,
      text: 'Hi Sana, yes it is available. The annotations are only in a few graph chapters and are in pencil.',
      createdAt: daysAgo(1, 5),
    },
    {
      conversation: conversationOne._id,
      sender: sana._id,
      text: 'Great. Would ₹780 work? I can meet tomorrow around 4 PM.',
      createdAt: daysAgo(1, 4),
    },
    {
      conversation: conversationOne._id,
      sender: aarav._id,
      text: 'That works for me. I will bring the book to the library entrance.',
      createdAt: daysAgo(1, 2),
    },
    {
      conversation: conversationTwo._id,
      sender: dev._id,
      text: 'Hi Aarav! I saw the A2 drafting board. Is it still available?',
      createdAt: daysAgo(0, 6),
    },
    {
      conversation: conversationTwo._id,
      sender: aarav._id,
      text: 'Yes, it is available. You can take a look at it near the design block.',
      createdAt: daysAgo(0, 5),
    },
    {
      conversation: conversationTwo._id,
      sender: dev._id,
      text: 'Is the board still available?',
      createdAt: daysAgo(0, 4),
    },
  ]);

  await Report.insertMany([
    {
      listing: listingByTitle.get('Mystery Stationery Box')._id,
      reportedBy: dev._id,
      reason: 'misleading',
      description: 'The photos and description do not explain what is inside the box. The price seems unusually high.',
      status: 'open',
      createdAt: daysAgo(1, 1),
    },
    {
      listing: listingByTitle.get('Combination Wrench Set — 8 Pieces')._id,
      reportedBy: sana._id,
      reason: 'other',
      description: 'Demo report created to show the resolved state in the admin panel.',
      status: 'resolved',
      reviewedBy: admin._id,
      reviewedAt: daysAgo(0, 2),
      resolutionNote: 'Seller shared clearer photos and the listing complies with the guidelines.',
      createdAt: daysAgo(1, 4),
    },
  ]);

  await ModerationLog.insertMany([
    {
      admin: admin._id,
      listing: listingByTitle.get('Introduction to Algorithms — CLRS (3rd Edition)')._id,
      action: 'approve_listing',
      reason: 'Academic textbook with clear photos and description.',
      createdAt: daysAgo(9, 1),
    },
    {
      admin: admin._id,
      listing: listingByTitle.get('Premium Noise-Cancelling Headphones')._id,
      action: 'reject_listing',
      reason: 'Not related to academic or student life on campus.',
      createdAt: daysAgo(1, 5),
    },
    {
      admin: admin._id,
      listing: listingByTitle.get('Mystery Stationery Box')._id,
      action: 'remove_listing',
      reason: 'Vague description and unreasonable price.',
      createdAt: daysAgo(1),
    },
    {
      admin: admin._id,
      listing: listingByTitle.get('Combination Wrench Set — 8 Pieces')._id,
      action: 'approve_listing',
      reason: 'Approved after report review.',
      createdAt: daysAgo(0, 3),
    },
  ]);

  console.log('\n[seed] Demo data ready.');
  console.log('─'.repeat(58));
  console.log('  Admin login  :', env.seedAdmin.email);
  console.log('  Admin password:', env.seedAdmin.password);
  console.log('  Student login :', studentRows[0].email);
  console.log('  Student password:', STUDENT_PASSWORD);
  console.log('  Other students:', studentRows.slice(1).map((student) => student.email).join(', '));
  console.log('─'.repeat(58));
  console.log('[seed] Demo accounts are for local development only. Do not deploy these credentials.\n');
}

export { seed as runSeed };

const isDirectRun = process.argv[1] && (process.argv[1].endsWith('seed.js') || process.argv[1].endsWith('seed'));
if (isDirectRun) {
  seed()
    .catch((error) => {
      console.error('[seed] Failed:', error.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await disconnectDatabase();
    });
}
