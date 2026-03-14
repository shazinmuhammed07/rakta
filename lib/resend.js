import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Rakta <onboarding@resend.dev>';

// Gmail SMTP configuration
const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

/**
 * Sends an email notification to a donor about a nearby blood request.
 */
export async function sendDonorNotificationEmail({ donorEmail, donorName, bloodGroup, patientName, unitsRequired, hospitalName, locationName, urgencyLevel, requesterPhone }) {
    const isEmergency = urgencyLevel === 'Emergency';
    const urgencyColor = isEmergency ? '#dc2626' : urgencyLevel === 'Urgent' ? '#d97706' : '#16a34a';
    const urgencyBg = isEmergency ? '#fef2f2' : urgencyLevel === 'Urgent' ? '#fffbeb' : '#f0fdf4';

    // Use Gmail if configured, otherwise Resend
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        try {
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: donorEmail,
                subject: isEmergency
                    ? `🚨 EMERGENCY: ${bloodGroup} blood needed urgently near you!`
                    : `🩸 Blood Request Near You — ${bloodGroup} needed at ${hospitalName}`,
                html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Blood Request Alert</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:36px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <span style="font-size:28px;">🩸</span>
                <span style="color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Rakta</span>
              </div>
              <p style="color:#fca5a5;margin:8px 0 0;font-size:14px;font-weight:500;">Connecting Blood Donors with Patients</p>
            </td>
          </tr>

          <!-- Urgency Badge -->
          <tr>
            <td style="padding:28px 40px 0;text-align:center;">
              <span style="display:inline-block;background:${urgencyBg};color:${urgencyColor};border:1.5px solid ${urgencyColor};border-radius:999px;padding:6px 20px;font-size:13px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">
                ${isEmergency ? '🚨 Emergency' : urgencyLevel === 'Urgent' ? '⚠️ Urgent' : '✅ Normal'} Request
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 40px;">
              <h1 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 8px;">Hello${donorName ? `, ${donorName.split(' ')[0]}` : ''}!</h1>
              <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Someone nearby needs <strong>${bloodGroup}</strong> blood and you match! You're within <strong>10 km</strong> of the request. Your donation could save a life.
              </p>

              <!-- Info Card -->
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Request Details</td></tr>
                  <tr><td style="padding:4px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#6b7280;font-size:14px;">Patient: </span>
                    <strong style="color:#111827;font-size:14px;">${patientName}</strong>
                  </td></tr>
                  <tr><td style="padding:4px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#6b7280;font-size:14px;">Blood Group: </span>
                    <strong style="color:#dc2626;font-size:14px;">${bloodGroup}</strong>
                  </td></tr>
                  <tr><td style="padding:4px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#6b7280;font-size:14px;">Units Needed: </span>
                    <strong style="color:#111827;font-size:14px;">${unitsRequired} unit${unitsRequired > 1 ? 's' : ''}</strong>
                  </td></tr>
                  <tr><td style="padding:4px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#6b7280;font-size:14px;">Hospital: </span>
                    <strong style="color:#111827;font-size:14px;">${hospitalName}</strong>
                  </td></tr>
                  ${locationName ? `<tr><td style="padding:4px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#6b7280;font-size:14px;">Location: </span>
                    <strong style="color:#111827;font-size:14px;">${locationName}</strong>
                  </td></tr>` : ''}
                  ${requesterPhone ? `<tr><td style="padding:4px 0;">
                    <span style="color:#6b7280;font-size:14px;">Contact: </span>
                    <strong style="color:#111827;font-size:14px;">${requesterPhone}</strong>
                  </td></tr>` : ''}
                </table>
              </div>

              <p style="color:#6b7280;font-size:13px;text-align:center;margin:24px 0 0;">
                If you can help, please contact the requester directly using the phone number above.<br/>
                You received this because you are a registered donor on Rakta with a matching blood type within range.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 40px;text-align:center;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">© 2025 Rakta · Connecting Blood Donors with Patients</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
                `,
            };

            await gmailTransporter.sendMail(mailOptions);
            return true;
        } catch (err) {
            console.error(`Failed to send Gmail email to ${donorEmail}:`, err);
            return false;
        }
    } else {
        // Fallback to Resend
        try {
            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: [donorEmail],
                subject: isEmergency
                    ? `🚨 EMERGENCY: ${bloodGroup} blood needed urgently near you!`
                    : `🩸 Blood Request Near You — ${bloodGroup} needed at ${hospitalName}`,
                html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Blood Request Alert</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:36px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <span style="font-size:28px;">🩸</span>
                <span style="color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Rakta</span>
              </div>
              <p style="color:#fca5a5;margin:8px 0 0;font-size:14px;font-weight:500;">Connecting Blood Donors with Patients</p>
            </td>
          </tr>

          <!-- Urgency Badge -->
          <tr>
            <td style="padding:28px 40px 0;text-align:center;">
              <span style="display:inline-block;background:${urgencyBg};color:${urgencyColor};border:1.5px solid ${urgencyColor};border-radius:999px;padding:6px 20px;font-size:13px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">
                ${isEmergency ? '🚨 Emergency' : urgencyLevel === 'Urgent' ? '⚠️ Urgent' : '✅ Normal'} Request
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 40px;">
              <h1 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 8px;">Hello${donorName ? `, ${donorName.split(' ')[0]}` : ''}!</h1>
              <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Someone nearby needs <strong>${bloodGroup}</strong> blood and you match! You're within <strong>10 km</strong> of the request. Your donation could save a life.
              </p>

              <!-- Info Card -->
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Request Details</td></tr>
                  <tr><td style="padding:4px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#6b7280;font-size:14px;">Patient: </span>
                    <strong style="color:#111827;font-size:14px;">${patientName}</strong>
                  </td></tr>
                  <tr><td style="padding:4px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#6b7280;font-size:14px;">Blood Group: </span>
                    <strong style="color:#dc2626;font-size:14px;">${bloodGroup}</strong>
                  </td></tr>
                  <tr><td style="padding:4px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#6b7280;font-size:14px;">Units Needed: </span>
                    <strong style="color:#111827;font-size:14px;">${unitsRequired} unit${unitsRequired > 1 ? 's' : ''}</strong>
                  </td></tr>
                  <tr><td style="padding:4px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#6b7280;font-size:14px;">Hospital: </span>
                    <strong style="color:#111827;font-size:14px;">${hospitalName}</strong>
                  </td></tr>
                  ${locationName ? `<tr><td style="padding:4px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#6b7280;font-size:14px;">Location: </span>
                    <strong style="color:#111827;font-size:14px;">${locationName}</strong>
                  </td></tr>` : ''}
                  ${requesterPhone ? `<tr><td style="padding:4px 0;">
                    <span style="color:#6b7280;font-size:14px;">Contact: </span>
                    <strong style="color:#111827;font-size:14px;">${requesterPhone}</strong>
                  </td></tr>` : ''}
                </table>
              </div>

              <p style="color:#6b7280;font-size:13px;text-align:center;margin:24px 0 0;">
                If you can help, please contact the requester directly using the phone number above.<br/>
                You received this because you are a registered donor on Rakta with a matching blood type within range.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 40px;text-align:center;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">© 2025 Rakta · Connecting Blood Donors with Patients</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
                `,
            });

            if (error) {
                console.error(`Resend error for ${donorEmail}:`, error);
                return false;
            }
            return true;
        } catch (err) {
            console.error(`Failed to send Resend email to ${donorEmail}:`, err);
            return false;
        }
    }
}
