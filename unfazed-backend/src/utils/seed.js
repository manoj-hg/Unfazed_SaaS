require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const Session = require('../models/Session');
const SessionNote = require('../models/SessionNote');
const Availability = require('../models/Availability');
const Payment = require('../models/Payment');
const Package = require('../models/Package');
const ClientPackage = require('../models/ClientPackage');
const Lead = require('../models/Lead');
const ChatMessage = require('../models/ChatMessage');
const SubscriptionTierConfig = require('../models/SubscriptionTierConfig');

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/unfazed';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB at:', mongoUri);

    // Clear previous demo collections
    await Promise.all([
      Therapist.deleteMany({}),
      Client.deleteMany({}),
      Session.deleteMany({}),
      SessionNote.deleteMany({}),
      Availability.deleteMany({}),
      Payment.deleteMany({}),
      Package.deleteMany({}),
      ClientPackage.deleteMany({}),
      Lead.deleteMany({}),
      ChatMessage.deleteMany({}),
      SubscriptionTierConfig.deleteMany({})
    ]);
    console.log('[Seed] Cleared existing records.');

    // 1. Seed Subscription Tiers
    const tiers = await SubscriptionTierConfig.insertMany([
      {
        name: 'free',
        display_name: 'Starter Practice',
        price_monthly: 0,
        price_yearly: 0,
        description: 'Ideal for solo practitioners starting out.',
        caps: {
          max_active_clients: 5,
          max_packages: 0
        },
        features: {
          can_use_shared_notes: false,
          can_view_advanced_analytics: false,
          can_use_soap_templates: false,
          can_sell_packages: false,
          can_export_invoices: true,
          can_use_custom_branding: false
        }
      },
      {
        name: 'pro',
        display_name: 'Professional Practice',
        price_monthly: 2499,
        price_yearly: 24990,
        description: 'For growing practices needing full clinical workflows, SOAP notes, analytics & packages.',
        caps: {
          max_active_clients: 25,
          max_packages: 5
        },
        features: {
          can_use_shared_notes: true,
          can_view_advanced_analytics: true,
          can_use_soap_templates: true,
          can_sell_packages: true,
          can_export_invoices: true,
          can_use_custom_branding: true
        }
      },
      {
        name: 'enterprise',
        display_name: 'Clinical Enterprise',
        price_monthly: 5999,
        price_yearly: 59990,
        description: 'Unlimited clients, custom domain branding, and priority multi-channel support.',
        caps: {
          max_active_clients: 99999,
          max_packages: 50
        },
        features: {
          can_use_shared_notes: true,
          can_view_advanced_analytics: true,
          can_use_soap_templates: true,
          can_sell_packages: true,
          can_export_invoices: true,
          can_use_custom_branding: true
        }
      }
    ]);
    console.log('[Seed] Created subscription tiers.');

    // 2. Seed Therapists
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    const drAnanya = new Therapist({
      name: 'Dr. Ananya Sharma',
      email: 'ananya@unfazed.in',
      password_hash: passwordHash,
      slug: 'dr-sharma',
      title: 'Senior Clinical Psychologist & Psychotherapist',
      qualifications: 'M.Phil Clinical Psychology (NIMHANS), RCI Regd.',
      experience_years: 9,
      city: 'Indiranagar, Bengaluru',
      session_rate: 2000,
      currency: 'INR',
      gstin: '29AABCU9876Q1Z5',
      phone: '+91 98450 12345',
      bio: 'Compassionate, evidence-based psychotherapy tailored to help you navigate life transitions, reduce anxiety, and build lasting emotional resilience.',
      specializations: ['Anxiety & Panic', 'Depression', 'CBT & Mindfulness', 'Relationship Therapy', 'Burnout & Work Stress'],
      languages: ['English', 'Hindi', 'Kannada'],
      subscription_tier: 'pro'
    });
    await drAnanya.save();

    const drRohan = new Therapist({
      name: 'Dr. Rohan Verma',
      email: 'rohan@unfazed.in',
      password_hash: passwordHash,
      slug: 'dr-rohan',
      title: 'Consultant Counseling Psychologist',
      qualifications: 'M.Sc Counseling Psychology',
      experience_years: 4,
      city: 'Bandra, Mumbai',
      session_rate: 1500,
      currency: 'INR',
      gstin: '27AABCV1234P1Z8',
      phone: '+91 98200 54321',
      bio: 'Providing a supportive, non-judgmental space for young adults and professionals navigating career dilemmas and relationship challenges.',
      specializations: ['Career Anxiety', 'Self-Esteem', 'Life Transitions', 'Student Counseling'],
      languages: ['English', 'Hindi', 'Marathi'],
      subscription_tier: 'free'
    });
    await drRohan.save();
    console.log('[Seed] Created therapists: Dr. Ananya Sharma (Pro) & Dr. Rohan Verma (Free).');

    // 3. Seed Availability for Dr. Ananya
    await Availability.create({
      therapist_id: drAnanya._id,
      session_duration: 60,
      buffer_time: 15,
      timezone: 'Asia/Kolkata',
      weekly_schedule: {
        monday: { isAvailable: true, start: "09:00", end: "17:00" },
        tuesday: { isAvailable: true, start: "09:00", end: "17:00" },
        wednesday: { isAvailable: true, start: "09:00", end: "17:00" },
        thursday: { isAvailable: true, start: "09:00", end: "17:00" },
        friday: { isAvailable: true, start: "09:00", end: "16:00" },
        saturday: { isAvailable: true, start: "10:00", end: "14:00" },
        sunday: { isAvailable: false, start: "10:00", end: "14:00" }
      }
    });

    // 4. Seed Packages for Dr. Ananya
    const pkg3 = await Package.create({
      therapist_id: drAnanya._id,
      name: 'Starter Alignment Bundle (3 Sessions)',
      session_count: 3,
      price: 5400,
      discount_percentage: 10,
      description: 'Ideal for tackling specific situational stressors and developing initial coping strategies.',
      validity_days: 60,
      active: true
    });

    const pkg6 = await Package.create({
      therapist_id: drAnanya._id,
      name: 'Transformation & Resilience Pack (6 Sessions)',
      session_count: 6,
      price: 10200,
      discount_percentage: 15,
      description: 'Our most popular bundle for in-depth CBT work, behavior modification, and sustained relief.',
      validity_days: 90,
      active: true
    });

    const pkg12 = await Package.create({
      therapist_id: drAnanya._id,
      name: 'Comprehensive Care Journey (12 Sessions)',
      session_count: 12,
      price: 19200,
      discount_percentage: 20,
      description: 'Long-term structured psycho-therapeutic journey addressing deep-rooted patterns and trauma.',
      validity_days: 180,
      active: true
    });

    // 5. Seed Clients for Dr. Ananya
    const clientData = [
      {
        name: 'Priya Patel',
        email: 'priya.patel@gmail.com',
        phone: '+91 98111 22334',
        status: 'active',
        tags: ['Anxiety', 'CBT', 'Weekly'],
        intake_form: {
          age: 29,
          gender: 'Female',
          emergency_contact: 'Vikram Patel (+91 98111 99887)',
          concern: 'Generalized anxiety and insomnia aggravated by high-pressure tech lead role.',
          medical_history: 'Mild thyroid imbalance, non-smoker.',
          prior_therapy: 'Brief college counseling 4 years ago.'
        },
        consent_signed_at: new Date('2026-08-15T10:30:00Z')
      },
      {
        name: 'Rahul Nair',
        email: 'rahul.nair@outlook.com',
        phone: '+91 98222 33445',
        status: 'active',
        tags: ['Work Burnout', 'Mindfulness'],
        intake_form: {
          age: 34,
          gender: 'Male',
          emergency_contact: 'Deepa Nair (+91 98222 77665)',
          concern: 'Severe executive fatigue, emotional detachment, and sleep disturbance.',
          medical_history: 'None reported.',
          prior_therapy: 'None.'
        },
        consent_signed_at: new Date('2026-08-20T14:15:00Z')
      },
      {
        name: 'Sneha Iyer',
        email: 'sneha.iyer@yahoo.com',
        phone: '+91 98333 44556',
        status: 'active',
        tags: ['Relationships', 'Bi-weekly'],
        intake_form: {
          age: 31,
          gender: 'Female',
          emergency_contact: 'Kavita Iyer (+91 98333 11223)',
          concern: 'Anxious attachment patterns and relationship boundary setting.',
          medical_history: 'No physical conditions.',
          prior_therapy: 'Attended grief counseling in 2024.'
        },
        consent_signed_at: new Date('2026-09-01T09:00:00Z')
      },
      {
        name: 'Vikram Rao',
        email: 'vikram.rao@techcorp.in',
        phone: '+91 98444 55667',
        status: 'active',
        tags: ['Panic Attacks', 'Agoraphobia'],
        intake_form: {
          age: 26,
          gender: 'Male',
          emergency_contact: 'Suresh Rao (+91 98444 88990)',
          concern: 'Sudden panic surges during commute and crowded meetings.',
          medical_history: 'Cardiology workup clear.',
          prior_therapy: 'None.'
        },
        consent_signed_at: new Date('2026-09-10T11:45:00Z')
      },
      {
        name: 'Ananya Sen',
        email: 'ananya.sen@gmail.com',
        phone: '+91 98555 66778',
        status: 'lead',
        tags: ['Inquiry', 'Evening Preferred'],
        intake_form: {
          age: 27,
          concern: 'Seeking guidance on ADHD executive dysfunction coping mechanisms.'
        },
        consent_signed_at: null
      }
    ];

    const insertedClients = [];
    for (const c of clientData) {
      const client = new Client({
        therapist_id: drAnanya._id,
        ...c
      });
      await client.save();
      insertedClients.push(client);
    }
    console.log(`[Seed] Created ${insertedClients.length} clients.`);

    const priya = insertedClients[0];
    const rahul = insertedClients[1];
    const sneha = insertedClients[2];
    const vikram = insertedClients[3];

    // 6. Seed Sessions
    const now = new Date();
    const sessions = [
      // Past completed sessions
      {
        therapist_id: drAnanya._id,
        client_name: priya.name,
        client_email: priya.email,
        start_time: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        end_time: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: 'completed'
      },
      {
        therapist_id: drAnanya._id,
        client_name: priya.name,
        client_email: priya.email,
        start_time: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end_time: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: 'completed'
      },
      {
        therapist_id: drAnanya._id,
        client_name: rahul.name,
        client_email: rahul.email,
        start_time: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        end_time: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: 'completed'
      },
      {
        therapist_id: drAnanya._id,
        client_name: sneha.name,
        client_email: sneha.email,
        start_time: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        end_time: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: 'completed'
      },
      // Upcoming booked sessions
      {
        therapist_id: drAnanya._id,
        client_name: priya.name,
        client_email: priya.email,
        start_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        end_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: 'booked'
      },
      {
        therapist_id: drAnanya._id,
        client_name: vikram.name,
        client_email: vikram.email,
        start_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        end_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: 'booked'
      }
    ];
    const insertedSessions = await Session.insertMany(sessions);
    console.log(`[Seed] Created ${insertedSessions.length} sessions.`);

    // 7. Seed Clinical Notes (Private SOAP notes + Client Shared notes)
    await SessionNote.create({
      therapist_id: drAnanya._id,
      client_id: priya._id,
      session_id: insertedSessions[0]._id,
      title: 'Session 1: Initial Assessment & Baseline',
      type: 'private',
      format: 'soap',
      content: '<p>Client presented with elevated autonomic arousal and cognitive rumination regarding performance reviews.</p>',
      soap_data: {
        subjective: 'Client reports feeling on-edge continuously for 3 months, waking at 3:30 AM with racing heartbeat.',
        objective: 'Affect was tense; speech rapid but coherent. GAD-7 baseline score: 16 (Severe anxiety).',
        assessment: 'Generalized anxiety disorder with somatic panic features precipitated by occupational overcommitment.',
        plan: 'Initiated psycho-education on fight-or-flight response. Prescribed daily 4-7-8 diaphragmatic breathing practice.'
      }
    });

    await SessionNote.create({
      therapist_id: drAnanya._id,
      client_id: priya._id,
      session_id: insertedSessions[1]._id,
      title: 'Session 2: Cognitive Restructuring Practice',
      type: 'private',
      format: 'soap',
      content: '<p>Review of thought records demonstrated catastrophizing cognitive distortions.</p>',
      soap_data: {
        subjective: 'Client noticed "what if" thought spirals triggered by Slack notifications.',
        objective: 'Client showed good comprehension of automatic negative thoughts (ANTs). Engagement high.',
        assessment: 'Positive response to cognitive restructuring; reduction in acute palpitations reported.',
        plan: 'Continue 3-column thought record. Plan behavioral experiment during team sprint planning.'
      }
    });

    // Shared Note visible in Client Portal
    await SessionNote.create({
      therapist_id: drAnanya._id,
      client_id: priya._id,
      session_id: insertedSessions[1]._id,
      title: 'Take-Home Resource: 5-4-3-2-1 Grounding & Thought Catching Guide',
      type: 'shared',
      format: 'freeform',
      content: '<h3>Shared Session Summary & Exercises</h3><p>Hi Priya! Here are the core grounding techniques we practiced today:</p><ul><li><strong>5-4-3-2-1 Sensory Grounding:</strong> Look around for 5 things you can see, 4 you can physically feel, 3 you hear, 2 you smell, and 1 slow breath you taste.</li><li><strong>Catch the Thought:</strong> When you notice "I am going to fail the presentation", gently reframe it to: "I am experiencing anxious thoughts, but I have prepared well."</li><li><strong>Sleep Hygiene:</strong> 30 minutes screen-free winddown before bed.</li></ul><p>Looking forward to reviewing your thoughts journal in our next session!</p>'
    });

    // 8. Seed Payments
    const payments = [
      {
        therapist_id: drAnanya._id,
        client_id: priya._id,
        amount: 2000,
        currency: 'INR',
        status: 'successful',
        razorpay_order_id: 'order_seed_001',
        razorpay_payment_id: 'pay_seed_priya_1',
        razorpay_signature: 'sig_seed_verified',
        type: 'session',
        invoice_number: 'UNF-2026-1001',
        description: 'Therapy Session Booking'
      },
      {
        therapist_id: drAnanya._id,
        client_id: rahul._id,
        amount: 5400,
        currency: 'INR',
        status: 'successful',
        razorpay_order_id: 'order_seed_002',
        razorpay_payment_id: 'pay_seed_rahul_pkg',
        razorpay_signature: 'sig_seed_verified',
        type: 'package',
        reference_id: pkg3._id,
        invoice_number: 'UNF-2026-1002',
        description: 'Starter Alignment Bundle (3 Sessions)'
      },
      {
        therapist_id: drAnanya._id,
        client_id: sneha._id,
        amount: 2000,
        currency: 'INR',
        status: 'successful',
        razorpay_order_id: 'order_seed_003',
        razorpay_payment_id: 'pay_seed_sneha_1',
        razorpay_signature: 'sig_seed_verified',
        type: 'session',
        invoice_number: 'UNF-2026-1003',
        description: 'Therapy Session Booking'
      },
      {
        therapist_id: drAnanya._id,
        client_id: vikram._id,
        amount: 2000,
        currency: 'INR',
        status: 'successful',
        razorpay_order_id: 'order_seed_004',
        razorpay_payment_id: 'pay_seed_vikram_1',
        razorpay_signature: 'sig_seed_verified',
        type: 'session',
        invoice_number: 'UNF-2026-1004',
        description: 'Therapy Session Booking'
      }
    ];
    await Payment.insertMany(payments);
    console.log('[Seed] Created payments with GST invoice numbers.');

    // 9. Seed Client Package for Rahul
    await ClientPackage.create({
      client_id: rahul._id,
      therapist_id: drAnanya._id,
      package_id: pkg3._id,
      total_sessions: 3,
      sessions_remaining: 2,
      expires_at: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      status: 'active'
    });

    // 10. Seed Chat Messages between Dr. Ananya and Priya
    await ChatMessage.insertMany([
      {
        therapist_id: drAnanya._id,
        client_id: priya._id,
        sender: 'client',
        message: 'Hello Dr. Ananya, I practiced the grounding exercise yesterday before my review. It helped calm the panic down!',
        read: true,
        createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000)
      },
      {
        therapist_id: drAnanya._id,
        client_id: priya._id,
        sender: 'therapist',
        message: 'That is wonderful news, Priya! You did the hard work of noticing the bodily tension and grounding yourself. Keep noting any automatic thoughts in your thought journal.',
        read: true,
        createdAt: new Date(now.getTime() - 46 * 60 * 60 * 1000)
      },
      {
        therapist_id: drAnanya._id,
        client_id: priya._id,
        sender: 'client',
        message: 'Will do! See you in our upcoming session on Friday.',
        read: true,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000)
      }
    ]);
    console.log('[Seed] Created chat message history.');

    console.log('----------------------------------------------------');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Demo Login Credentials:');
    console.log('1. Pro Practice:   ananya@unfazed.in / Password123!');
    console.log('   Public Portal:  http://localhost:5173/dr-sharma');
    console.log('2. Free Practice:  rohan@unfazed.in  / Password123!');
    console.log('   Public Portal:  http://localhost:5173/dr-rohan');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

seedDatabase();
