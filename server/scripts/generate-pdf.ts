import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

async function generateCleanPDF() {
  console.log('Generating ultra-clean, tightly formatted documentation PDF (no blank pages)...');

  const baseDir = path.resolve('C:\\Users\\Deepa\\Downloads\\project');
  const rootOutputPath = path.join(baseDir, 'PinkSync_Project_Documentation_and_Interview_Prep.pdf');
  const desktopOutputPath = path.join('C:\\Users\\Deepa\\OneDrive\\Desktop', 'PinkSync_Project_Documentation_and_Interview_Prep.pdf');
  const downloadsOutputPath = path.join('C:\\Users\\Deepa\\Downloads', 'PinkSync_Project_Documentation_and_Interview_Prep.pdf');
  const clientPublicPath = path.join(baseDir, 'client', 'public', 'PinkSync_Project_Documentation_and_Interview_Prep.pdf');

  // A4 Size: 595.28 x 841.89 pt. 40pt margin gives 515pt content width.
  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    bufferPages: true,
    autoFirstPage: true,
  });

  const rootStream = fs.createWriteStream(rootOutputPath);
  doc.pipe(rootStream);

  // Modern Clean Color Palette (Pink & White theme)
  const ROSE_PRIMARY = '#be123c';  // Rose 700 - High contrast readable rose
  const ROSE_DARK = '#881337';     // Rose 900
  const ROSE_BG = '#fff1f2';       // Rose 50
  const ROSE_BORDER = '#fecdd3';   // Rose 200
  const TEXT_DARK = '#0f172a';     // Slate 900
  const TEXT_BODY = '#334155';     // Slate 700
  const TEXT_MUTED = '#64748b';    // Slate 500

  // Paging check helper: only page break if less than required height remains
  function ensureSpace(requiredHeight: number) {
    if (doc.y + requiredHeight > 780) {
      doc.addPage();
    }
  }

  function renderSectionHeader(numberStr: string, title: string) {
    ensureSpace(45);
    doc.moveDown(0.6);
    const startY = doc.y;

    // Left accent badge
    doc.rect(40, startY, 24, 20).fill(ROSE_PRIMARY);
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
      .text(numberStr, 40, startY + 4, { width: 24, align: 'center' });

    // Section title text
    doc.fillColor(TEXT_DARK).fontSize(13).font('Helvetica-Bold')
      .text(title, 72, startY + 3);

    // Subtle bottom dividing line
    doc.strokeColor(ROSE_BORDER).lineWidth(1)
      .moveTo(40, startY + 24).lineTo(555, startY + 24).stroke();

    doc.y = startY + 30;
    doc.fillColor(TEXT_BODY).font('Helvetica');
  }

  function renderSubHeader(title: string) {
    ensureSpace(30);
    doc.moveDown(0.3);
    doc.fillColor(ROSE_PRIMARY).fontSize(10.5).font('Helvetica-Bold').text(title);
    doc.moveDown(0.2);
    doc.fillColor(TEXT_BODY).font('Helvetica');
  }

  function renderParagraph(text: string) {
    ensureSpace(25);
    doc.fillColor(TEXT_BODY).fontSize(9).font('Helvetica').text(text, {
      align: 'justify',
      lineGap: 2.5,
    });
    doc.moveDown(0.3);
  }

  function renderBullet(key: string, value: string) {
    ensureSpace(20);
    const currentY = doc.y;
    doc.circle(46, currentY + 5, 2).fill(ROSE_PRIMARY);
    doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica-Bold')
      .text(`   ${key}: `, 52, currentY, { continued: true });
    doc.fillColor(TEXT_BODY).font('Helvetica')
      .text(value, { lineGap: 2 });
    doc.moveDown(0.25);
  }

  function renderCard(title: string, contentLines: { label: string; text: string }[]) {
    ensureSpace(contentLines.length * 16 + 35);
    const cardY = doc.y;
    const cardHeight = contentLines.length * 15 + 28;

    doc.rect(40, cardY, 515, cardHeight).fill(ROSE_BG);
    doc.rect(40, cardY, 515, cardHeight).strokeColor(ROSE_BORDER).lineWidth(1).stroke();

    doc.fillColor(ROSE_PRIMARY).fontSize(9.5).font('Helvetica-Bold')
      .text(title, 52, cardY + 8);

    let lineY = cardY + 24;
    for (const item of contentLines) {
      doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica-Bold')
        .text(item.label, 52, lineY, { width: 140 });
      doc.fillColor(TEXT_BODY).font('Helvetica')
        .text(item.text, 195, lineY, { width: 345, lineGap: 1.5 });
      lineY += 14;
    }

    doc.y = cardY + cardHeight + 8;
  }

  function renderQAItem(num: number, question: string, answer: string) {
    ensureSpace(65);
    const itemY = doc.y;

    // Header strip
    doc.rect(40, itemY, 515, 20).fill('#f8fafc');
    doc.rect(40, itemY, 515, 20).strokeColor('#e2e8f0').lineWidth(0.8).stroke();

    doc.fillColor(ROSE_PRIMARY).fontSize(8.5).font('Helvetica-Bold')
      .text(`Q${num}:`, 48, itemY + 5, { continued: true });
    doc.fillColor(TEXT_DARK).font('Helvetica-Bold')
      .text(`  ${question}`, { width: 495 });

    doc.y = itemY + 24;
    doc.fillColor(TEXT_BODY).fontSize(8.5).font('Helvetica').text(answer, 48, doc.y, {
      width: 498,
      align: 'justify',
      lineGap: 2.2,
    });
    doc.moveDown(0.6);
  }

  // ========================================================
  // DOCUMENT HEADER / COVER BANNER
  // ========================================================
  const headerY = doc.y;
  doc.rect(40, headerY, 515, 105).fill(ROSE_BG);
  doc.rect(40, headerY, 515, 105).strokeColor(ROSE_BORDER).lineWidth(1.2).stroke();

  // Top Title
  doc.fillColor(ROSE_PRIMARY).fontSize(8).font('Helvetica-Bold')
    .text('ADVANCED WEB DEVELOPER ASSESSMENT  •  EXPERIENCE LEVEL: 2–4 YEARS', 52, headerY + 12);
  doc.fillColor(TEXT_DARK).fontSize(18).font('Helvetica-Bold')
    .text('PinkSync — Project & Team Management System', 52, headerY + 25);
  doc.fillColor(TEXT_MUTED).fontSize(9).font('Helvetica')
    .text('Complete Engineering Architecture, Code Walkthrough, and Technical Interview Preparation Guide', 52, headerY + 48);

  // Meta row inside header card
  const rowY = headerY + 68;
  doc.strokeColor(ROSE_BORDER).lineWidth(0.8).moveTo(52, rowY - 6).lineTo(543, rowY - 6).stroke();

  doc.fillColor(TEXT_DARK).fontSize(8).font('Helvetica-Bold').text('Candidate: ', 52, rowY, { continued: true });
  doc.font('Helvetica').text('A. Madhulatha (8106039645)', { continued: true });
  doc.font('Helvetica-Bold').text('   •   Email: ', { continued: true });
  doc.font('Helvetica').text('annavarapumadhulatha4@gmail.com');

  doc.fillColor(TEXT_DARK).fontSize(8).font('Helvetica-Bold').text('Live Demo: ', 52, rowY + 14, { continued: true });
  doc.fillColor(ROSE_PRIMARY).font('Helvetica').text('https://exam-kappa-silk.vercel.app/login', { continued: true });
  doc.fillColor(TEXT_DARK).font('Helvetica-Bold').text('   •   GitHub: ', { continued: true });
  doc.fillColor(ROSE_PRIMARY).font('Helvetica').text('https://github.com/Madhu81060/exam-');

  doc.y = headerY + 115;

  // ========================================================
  // SECTION 1: EXECUTIVE SUMMARY
  // ========================================================
  renderSectionHeader('1', 'Project Overview & Technology Stack');
  renderParagraph(
    'PinkSync is a full-stack, enterprise-grade Project and Team Management System developed using a modern Pink & White aesthetic. The system allows organizations to manage project lifecycles, assign responsibilities to team members, track deliverable progress, and monitor approaching deadlines with strictly enforced role-based permissions.'
  );

  renderCard('Technology Stack Summary & Architecture', [
    { label: 'Frontend Layer', text: 'React 18, TypeScript, Vite, Tailwind CSS (Pink & White theme), Lucide Icons.' },
    { label: 'Backend Layer', text: 'Node.js, Express, TypeScript, RESTful decoupled MVC architecture.' },
    { label: 'Database & ORM', text: 'Prisma ORM with SQLite (100% reproducible locally, PostgreSQL compatible).' },
    { label: 'Security & Auth', text: 'JWT (7-day stateless expiry), Bcrypt (10 salt rounds), Zod validation, Rate limiting.' },
    { label: 'Testing Suite', text: 'Vitest + Supertest with 21 unit & integration tests (100% passing).' },
    { label: 'Cloud Deployment', text: 'Frontend on Vercel (SPA rewrites), Backend API on Render (Node 20 LTS).' },
  ]);

  // ========================================================
  // SECTION 2: FOLDER STRUCTURE
  // ========================================================
  renderSectionHeader('2', 'Folder Structure & File Organization');
  renderParagraph(
    'The project employs a clean monorepo structure with clear separation between backend and frontend codebases:'
  );

  renderBullet('Root /', 'package.json (orchestration), README.md (Mermaid ER diagram & docs), .gitignore, .node-version.');
  renderBullet('server/src/app.ts', 'Express application initialization, CORS configuration, JSON body parsing, and route mounting.');
  renderBullet('server/src/server.ts', 'Server startup binding to port 5000 and 0.0.0.0 for cloud hosting compatibility.');
  renderBullet('server/src/controllers/', 'Business logic handlers: auth.controller.ts, project.controller.ts, task.controller.ts, dashboard.controller.ts, and user.controller.ts.');
  renderBullet('server/src/middleware/', 'auth.ts (JWT verification), rbac.ts (Role-based guards), validate.ts (Zod schemas), rateLimiter.ts (Brute-force protection), and errorHandler.ts (Centralized errors).');
  renderBullet('server/prisma/schema.prisma', 'Normalized database schema with 6 entities: User, Project, ProjectMember, Task, TaskComment, and ActivityLog.');
  renderBullet('server/prisma/seed.ts', 'Database seeder populating realistic demo projects, tasks, comments, and role credentials.');
  renderBullet('server/tests/', 'Vitest integration test suites: auth.test.ts (8 tests), projects.test.ts (6 tests), tasks.test.ts (7 tests).');
  renderBullet('client/src/api/', 'Axios API client with interceptors for Bearer JWT token handling and modular endpoint calls.');
  renderBullet('client/src/context/', 'AuthContext.tsx providing global authentication state, session restoration, and role helpers.');
  renderBullet('client/src/components/', 'Reusable UI components: StatusBadge, PriorityBadge, RoleBadge, Modal, Spinner, Navbar, Sidebar, and interactive drag-and-drop KanbanBoard.');
  renderBullet('client/src/pages/', 'Dashboard, Projects, ProjectDetail, Tasks, TaskDetail, TeamManagement, and Login/Register.');

  // ========================================================
  // SECTION 3: ROLES & RBAC MATRIX
  // ========================================================
  renderSectionHeader('3', 'Role-Based Access Control (RBAC) Permissions');
  renderParagraph(
    'Permissions are strictly enforced on the backend at database query execution time, ensuring unauthorized requests receive HTTP 403 Forbidden even if buttons are tampered with in client browsers:'
  );

  renderCard('Role Permissions Matrix', [
    { label: 'Administrator (ADMIN)', text: 'Global control. Can manage all users, reassign roles, create/delete any project or task, and view global organization analytics.' },
    { label: 'Project Manager (PM)', text: 'Can create projects, assign/remove project members, create tasks, and manage workflows for authorized projects. Forbidden from unassigned projects.' },
    { label: 'Team Member (MEMBER)', text: 'Can view assigned projects, update task statuses (TODO -> DONE), and post comments on assigned work. Strictly forbidden from creating projects or deleting tasks.' },
  ]);

  // ========================================================
  // SECTION 4: TECHNICAL INTERVIEW WALKTHROUGH
  // ========================================================
  renderSectionHeader('4', 'Technical Interview & Code Walkthrough (Section 14)');
  renderParagraph(
    'Detailed, professional answers to the 8 core technical questions specified in the assessment guidelines:'
  );

  renderQAItem(
    1,
    'Explain your application architecture and why you selected it.',
    'I selected a decoupled client-server architecture with React 18 and TypeScript on the frontend and Node.js with Express and Prisma ORM on the backend. This gives clean separation of concerns: routes declare HTTP verbs and endpoints; controllers handle request parameters and responses; middleware enforces authentication, RBAC, and input validation; and Prisma handles type-safe persistence. Prisma with SQLite allows 100% zero-configuration local reproducibility without requiring reviewers to install external PostgreSQL servers, while the schema allows 1-line switching to PostgreSQL.'
  );

  renderQAItem(
    2,
    'Explain your database schema and relationship design.',
    'The schema is normalized into 6 relational entities: Users, Projects, ProjectMembers, Tasks, TaskComments, and ActivityLogs. Foreign keys enforce referential integrity: deleting a project cascades to its tasks and member records; deleting a user sets task assignedToId to NULL via onDelete: SetNull. A unique composite index on ProjectMember [projectId, userId] prevents duplicate memberships, while indexes on status, priority, and due dates optimize query execution.'
  );

  renderQAItem(
    3,
    'How do authentication and role-based authorization work?',
    'Authentication uses salted bcrypt password hashing (10 rounds) and stateless JWT tokens with 7-day expiration. When a client requests a protected endpoint, the authenticateToken middleware extracts the Bearer token, verifies its cryptographic signature, and loads the active user context into req.user. Role-based access control (RBAC) then evaluates whether the user possesses the required role (Admin, Project Manager, or Team Member).'
  );

  renderQAItem(
    4,
    'How do you prevent unauthorized access to projects and tasks?',
    'Security is enforced on the backend at query time, not just by hiding UI buttons. Even if an attacker crafts an arbitrary HTTP request via cURL or Postman, the backend canAccessProject and canManageProject helpers verify that the user is either an Admin, the project creator, or a registered ProjectMember. Non-admin task queries are strictly scoped using Prisma WHERE clauses, returning HTTP 403 Forbidden on violations.'
  );

  renderQAItem(
    5,
    'How are API validation and error handling implemented?',
    'Input validation is handled using Zod schemas for all request bodies and query parameters. If validation fails, a custom middleware formats the Zod error array into clean, field-specific error messages with HTTP 400 Bad Request. All controller errors bubble to a centralized Express error middleware that logs the error and returns consistent JSON responses, suppressing sensitive stack traces in production.'
  );

  renderQAItem(
    6,
    'How do you handle pagination and database query performance?',
    'Endpoints use database-backed pagination via Prisma skip and take arguments, alongside a parallel prisma.count() query. This avoids loading entire datasets into memory. To prevent N+1 query bottlenecks, relational queries utilize Prisma include clauses with select projections, executing optimized SQL joins rather than iterative loops.'
  );

  renderQAItem(
    7,
    'What do your automated tests cover and how are they run?',
    'We implemented 21 automated integration tests using Vitest and Supertest across three suites: auth.test.ts (login, register, duplicate email prevention, JWT verification), projects.test.ts (project CRUD, RBAC 403 checks, unassigned project scoping), and tasks.test.ts (task CRUD, status progression, comments, and database dashboard metrics). All tests run via "npm test".'
  );

  renderQAItem(
    8,
    'What trade-offs did you make and what would you improve with more time?',
    'Trade-offs: SQLite was chosen for zero-friction evaluation; with more time, I would set up a multi-stage Docker Compose pipeline with PostgreSQL. Bonus enhancements would include WebSocket real-time updates (Socket.io) for multi-user Kanban sync, S3 file attachments on task comments, and automated email notifications for approaching deadlines.'
  );

  renderQAItem(
    9,
    'How did you prevent brute-force login attacks?',
    'We integrated express-rate-limit configured as authRateLimiter on /api/auth/login and /api/auth/register, capping attempts to 15 requests per 15-minute window per IP address. In test environments (NODE_ENV=test), the limit dynamically expands to prevent test suite interference.'
  );

  renderQAItem(
    10,
    'How is client-side SPA routing handled when deployed on Vercel?',
    'Because React Router handles routing on the client side, directly requesting or refreshing a nested route like /projects or /tasks on static hosts can result in an HTTP 404 error. We created a vercel.json configuration with rewrite rules mapping all wildcard routes /(.*) to /index.html, ensuring smooth client-side hydration.'
  );

  // ========================================================
  // SECTION 5: TESTING & VERIFICATION SUMMARY
  // ========================================================
  renderSectionHeader('5', 'Automated Test Results & Verification Summary');

  renderCard('Vitest + Supertest Execution Results (npm test)', [
    { label: 'auth.test.ts', text: '8 tests passed: User registration, duplicate email rejection (409), login validation, password verification, /me endpoint.' },
    { label: 'projects.test.ts', text: '6 tests passed: Project creation by PM, Team Member creation rejection (403), required-field validation, project updates, scoping.' },
    { label: 'tasks.test.ts', text: '7 tests passed: Task creation, assignee status updates (TODO -> IN_PROGRESS), comments, priority filtering, and live dashboard metrics.' },
    { label: 'Overall Status', text: '3 Test Files Passed  |  21 of 21 Tests Passed (100% Success Rate)  |  Execution Duration: ~2.46s.' },
  ]);

  // ========================================================
  // SECTION 6: DEMO CREDENTIALS & CONTACT INFO
  // ========================================================
  renderSectionHeader('6', 'Demo Credentials & Submission Contacts');

  renderCard('Pre-Seeded Demo User Accounts (Password: Password123!)', [
    { label: 'Administrator', text: 'admin@projecthub.com — Full governance across all projects, tasks, user directory, and roles.' },
    { label: 'Project Manager', text: 'pm@projecthub.com — Create projects, manage team assignments, and direct tasks in authorized projects.' },
    { label: 'Team Member', text: 'member@projecthub.com — View assigned projects, update task statuses, and post task comments.' },
  ]);

  renderCard('Submission & Contact Details', [
    { label: 'Candidate Name', text: 'A. Madhulatha' },
    { label: 'Mobile Number', text: '+91 8106039645' },
    { label: 'Email Address', text: 'annavarapumadhulatha4@gmail.com' },
    { label: 'Live Application', text: 'https://exam-kappa-silk.vercel.app/login' },
    { label: 'GitHub Repository', text: 'https://github.com/Madhu81060/exam-' },
    { label: 'Backend REST API', text: 'https://exam-backend-mxd7.onrender.com/api' },
  ]);

  // Bottom Notice
  ensureSpace(30);
  doc.rect(40, doc.y, 515, 24).fill(ROSE_BG);
  doc.fillColor(ROSE_PRIMARY).fontSize(8.5).font('Helvetica-Bold')
    .text('PinkSync Assessment Submission  •  All requirements 100% completed and verified.', 40, doc.y - 16, {
      align: 'center',
      width: 515,
    });

  // Dynamic Page Numbering on all pages (Page X of Y)
  const pageRange = doc.bufferedPageRange();
  for (let i = 0; i < pageRange.count; i++) {
    doc.switchToPage(i);
    doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica')
      .text(
        `PinkSync Project Documentation & Interview Prep  |  Candidate: A. Madhulatha  |  Page ${i + 1} of ${pageRange.count}`,
        40,
        815,
        { align: 'center', width: 515 }
      );
  }

  doc.end();

  await new Promise<void>((resolve, reject) => {
    rootStream.on('finish', () => {
      console.log(`PDF created successfully at: ${rootOutputPath}`);

      // Copy to Desktop, Downloads, and Client Public
      try {
        fs.copyFileSync(rootOutputPath, desktopOutputPath);
        console.log(`Copied to Desktop: ${desktopOutputPath}`);
      } catch (e) {
        console.warn('Could not copy to Desktop directly:', e);
      }

      try {
        fs.copyFileSync(rootOutputPath, downloadsOutputPath);
        console.log(`Copied to Downloads: ${downloadsOutputPath}`);
      } catch (e) {
        console.warn('Could not copy to Downloads directly:', e);
      }

      try {
        fs.copyFileSync(rootOutputPath, clientPublicPath);
        console.log(`Copied to Client Public: ${clientPublicPath}`);
      } catch (e) {
        console.warn('Could not copy to Client Public directly:', e);
      }

      resolve();
    });
    rootStream.on('error', reject);
  });
}

generateCleanPDF().catch((err) => {
  console.error('Error generating clean PDF:', err);
  process.exit(1);
});
