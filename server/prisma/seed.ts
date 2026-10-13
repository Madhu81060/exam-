import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('Password123!', salt);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Elena Rostova (Admin)',
      email: 'admin@projecthub.com',
      password: defaultPassword,
      role: 'ADMIN',
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      name: 'Sarah Connor (PM)',
      email: 'pm@projecthub.com',
      password: defaultPassword,
      role: 'PROJECT_MANAGER',
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: 'Marcus Vance (PM)',
      email: 'marcus@projecthub.com',
      password: defaultPassword,
      role: 'PROJECT_MANAGER',
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: 'Chloe Bennett',
      email: 'member@projecthub.com',
      password: defaultPassword,
      role: 'TEAM_MEMBER',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'David Kim',
      email: 'david@projecthub.com',
      password: defaultPassword,
      role: 'TEAM_MEMBER',
    },
  });

  const member3 = await prisma.user.create({
    data: {
      name: 'Aisha Patel',
      email: 'aisha@projecthub.com',
      password: defaultPassword,
      role: 'TEAM_MEMBER',
    },
  });

  console.log('✅ Users created');

  // 2. Create Projects
  const now = new Date();
  const pastDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const futureDate1 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const futureDate2 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const overdueDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const project1 = await prisma.project.create({
    data: {
      name: 'PinkSync Cloud Platform Redesign',
      description: 'Revamping the user interface, design system, and dashboard experience with our signature pink & white aesthetic.',
      startDate: pastDate,
      deadline: futureDate1,
      status: 'ACTIVE',
      createdById: pm1.id,
      members: {
        create: [
          { userId: pm1.id, role: 'OWNER' },
          { userId: member1.id, role: 'MEMBER' },
          { userId: member2.id, role: 'MEMBER' },
          { userId: member3.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Enterprise Security & RBAC Audit',
      description: 'End-to-end security penetration testing, JWT token rotation audit, and role-based permissions matrix review.',
      startDate: pastDate,
      deadline: futureDate2,
      status: 'ACTIVE',
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'OWNER' },
          { userId: pm1.id, role: 'MANAGER' },
          { userId: member1.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Mobile App API Integration',
      description: 'RESTful API v2 endpoints for iOS and Android native clients with offline caching support.',
      startDate: now,
      deadline: futureDate2,
      status: 'PLANNING',
      createdById: pm2.id,
      members: {
        create: [
          { userId: pm2.id, role: 'OWNER' },
          { userId: member2.id, role: 'MEMBER' },
          { userId: member3.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const project4 = await prisma.project.create({
    data: {
      name: 'Legacy Database Migration to PostgreSQL',
      description: 'Data mapping, normalization, and zero-downtime migration of customer records.',
      startDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      deadline: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      status: 'COMPLETED',
      createdById: pm1.id,
      members: {
        create: [
          { userId: pm1.id, role: 'OWNER' },
          { userId: member1.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('✅ Projects created');

  // 3. Create Tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Design Pink & White Design Tokens & Component Library',
      description: 'Create Tailwind configurations, rose and pink shade scales, button states, and badge components.',
      projectId: project1.id,
      assignedToId: member1.id,
      createdById: pm1.id,
      priority: 'HIGH',
      status: 'DONE',
      dueDate: pastDate,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Implement Interactive Kanban Board with Drag-and-Drop',
      description: 'Allow team members to drag cards across To Do, In Progress, In Review, and Done columns seamlessly.',
      projectId: project1.id,
      assignedToId: member1.id,
      createdById: pm1.id,
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      dueDate: futureDate1,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Setup Real-time Dashboard Analytics Engine',
      description: 'Aggregate project completion percentages, active project metrics, and overdue task counters from DB.',
      projectId: project1.id,
      assignedToId: member2.id,
      createdById: pm1.id,
      priority: 'HIGH',
      status: 'IN_REVIEW',
      dueDate: futureDate1,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Fix mobile navigation drawer animation bug',
      description: 'The sidebar sometimes overlaps on viewport widths below 640px during transitions.',
      projectId: project1.id,
      assignedToId: member1.id,
      createdById: pm1.id,
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: overdueDate, // Overdue task for testing!
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'Audit Password Hashing and JWT Token Expiry',
      description: 'Verify bcrypt salt rounds, secure token verification, and 401 response consistency.',
      projectId: project2.id,
      assignedToId: member1.id,
      createdById: admin.id,
      priority: 'CRITICAL',
      status: 'DONE',
      dueDate: pastDate,
    },
  });

  const task6 = await prisma.task.create({
    data: {
      title: 'Role-Based Access Control Verification Tests',
      description: 'Ensure Team Members cannot access unauthorized project endpoints or delete projects.',
      projectId: project2.id,
      assignedToId: member3.id,
      createdById: admin.id,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: futureDate2,
    },
  });

  const task7 = await prisma.task.create({
    data: {
      title: 'Draft OpenAPI 3.0 API Specification',
      description: 'Document endpoints, request schemas, query parameters, and JSON response models.',
      projectId: project3.id,
      assignedToId: member2.id,
      createdById: pm2.id,
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: futureDate2,
    },
  });

  const task8 = await prisma.task.create({
    data: {
      title: 'Legacy Schema Data Backup & Archival verification',
      description: 'Take cold storage snapshots and verify data integrity hashes before decommissioning.',
      projectId: project4.id,
      assignedToId: member1.id,
      createdById: pm1.id,
      priority: 'LOW',
      status: 'DONE',
      dueDate: pastDate,
    },
  });

  console.log('✅ Tasks created');

  // 4. Create Task Comments
  await prisma.taskComment.create({
    data: {
      content: 'I have finalized the color palette! The soft rose hues and crisp white cards look vibrant and clean.',
      taskId: task1.id,
      authorId: member1.id,
    },
  });

  await prisma.taskComment.create({
    data: {
      content: 'Great work Chloe! The pink buttons and hover states provide great accessibility and contrast.',
      taskId: task1.id,
      authorId: pm1.id,
    },
  });

  await prisma.taskComment.create({
    data: {
      content: 'I am wiring up the drag-and-drop event listeners. Testing column transitions now.',
      taskId: task2.id,
      authorId: member1.id,
    },
  });

  await prisma.taskComment.create({
    data: {
      content: 'Dashboard queries have been tested with Prisma count aggregations and are lightning fast.',
      taskId: task3.id,
      authorId: member2.id,
    },
  });

  console.log('✅ Comments created');

  // 5. Create Activity History
  const activities = [
    {
      userId: pm1.id,
      action: 'PROJECT_CREATED',
      details: 'Created project "PinkSync Cloud Platform Redesign"',
      projectId: project1.id,
    },
    {
      userId: pm1.id,
      action: 'MEMBER_ASSIGNED',
      details: 'Added Chloe Bennett to PinkSync Cloud Platform Redesign',
      projectId: project1.id,
    },
    {
      userId: pm1.id,
      action: 'TASK_CREATED',
      details: 'Created task "Design Pink & White Design Tokens & Component Library"',
      projectId: project1.id,
      taskId: task1.id,
    },
    {
      userId: member1.id,
      action: 'TASK_STATUS_CHANGED',
      details: 'Status changed from "IN_PROGRESS" to "DONE" on task "Design Pink & White Design Tokens & Component Library"',
      projectId: project1.id,
      taskId: task1.id,
    },
    {
      userId: pm1.id,
      action: 'TASK_CREATED',
      details: 'Created task "Implement Interactive Kanban Board with Drag-and-Drop"',
      projectId: project1.id,
      taskId: task2.id,
    },
    {
      userId: member1.id,
      action: 'TASK_STATUS_CHANGED',
      details: 'Status changed from "TODO" to "IN_PROGRESS" on task "Implement Interactive Kanban Board with Drag-and-Drop"',
      projectId: project1.id,
      taskId: task2.id,
    },
    {
      userId: admin.id,
      action: 'PROJECT_CREATED',
      details: 'Created project "Enterprise Security & RBAC Audit"',
      projectId: project2.id,
    },
    {
      userId: member1.id,
      action: 'TASK_STATUS_CHANGED',
      details: 'Status changed from "IN_REVIEW" to "DONE" on task "Audit Password Hashing and JWT Token Expiry"',
      projectId: project2.id,
      taskId: task5.id,
    },
  ];

  for (const act of activities) {
    await prisma.activityLog.create({ data: act });
  }

  console.log('✅ Activity history created');
  console.log('\n==========================================');
  console.log('🎉 Seed completed successfully!');
  console.log('------------------------------------------');
  console.log('Demo Credentials:');
  console.log('1. Admin:           admin@projecthub.com   / Password123!');
  console.log('2. Project Manager: pm@projecthub.com      / Password123!');
  console.log('3. Team Member:     member@projecthub.com  / Password123!');
  console.log('==========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
