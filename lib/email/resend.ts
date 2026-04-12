import { Resend } from "resend";
import type { WorkerSnapshot, BusinessSnapshot } from "@/lib/types";

const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM = "Cuppa <noreply@cuppa.com.au>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cuppa.com.au";

// ─── Booking confirmation ──────────────────────────────────────────────────────

interface BookingConfirmationParams {
  workerEmail: string;
  businessEmail: string;
  workerName: string;
  businessName: string;
  shiftTitle: string;
  shiftDate: string; // e.g. "Saturday 13 Apr"
  shiftTime: string; // e.g. "7:00am – 2:00pm"
  shiftAddress: string;
  shiftSuburb: string;
  hourlyRate: number;
  estimatedHours: number;
  estimatedPay: number;
  shiftId: string;
  workerSnapshot: WorkerSnapshot;
  businessSnapshot: BusinessSnapshot;
}

function buildBookingEmail({
  workerName,
  businessName,
  shiftTitle,
  shiftDate,
  shiftTime,
  shiftAddress,
  shiftSuburb,
  hourlyRate,
  estimatedHours,
  estimatedPay,
  shiftId,
  workerSnapshot,
  businessSnapshot,
}: BookingConfirmationParams): string {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shiftAddress + " " + shiftSuburb)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed — Cuppa</title>
</head>
<body style="margin:0;padding:0;background:#fafaf8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;margin-top:24px;margin-bottom:24px;">

    <!-- Header -->
    <tr>
      <td style="background:#c5522a;padding:24px 32px;text-align:center;">
        <p style="margin:0;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">☕ Cuppa</p>
      </td>
    </tr>

    <!-- Announcement -->
    <tr>
      <td style="padding:32px 32px 24px;border-bottom:1px solid #e8e0d8;">
        <p style="margin:0;font-size:18px;font-weight:700;color:#1a1510;line-height:1.4;">
          <span style="color:#c5522a;">${workerName}</span> agreed to a barista job at
          <span style="color:#c5522a;">${businessName}</span> on ${shiftDate}.
        </p>
      </td>
    </tr>

    <!-- Shift details -->
    <tr>
      <td style="padding:24px 32px;border-bottom:1px solid #e8e0d8;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9c8878;text-transform:uppercase;letter-spacing:0.05em;">Shift details</p>
        <p style="margin:8px 0 2px;font-size:15px;font-weight:700;color:#1a1510;">${shiftTitle}</p>
        <p style="margin:2px 0;font-size:14px;color:#6b5a4e;">${shiftDate} · ${shiftTime}</p>
        <p style="margin:2px 0;font-size:14px;color:#6b5a4e;">$${hourlyRate}/hr · ${estimatedHours} hrs · Est. $${estimatedPay.toFixed(2)}</p>
        <p style="margin:8px 0 2px;font-size:14px;color:#6b5a4e;">
          📍 <a href="${mapsUrl}" style="color:#c5522a;text-decoration:none;">${shiftAddress}, ${shiftSuburb}</a>
        </p>
      </td>
    </tr>

    <!-- Best Practice Checklist -->
    <tr>
      <td style="padding:24px 32px;border-bottom:1px solid #e8e0d8;">
        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1a1510;">Best Practice Checklist:</p>
        <ul style="margin:0;padding-left:20px;color:#6b5a4e;font-size:14px;line-height:1.7;">
          <li>Set a reminder by making a calendar entry for the job</li>
          <li>Send the business a confirmation text or email</li>
          <li>Figure out your travel route to and from the job location. The job location can be found in the app</li>
          <li>Clarify the expectations of the job, if it's not already clear</li>
          <li>After the job, text or email the business your time worked to help them process your payment correctly</li>
        </ul>
      </td>
    </tr>

    <!-- Worker snapshot -->
    <tr>
      <td style="padding:24px 32px;border-bottom:1px solid #e8e0d8;">
        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#c5522a;">${workerSnapshot.name} Snapshot:</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="font-size:14px;color:#1a1510;padding:2px 0;"><strong>Number of jobs:</strong> ${workerSnapshot.totalJobs}</td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#1a1510;padding:2px 0;"><strong>Rating:</strong> ${workerSnapshot.rating.toFixed(2)}/ 5.00</td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#1a1510;padding:2px 0;"><strong>Completion rate:</strong> ${workerSnapshot.completionRate}%</td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#1a1510;padding:2px 0;">
              <a href="${APP_URL}/worker/profile" style="color:#c5522a;font-weight:700;text-decoration:none;">Karma</a>: ${workerSnapshot.karma}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Business snapshot -->
    <tr>
      <td style="padding:24px 32px;border-bottom:1px solid #e8e0d8;">
        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#c5522a;">${businessSnapshot.name} Snapshot:</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="font-size:14px;color:#1a1510;padding:2px 0;"><strong>Number of jobs:</strong> ${businessSnapshot.totalJobs}</td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#1a1510;padding:2px 0;"><strong>Rating:</strong> ${(businessSnapshot.rating ?? 5).toFixed(2)}/ 5.00</td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#1a1510;padding:2px 0;">
              <a href="${APP_URL}" style="color:#c5522a;font-weight:700;text-decoration:none;">Karma</a>: ${businessSnapshot.karma}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Work Cancellations -->
    <tr>
      <td style="padding:24px 32px;border-bottom:1px solid #e8e0d8;">
        <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#1a1510;">Work Cancellations:</p>
        <p style="margin:0 0 10px;font-size:14px;color:#6b5a4e;line-height:1.6;">
          Individuals or Businesses will sometimes need to cancel a job, so we encourage people to
          cancel with as much notice as possible. To cancel a job, notify the Business and action it
          in the app.
        </p>
        <p style="margin:0;font-size:14px;color:#6b5a4e;line-height:1.6;">
          Please be mindful that any cancellation will be reflected in the Completion Rate. Per Cuppa's
          <a href="${APP_URL}/community-guidelines" style="color:#c5522a;">Community Guidelines</a>,
          cancelling a job without a valid reason within 24 hours from the start time may result in a
          suspension from Cuppa. For this community to thrive, everyone must act in a considerate and
          organised manner.
        </p>
      </td>
    </tr>

    <!-- Payments -->
    <tr>
      <td style="padding:24px 32px;border-bottom:1px solid #e8e0d8;">
        <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#1a1510;">Payments:</p>
        <p style="margin:0;font-size:14px;color:#6b5a4e;line-height:1.6;">
          Payment should be made within 48h from completion of the work. If there's an issue with
          payment, the Individual should contact the Business. Any mistake should be resolved no later
          than 3 days after the issue is brought to the Business' attention. If there is a dispute over
          payment, please contact Cuppa on
          <a href="mailto:hello@cuppa.com.au" style="color:#c5522a;">hello@cuppa.com.au</a>.
        </p>
      </td>
    </tr>

    <!-- App download buttons -->
    <tr>
      <td style="padding:24px 32px;text-align:center;border-bottom:1px solid #e8e0d8;">
        <a href="https://apps.apple.com" style="display:inline-block;margin:8px auto;background:#000000;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:700;">
          🍎 Download on the App Store
        </a>
        <br />
        <a href="https://play.google.com" style="display:inline-block;margin:8px auto;background:#000000;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:700;">
          ▶ GET IT ON Google Play
        </a>
      </td>
    </tr>

    <!-- Social / footer -->
    <tr>
      <td style="background:#c5522a;padding:20px 32px;text-align:center;">
        <p style="margin:0;color:rgba(255,255,255,0.8);font-size:12px;">
          <a href="https://instagram.com" style="color:#ffffff;text-decoration:none;margin:0 8px;">Instagram</a>
          <a href="https://facebook.com" style="color:#ffffff;text-decoration:none;margin:0 8px;">Facebook</a>
          <a href="https://linkedin.com" style="color:#ffffff;text-decoration:none;margin:0 8px;">LinkedIn</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#9c8878;">
          No longer want to receive these emails?
          <a href="${APP_URL}/api/unsubscribe" style="color:#c5522a;">Unsubscribe</a>.
          Cuppa
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendBookingConfirmation(
  params: BookingConfirmationParams
): Promise<void> {
  const html = buildBookingEmail(params);

  // Send to worker
  await resend.emails.send({
    from: FROM,
    to: params.workerEmail,
    subject: `Booking confirmed: ${params.businessName} on ${params.shiftDate}`,
    html,
  });

  // Send to business
  await resend.emails.send({
    from: FROM,
    to: params.businessEmail,
    subject: `${params.workerName} confirmed for ${params.shiftDate}`,
    html,
  });
}

