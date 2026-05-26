import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";
import { encryptData } from "../lib/crypto";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create Super Admin User
  const passwordHash = await bcrypt.hash("superadmin", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@gmail.com" },
    update: {},
    create: {
      email: "superadmin@gmail.com",
      name: "Super Admin",
      passwordHash,
      isSuperAdmin: true,
    },
  });
  console.log("✅ Super admin created:", superAdmin.email);

  // Create Demo Firm
  const firm = await prisma.firm.upsert({
    where: { slug: "sagan-financial-group" },
    update: {},
    create: {
      name: "Sagan Financial Group",
      slug: "sagan-financial-group",
      primaryColor: "#4F46E5",
      senderName: "Sagan Financial Group",
      senderEmail: "noreply@saganfg.com",
      plan: "enterprise",
    },
  });
  console.log("✅ Firm created:", firm.name);

  // Link super admin to firm as owner
  await prisma.firmUser.upsert({
    where: {
      firmId_userId: { firmId: firm.id, userId: superAdmin.id },
    },
    update: {},
    create: {
      firmId: firm.id,
      userId: superAdmin.id,
      role: "OWNER",
    },
  });
  console.log("✅ Super admin linked to firm as OWNER");

  // Create demo clients
  const client1 = await prisma.client.create({
    data: {
      firmId: firm.id,
      type: "INDIVIDUAL",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "555-0101",
      ssn: encryptData("***-**-1234"),
    },
  });

  const client2 = await prisma.client.create({
    data: {
      firmId: firm.id,
      type: "INDIVIDUAL",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      phone: "555-0102",
    },
  });

  const client3 = await prisma.client.create({
    data: {
      firmId: firm.id,
      type: "ENTITY",
      entityName: "Tech Ventures LLC",
      email: "accounting@techventures.com",
      phone: "555-0103",
      ein: encryptData("**-***5678"),
    },
  });

  const client4 = await prisma.client.create({
    data: {
      firmId: firm.id,
      type: "INDIVIDUAL",
      firstName: "Michael",
      lastName: "Davis",
      email: "michael.davis@example.com",
      phone: "555-0104",
    },
  });

  console.log("✅ 4 demo clients created");

  // Create demo projects
  const now = new Date();

  const project1 = await prisma.project.create({
    data: {
      firmId: firm.id,
      clientId: client1.id,
      year: 2024,
      returnType: "F1040",
      stage: "INTAKE",
      status: "ACTIVE",
      assigneeId: superAdmin.id,
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      firmId: firm.id,
      clientId: client2.id,
      year: 2024,
      returnType: "F1040",
      stage: "WORKPAPER",
      status: "ACTIVE",
      assigneeId: superAdmin.id,
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const project3 = await prisma.project.create({
    data: {
      firmId: firm.id,
      clientId: client3.id,
      year: 2024,
      returnType: "F1065",
      stage: "PREP",
      status: "ACTIVE",
      assigneeId: superAdmin.id,
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  const project4 = await prisma.project.create({
    data: {
      firmId: firm.id,
      clientId: client4.id,
      year: 2024,
      returnType: "F1040",
      stage: "DELIVERY",
      status: "ACTIVE",
      assigneeId: superAdmin.id,
      dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  const project5 = await prisma.project.create({
    data: {
      firmId: firm.id,
      clientId: client1.id,
      year: 2024,
      returnType: "F1040",
      stage: "INTAKE",
      status: "OVERDUE",
      assigneeId: superAdmin.id,
      dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ 5 demo projects created");

  // Create checklist items for project1
  const checklistItems = [
    { description: "W-2 from Employer", formType: "W2", status: "MISSING" },
    { description: "1099-INT from Bank", formType: "1099-INT", status: "RECEIVED" },
    { description: "1099-DIV from Broker", formType: "1099-DIV", status: "MISSING" },
    { description: "Mortgage Statement (1098)", formType: "1098", status: "NOT_APPLICABLE" },
    { description: "Prior Year Return", formType: "PRIOR_YEAR", status: "RECEIVED" },
  ];

  for (let i = 0; i < checklistItems.length; i++) {
    await prisma.checklistItem.create({
      data: {
        projectId: project1.id,
        firmId: firm.id,
        ...checklistItems[i],
        sortOrder: i,
      },
    });
  }

  console.log("✅ Checklist items created for project 1");

  // Create magic links
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await prisma.magicLink.upsert({
    where: { token: "demo-magic-token-john-smith-2024" },
    update: { expiresAt: futureDate },
    create: {
      projectId: project1.id,
      firmId: firm.id,
      clientEmail: client1.email,
      token: "demo-magic-token-john-smith-2024",
      expiresAt: futureDate,
    },
  });

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        projectId: project1.id,
        firmId: firm.id,
        title: "Send engagement letter",
        status: "PENDING",
        stage: "INTAKE",
        assigneeId: superAdmin.id,
      },
      {
        projectId: project1.id,
        firmId: firm.id,
        title: "Request missing W-2",
        status: "IN_PROGRESS",
        stage: "INTAKE",
        assigneeId: superAdmin.id,
      },
      {
        projectId: project2.id,
        firmId: firm.id,
        title: "Review workpaper pack",
        status: "PENDING",
        stage: "WORKPAPER",
        assigneeId: superAdmin.id,
      },
      {
        projectId: project3.id,
        firmId: firm.id,
        title: "Prepare Form 1065",
        status: "IN_PROGRESS",
        stage: "PREP",
        assigneeId: superAdmin.id,
      },
      {
        projectId: project4.id,
        firmId: firm.id,
        title: "Collect e-signature on 8879",
        status: "PENDING",
        stage: "DELIVERY",
        assigneeId: superAdmin.id,
      },
    ],
  });

  console.log("✅ Tasks created");

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        firmId: firm.id,
        userId: superAdmin.id,
        type: "upload",
        title: "New document uploaded",
        body: "John Smith uploaded W-2 for 2024",
        projectId: project1.id,
        isRead: false,
      },
      {
        firmId: firm.id,
        userId: superAdmin.id,
        type: "signature",
        title: "Engagement letter signed",
        body: "Sarah Johnson signed the engagement letter",
        projectId: project2.id,
        isRead: false,
      },
      {
        firmId: firm.id,
        userId: superAdmin.id,
        type: "invoice",
        title: "Invoice paid",
        body: "Tech Ventures LLC paid invoice #INV-001",
        projectId: project3.id,
        isRead: true,
      },
      {
        firmId: firm.id,
        userId: superAdmin.id,
        type: "task",
        title: "Task overdue",
        body: "Review workpaper pack is overdue",
        projectId: project2.id,
        isRead: false,
      },
    ],
  });

  console.log("✅ Notifications created");

  // Create audit logs
  await prisma.auditLog.create({
    data: {
      firmId: firm.id,
      userId: superAdmin.id,
      userEmail: superAdmin.email,
      action: "firm.created",
      resource: "firm",
      resourceId: firm.id,
      metadata: JSON.stringify({ name: firm.name }),
    },
  });

  console.log("✅ Audit log created");

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────");
  console.log("  Login: superadmin@gmail.com");
  console.log("  Password: superadmin");
  console.log("─────────────────────────────────");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
