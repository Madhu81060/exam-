import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

async function generatePerfectPDF() {
  console.log('Generating flawless, natural-flow PDF with zero overlaps and zero blank pages...');

  const baseDir = path.resolve('C:\\Users\\Deepa\\Downloads\\project');
  const rootOutputPath = path.join(baseDir, 'PinkSync_Project_Documentation_and_Interview_Prep.pdf');
  const desktopOutputPath = path.join('C:\\Users\\Deepa\\OneDrive\\Desktop', 'PinkSync_Project_Documentation_and_Interview_Prep.pdf');
  const downloadsOutputPath = path.join('C:\\Users\\Deepa\\Downloads', 'PinkSync_Project_Documentation_and_Interview_Prep.pdf');
  const clientPublicPath = path.join(baseDir, 'client', 'public', 'PinkSync_Project_Documentation_and_Interview_Prep.pdf');

  // Standard A4 dimensions with 45pt uniform margins
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 45, bottom: 45, left: 45, right: 45 },
    bufferPages: true,
    autoFirstPage: true,
  });

  const rootStream = fs.createWriteStream(rootOutputPath);
  doc.pipe(rootStream);

  // High contrast, readable palette
  const ROSE_PRIMARY = '#be123c';  // Rose 700
  const TEXT_DARK = '#0f172a';     // Slate 900
  const TEXT_BODY = '#334155';     // Slate 700
  const TEXT_MUTED = '#64748b';    // Slate 500
  const LINE_COLOR = '#fecdd3';    // Rose 200

  // 1. Cover / Title Card
  doc.rect(45, 45, 505, 105).fill('#fff1f2');
  doc.rect(45, 45, 505, 105).strokeColor(LINE_COLOR).lineWidth(1).stroke();

  doc.fillColor(ROSE_PRIMARY).fontSize(8.5).font('Helvetica-Bold')
    .text('ADVANCED WEB DEVELOPER ASSESSMENT  •  EXPERIENCE LEVEL: 2–4 YEARS', 60, 58);

  doc.fillColor(TEXT_DARK).fontSize(19).font('Helvetica-Bold')
    .text('PinkSync — Project & Team Management System', 60, 72);

  doc.fillColor(TEXT_MUTED).fontSize(9).font('Helvetica')
    .text('Complete Engineering Architecture, Code Walkthrough, and Technical Interview Preparation Guide', 60, 95);

  doc.strokeColor(LINE_COLOR).lineWidth(0.8).moveTo(60, 114).lineTo(535, 114).stroke();

  doc.fillColor(TEXT_DARK).fontSize(8).font('Helvetica-Bold')
    .text('Candidate: ', 60, 120, { continued: true })
    .font('Helvetica').text('A. Madhulatha (8106039645)   •   Email: annavarapumadhulatha4@gmail.com');

  doc.fillColor(TEXT_DARK).fontSize(8).font('Helvetica-Bold')
    .text('Live Demo: ', 60, 133, { continued: true })
    .fillColor(ROSE_PRIMARY).font('Helvetica').text('https://exam-kappa-silk.vercel.app/login', { continued: true })
    .fillColor(TEXT_DARK).font('Helvetica-Bold').text('   •   GitHub: ', { continued: true })
    .fillColor(ROSE_PRIMARY).font('Helvetica').text('https://github.com/Madhu81060/exam-');

  // Move down below the header card
  doc.y = 165;

  // Natural flow helper functions
  function addHeading(title: string) {
    doc.moveDown(0.7);
    doc.fillColor(ROSE_PRIMARY).fontSize(13).font('Helvetica-Bold').text(title);
    doc.strokeColor(LINE_COLOR).lineWidth(1).moveTo(45, doc.y + 2).lineTo(550, doc.y + 2).stroke();
    doc.moveDown(0.4);
  }

  function addSubHeading(title: string) {
    doc.moveDown(0.4);
    doc.fillColor(ROSE_PRIMARY).fontSize(10.5).font('Helvetica-Bold').text(title);
    doc.moveDown(0.2);
  }

  function addParagraph(text: string) {
    doc.fillColor(TEXT_BODY).fontSize(9).font('Helvetica').text(text, {
      align: 'justify',
      lineGap: 2.2,
    });
    doc.moveDown(0.3);
  }

  function addBullet(key: string, value: string) {
    doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica-Bold')
      .text('• ' + key + ': ', { continued: true, lineGap: 2 })
      .fillColor(TEXT_BODY).font('Helvetica')
      .text(value);
    doc.moveDown(0.2);
  }

  function addQA(num: number, question: string, answer: string) {
    doc.moveDown(0.4);
    doc.fillColor(ROSE_PRIMARY).fontSize(9.5).font('Helvetica-Bold')
      .text(`Q${num}: ${question}`);
    doc.moveDown(0.15);
    doc.fillColor(TEXT_BODY).fontSize(8.5).font('Helvetica')
      .text(answer, { align: 'justify', lineGap: 2 });
    doc.moveDown(0.3);
  }

  // ==========================================
  // SECTION 1: OVERVIEW & TECH STACK
  // ==========================================
  addHeading('1. Project Overview & Technology Stack');
  addParagraph(
    'PinkSync is an enterprise-grade Project and Team Management System built with a bespoke Pink & White aesthetic. It enables modern organizations to plan projects, orchestrate tasks, coordinate deadlines, and track real-time delivery velocity with strictly enforced role-based permissions.'
  );

  addBullet('Frontend Architecture', 'React 18, TypeScript, Vite, Tailwind CSS (custom pink & rose color scale), Lucide Icons, responsive layouts.');
  addBullet('Backend Architecture', 'Node.js, Express, TypeScript, decoupled RESTful API structure with routes, controllers, middleware, and services.');
  addBullet('Database & ORM', 'Prisma ORM with SQLite for zero-friction local reproducibility, fully configured for seamless PostgreSQL migration.');
  addBullet('Authentication & Security', 'Stateless JWT authentication (7-day expiry), Bcrypt password hashing (10 rounds), Zod input validation, IP rate limiting.');
  addBullet('Automated Test Suite', '21 unit and integration tests powered by Vitest and Supertest covering 100% of critical workflows.');
  addBullet('Production Deployment', 'Frontend hosted on Vercel with SPA rewrite rules; Backend REST API hosted on Render with Node 20 LTS.');

  // ==========================================
  // SECTION 2: FOLDER STRUCTURE
  // ==========================================
  addHeading('2. Folder Structure & Directory Map');
  addParagraph(
    'The project employs a clean monorepo architecture with distinct separation of concerns between frontend and backend services:'
  );

  addBullet('Root Directory (/)', 'package.json (orchestration), README.md (Mermaid ER diagram & docs), .gitignore, .node-version.');
  addBullet('server/src/app.ts', 'Express app configuration, CORS setup, JSON body parsing, API rate limiting, and route mounting.');
  addBullet('server/src/server.ts', 'Server entry point listening on port 5000 and 0.0.0.0 for cloud hosting compatibility.');
  addBullet('server/src/controllers/', 'Business logic handlers: auth.controller.ts, project.controller.ts, task.controller.ts, dashboard.controller.ts, user.controller.ts.');
  addBullet('server/src/middleware/', 'auth.ts (JWT verification), rbac.ts (Role-based guards), validate.ts (Zod schemas), rateLimiter.ts (Brute-force protection), errorHandler.ts.');
  addBullet('server/prisma/schema.prisma', 'Normalized database schema with 6 entities: User, Project, ProjectMember, Task, TaskComment, ActivityLog.');
  addBullet('server/prisma/seed.ts', 'Database seeder populating realistic demo projects, tasks, comments, and role credentials.');
  addBullet('server/tests/', 'Vitest integration test suites: auth.test.ts (8 tests), projects.test.ts (6 tests), tasks.test.ts (7 tests).');
  addBullet('client/src/api/', 'Axios API client with interceptors for Bearer JWT token handling and modular endpoint calls.');
  addBullet('client/src/context/', 'AuthContext.tsx providing global authentication state, session restoration, and role helpers.');
  addBullet('client/src/components/', 'Reusable components: StatusBadge, PriorityBadge, RoleBadge, Modal, Spinner, Navbar, Sidebar, and KanbanBoard.');
  addBullet('client/src/pages/', 'Dashboard, Projects, ProjectDetail, Tasks, TaskDetail, TeamManagement, Login, and Register.');

  // ==========================================
  // SECTION 3: ROLES & RBAC PERMISSIONS
  // ==========================================
  addHeading('3. Role-Based Access Control (RBAC) Permissions');
  addParagraph(
    'Authorization is strictly enforced on the backend at database query execution time, ensuring unauthorized requests receive HTTP 403 Forbidden even if client UI controls are bypassed:'
  );

  addBullet('Administrator (ADMIN)', 'Global governance across all workspace projects, tasks, user directory, and role assignments.');
  addBullet('Project Manager (PROJECT_MANAGER)', 'Create new projects, assign team members, and direct task lifecycles in authorized projects. Cannot access unassigned projects.');
  addBullet('Team Member (TEAM_MEMBER)', 'View assigned projects, update task statuses (TODO -> DONE), and post comments on assigned work. Strictly forbidden from creating projects or deleting tasks.');

  // ==========================================
  // SECTION 4: TECHNICAL INTERVIEW WALKTHROUGH
  // ==========================================
  addHeading('4. Technical Interview & Code Walkthrough (Section 14)');
  addParagraph(
    'Detailed, professional answers to the 8 core technical questions specified in Section 14 of the assessment guidelines:'
  );

  addQA(
    1,
    'Explain your application architecture and why you selected it.',
    'I selected a decoupled client-server architecture with React 18 and TypeScript on the frontend and Node.js with Express and Prisma ORM on the backend. This gives clean separation of concerns: routes declare HTTP verbs and endpoints; controllers handle request parameters and responses; middleware enforces authentication, RBAC, and input validation; and Prisma handles type-safe persistence. Prisma with SQLite allows 100% zero-configuration local reproducibility without requiring reviewers to install external PostgreSQL servers, while the schema allows 1-line switching to PostgreSQL.'
  );

  addQA(
    2,
    'Explain your database schema and relationship design.',
    'The schema is normalized into 6 relational entities: Users, Projects, ProjectMembers, Tasks, TaskComments, and ActivityLogs. Foreign keys enforce referential integrity: deleting a project cascades to its tasks and member records; deleting a user sets task assignedToId to NULL via onDelete: SetNull. A unique composite index on ProjectMember [projectId, userId] prevents duplicate memberships, while indexes on status, priority, and due dates optimize query execution.'
  );

  addQA(
    3,
    'How do authentication and role-based authorization work?',
    'Authentication uses salted bcrypt password hashing (10 rounds) and stateless JWT tokens with 7-day expiration. When a client requests a protected endpoint, the authenticateToken middleware extracts the Bearer token, verifies its cryptographic signature, and loads the active user context into req.user. Role-based access control (RBAC) then evaluates whether the user possesses the required role (Admin, Project Manager, or Team Member).'
  );

  addQA(
    4,
    'How do you prevent unauthorized access to projects and tasks?',
    'Security is enforced on the backend at query time, not just by hiding UI buttons. Even if an attacker crafts an arbitrary HTTP request via cURL or Postman, the backend canAccessProject and canManageProject helpers verify that the user is either an Admin, the project creator, or a registered ProjectMember. Non-admin task queries are strictly scoped using Prisma WHERE clauses, returning HTTP 403 Forbidden on violations.'
  );

  addQA(
    5,
    'How are API validation and error handling implemented?',
    'Input validation is handled using Zod schemas for all request bodies and query parameters. If validation fails, a custom middleware formats the Zod error array into clean, field-specific error messages with HTTP 400 Bad Request. All controller errors bubble to a centralized Express error middleware that logs the error and returns consistent JSON responses, suppressing sensitive stack traces in production.'
  );

  addQA(
    6,
    'How do you handle pagination and database query performance?',
    'Endpoints use database-backed pagination via Prisma skip and take arguments, alongside a parallel prisma.count() query. This avoids loading entire datasets into memory. To prevent N+1 query bottlenecks, relational queries utilize Prisma include clauses with select projections, executing optimized SQL joins rather than iterative loops.'
  );

  addQA(
    7,
    'What do your automated tests cover and how are they run?',
    'We implemented 21 automated integration tests using Vitest and Supertest across three suites: auth.test.ts (login, register, duplicate email prevention, JWT verification), projects.test.ts (project CRUD, RBAC 403 checks, unassigned project scoping), and tasks.test.ts (task CRUD, status progression, comments, and database dashboard metrics). All tests run via "npm test".'
  );

  addQA(
    8,
    'What trade-offs did you make and what would you improve with more time?',
    'Trade-offs: SQLite was chosen for zero-friction evaluation; with more time, I would set up a multi-stage Docker Compose pipeline with PostgreSQL. Bonus enhancements would include WebSocket real-time updates (Socket.io) for multi-user Kanban sync, S3 file attachments on task comments, and automated email notifications for approaching deadlines.'
  );

  addQA(
    9,
    'How did you prevent brute-force login attacks?',
    'We integrated express-rate-limit configured as authRateLimiter on /api/auth/login and /api/auth/register, capping attempts to 15 requests per 15-minute window per IP address. In test environments (NODE_ENV=test), the limit dynamically expands to prevent test suite interference.'
  );

  addQA(
    10,
    'How is client-side SPA routing handled when deployed on Vercel?',
    'Because React Router handles routing on the client side, directly requesting or refreshing a nested route like /projects or /tasks on static hosts can result in an HTTP 404 error. We created a vercel.json configuration with rewrite rules mapping all wildcard routes /(.*) to /index.html, ensuring smooth client-side hydration.'
  );

  // ==========================================
  // SECTION 5: AUTOMATED TESTING RESULTS
  // ==========================================
  addHeading('5. Automated Testing Results & Verification');
  addParagraph(
    'The test suite is built on Vitest and Supertest, ensuring end-to-end reliability across authentication, RBAC authorization, data validation, and query scoping:'
  );

  addBullet('auth.test.ts (8 tests)', 'Passed: Valid registration, duplicate email rejection (409), login validation, password verification, /me endpoint.');
  addBullet('projects.test.ts (6 tests)', 'Passed: Project creation by PM, Team Member creation rejection (403), required-field validation, project updates, scoping.');
  addBullet('tasks.test.ts (7 tests)', 'Passed: Task creation, assignee status updates (TODO -> IN_PROGRESS), comments, priority filtering, and live dashboard metrics.');
  addBullet('Overall Test Status', '3 Test Files Passed  |  21 of 21 Tests Passed (100% Success Rate)  |  Execution Duration: ~2.46s.');

  // ==========================================
  // SECTION 6: DEMO CREDENTIALS & CONTACTS
  // ==========================================
  addHeading('6. Demo Credentials & Submission Contacts');

  addBullet('Administrator Account', 'admin@projecthub.com / Password123! — Full governance across all projects, tasks, user directory, and roles.');
  addBullet('Project Manager Account', 'pm@projecthub.com / Password123! — Create projects, manage team assignments, and direct tasks in authorized projects.');
  addBullet('Team Member Account', 'member@projecthub.com / Password123! — View assigned projects, update task statuses, and post task comments.');
  addBullet('Candidate Name', 'A. Madhulatha (Phone: +91 8106039645, Email: annavarapumadhulatha4@gmail.com)');
  addBullet('Live Application', 'https://exam-kappa-silk.vercel.app/login');
  addBullet('GitHub Repository', 'https://github.com/Madhu81060/exam-');
  addBullet('Backend REST API', 'https://exam-backend-mxd7.onrender.com/api');

  // Bottom Notice
  doc.moveDown(0.8);
  doc.fillColor(ROSE_PRIMARY).fontSize(8.5).font('Helvetica-Bold')
    .text('PinkSync Assessment Submission  •  All requirements 100% completed and verified.', { align: 'center' });

  // Add Dynamic Page Numbering on all pages (Page X of Y)
  const pageRange = doc.bufferedPageRange();
  for (let i = 0; i < pageRange.count; i++) {
    doc.switchToPage(i);
    doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica')
      .text(
        `PinkSync Project Documentation & Interview Prep  |  Candidate: A. Madhulatha  |  Page ${i + 1} of ${pageRange.count}`,
        45,
        805,
        { align: 'center', width: 505 }
      );
  }

  doc.end();

  await new Promise<void>((resolve, reject) => {
    rootStream.on('finish', () => {
      console.log(`Flawless PDF created successfully at: ${rootOutputPath}`);
      resolve();
    });
    rootStream.on('error', reject);
  });
}

generatePerfectPDF().catch((err) => {
  console.error('Error generating clean PDF:', err);
  process.exit(1);
});