// ─── Vetting approved ─────────────────────────────────────────────────────────

export async function sendVettingApproved(
  workerEmail: string,
  workerName: string
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: workerEmail,
    subject: "You're approved on Cuppa! ☕",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fafaf8;border-radius:16px;">
        <p style="font-size:24px;font-weight:900;color:#c5522a;margin:0 0 24px;">☕ Cuppa</p>
        <h1 style="font-size:22px;font-weight:700;color:#1a1510;margin:0 0 12px;">
          You're approved, ${workerName.split(" ")[0]}!
        </h1>
        <p style="color:#6b5a4e;line-height:1.6;">
          Your barista profile has been reviewed and approved. You can now apply for any shift on Cuppa.
        </p>
        <a href="${APP_URL}/worker/shifts" style="display:inline-block;margin-top:20px;background:#c5522a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;">
          Browse shifts →
        </a>
      </div>
    `,
  });
}

// ─── New offer notification ────────────────────────────────────────────────────

export async function sendOfferNotification(
  workerEmail: string,
  workerName: string,
  businessName: string,
  shiftTitle: string,
  shiftDate: string,
  applicationId: string
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: workerEmail,
    subject: `You got an offer from ${businessName}!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fafaf8;border-radius:16px;">
        <p style="font-size:24px;font-weight:900;color:#c5522a;margin:0 0 24px;">☕ Cuppa</p>
        <h1 style="font-size:22px;font-weight:700;color:#1a1510;margin:0 0 12px;">
          You have a job offer! 🎉
        </h1>
        <p style="color:#6b5a4e;line-height:1.6;">
          <strong>${businessName}</strong> has offered you the <strong>${shiftTitle}</strong> shift on ${shiftDate}.
          Accept or decline in the app.
        </p>
        <a href="${APP_URL}/worker/dashboard" style="display:inline-block;margin-top:20px;background:#c5522a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;">
          View offer →
        </a>
      </div>
    `,
  });
}

// ─── New application notification to business ────────────────────────────────

export async function sendNewApplicationNotification(
  businessEmail: string,
  businessName: string,
  workerName: string,
  shiftTitle: string,
  shiftId: string
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: businessEmail,
    subject: `New application for ${shiftTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fafaf8;border-radius:16px;">
        <p style="font-size:24px;font-weight:900;color:#c5522a;margin:0 0 24px;">☕ Cuppa</p>
        <h1 style="font-size:22px;font-weight:700;color:#1a1510;margin:0 0 12px;">
          New applicant
        </h1>
        <p style="color:#6b5a4e;line-height:1.6;">
          <strong>${workerName}</strong> has applied for your <strong>${shiftTitle}</strong> shift.
          Review their profile and respond in the app.
        </p>
        <a href="${APP_URL}/business/shifts/${shiftId}/applications" style="display:inline-block;margin-top:20px;background:#c5522a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;">
          Review application →
        </a>
      </div>
    `,
  });
}
