import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email sent to admin when new lead is created
export async function sendNewLeadEmail(lead: {
  name: string;
  phone: string;
  email?: string;
  propertyInterest: string;
  budget: number;
  source: string;
  priority: string;
}) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const priorityColor =
    lead.priority === "high"   ? "#dc2626" :
    lead.priority === "medium" ? "#d97706" : "#059669";

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to:   process.env.EMAIL_USER,
    subject: `🏠 New Lead: ${lead.name} — ${lead.priority.toUpperCase()} Priority`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:24px;">
        <h2 style="margin:0 0 16px;font-size:20px;color:#111;">New Lead Received</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:10px 0;color:#6b7280;width:140px;">Name</td>
            <td style="padding:10px 0;font-weight:600;">${lead.name}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:10px 0;color:#6b7280;">Phone</td>
            <td style="padding:10px 0;">${lead.phone}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:10px 0;color:#6b7280;">Email</td>
            <td style="padding:10px 0;">${lead.email || "—"}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:10px 0;color:#6b7280;">Property</td>
            <td style="padding:10px 0;">${lead.propertyInterest}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:10px 0;color:#6b7280;">Budget</td>
            <td style="padding:10px 0;">PKR ${lead.budget.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:10px 0;color:#6b7280;">Source</td>
            <td style="padding:10px 0;text-transform:capitalize;">${lead.source}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;">Priority</td>
            <td style="padding:10px 0;">
              <span style="background:${priorityColor}20;color:${priorityColor};
                padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;">
                ${lead.priority.toUpperCase()}
              </span>
            </td>
          </tr>
        </table>
        <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
          Estate CRM · Auto-notification
        </p>
      </div>
    `,
  });
}

// Email sent to agent when lead is assigned
export async function sendAssignmentEmail(data: {
  agentName: string;
  agentEmail: string;
  leadName: string;
  leadPhone: string;
  propertyInterest: string;
}) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to:   data.agentEmail,
    subject: `📋 Lead Assigned to You: ${data.leadName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:24px;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#111;">Lead Assigned to You</h2>
        <p style="color:#6b7280;margin:0 0 20px;">
          Hi <strong style="color:#111;">${data.agentName}</strong>,
          a new lead has been assigned to you. Please follow up as soon as possible.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:10px 0;color:#6b7280;width:140px;">Client Name</td>
            <td style="padding:10px 0;font-weight:600;">${data.leadName}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:10px 0;color:#6b7280;">Phone</td>
            <td style="padding:10px 0;">${data.leadPhone}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;">Property</td>
            <td style="padding:10px 0;">${data.propertyInterest}</td>
          </tr>
        </table>
        <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
          Estate CRM · Auto-notification
        </p>
      </div>
    `,
  });
}