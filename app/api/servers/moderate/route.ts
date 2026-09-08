import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { approveServer, rejectServer } from '@/lib/data';
import { deleteDiscordWebhookMessage } from '@/lib/discord-webhook';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';
  const action = searchParams.get('action') || '';
  const secret = searchParams.get('secret') || '';
  const msgParam = searchParams.get('msg') || searchParams.get('message_id') || '';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gtaservers.io';
  const expectedSecret = process.env.MODERATION_SECRET || 'gta_mod_sec_87e2b90ca14d59f3';

  // Security Check: Ensure moderation token matches secret
  if (!secret || secret !== expectedSecret) {
    return new NextResponse(renderHtmlPage({
      title: 'Access Denied',
      statusType: 'error',
      badge: 'UNAUTHORIZED',
      headline: 'Invalid Moderation Token',
      description: 'You do not have permission to execute this moderation action. Please use the authorized link provided in the staff Discord channel.',
      siteUrl
    }), {
      status: 403,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  if (!id) {
    return new NextResponse(renderHtmlPage({
      title: 'Missing Parameter',
      statusType: 'error',
      badge: 'ERROR',
      headline: 'Server ID or Slug Missing',
      description: 'The moderation request did not include a valid server identifier.',
      siteUrl
    }), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // Handle APPROVE Action
  if (action === 'approve') {
    const result = await approveServer(id);
    if (!result.success || !result.server) {
      return new NextResponse(renderHtmlPage({
        title: 'Approval Notice',
        statusType: 'warn',
        badge: 'ALREADY PROCESSED',
        headline: 'Server Not Found or Already Approved',
        description: result.error || 'The requested server could not be found or has already been reviewed.',
        siteUrl
      }), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const server = result.server;

    // Trigger immediate ISR cache revalidation
    try {
      revalidatePath('/');
      revalidatePath('/gta-5-servers');
      revalidatePath('/fivem-servers');
      revalidatePath(`/server/${server.slug}`);
    } catch {}

    // Auto-delete the message from Discord so only pending choices remain in channel
    const targetMsgId = msgParam || result.discordMessageId;
    if (targetMsgId) {
      deleteDiscordWebhookMessage(targetMsgId).catch(() => {});
    }

    return new NextResponse(renderHtmlPage({
      title: `Approved: ${server.name}`,
      statusType: 'success',
      badge: 'ACCEPTED & LIVE',
      headline: `"${server.name}" is Now Live!`,
      description: `You have successfully approved this server. It is now published in search results, category pages, and is accessible to all players worldwide. The Discord audit message has been cleared from your moderation queue.`,
      serverSlug: server.slug,
      serverName: server.name,
      siteUrl
    }), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // Handle REJECT Action
  if (action === 'reject') {
    const result = await rejectServer(id);
    if (!result.success || !result.server) {
      return new NextResponse(renderHtmlPage({
        title: 'Rejection Notice',
        statusType: 'warn',
        badge: 'ALREADY REMOVED',
        headline: 'Server Not Found or Already Removed',
        description: result.error || 'The requested server was already deleted or declined.',
        siteUrl
      }), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const server = result.server;

    // Trigger immediate ISR cache revalidation
    try {
      revalidatePath('/');
      revalidatePath('/gta-5-servers');
      revalidatePath('/fivem-servers');
      revalidatePath(`/server/${server.slug}`);
    } catch {}

    // Auto-delete the message from Discord so only pending choices remain in channel
    const targetMsgId = msgParam || result.discordMessageId;
    if (targetMsgId) {
      deleteDiscordWebhookMessage(targetMsgId).catch(() => {});
    }

    return new NextResponse(renderHtmlPage({
      title: `Declined: ${server.name}`,
      statusType: 'danger',
      badge: 'DECLINED & DELETED',
      headline: `"${server.name}" Has Been Declined`,
      description: `This server submission has been rejected. The listing has been permanently deleted from the database and the Discord audit message has been cleared from your moderation queue.`,
      serverName: server.name,
      siteUrl
    }), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  return new NextResponse(renderHtmlPage({
    title: 'Unknown Action',
    statusType: 'error',
    badge: 'INVALID ACTION',
    headline: 'Action Not Supported',
    description: `The action "${action}" is not recognized. Use "approve" or "reject".`,
    siteUrl
  }), {
    status: 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

/**
 * Modern HTML template rendered directly for staff clicking Discord links.
 */
function renderHtmlPage(options: {
  title: string;
  statusType: 'success' | 'danger' | 'warn' | 'error';
  badge: string;
  headline: string;
  description: string;
  serverSlug?: string;
  serverName?: string;
  siteUrl: string;
}): string {
  const colorMap = {
    success: { bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981', text: '#34d399', icon: '✅' },
    danger:  { bg: 'rgba(239, 68, 68, 0.12)', border: '#ef4444', text: '#f87171', icon: '❌' },
    warn:    { bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', text: '#fbbf24', icon: '⚠️' },
    error:   { bg: 'rgba(239, 68, 68, 0.12)', border: '#ef4444', text: '#f87171', icon: '⛔' }
  };

  const c = colorMap[options.statusType];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title} — GTA SERVERS Staff Sentinel</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #0b0c10;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #13151a;
      border: 1px solid #242834;
      border-radius: 14px;
      max-width: 540px;
      width: 100%;
      padding: 36px 32px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      background: ${c.bg};
      border: 1px solid ${c.border};
      color: ${c.text};
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      margin-bottom: 20px;
      text-transform: uppercase;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .btn-primary {
      display: block;
      background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 13.5px;
      padding: 12px 20px;
      border-radius: 8px;
      transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; }
    .btn-secondary {
      display: block;
      background: #1a1d24;
      color: #cbd5e1;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid #2a303c;
    }
    .btn-secondary:hover { background: #222630; }
    .footer-brand {
      margin-top: 24px;
      font-size: 11px;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span>${c.icon}</span>
      <span>${options.badge}</span>
    </div>
    <h1>${options.headline}</h1>
    <p>${options.description}</p>
    <div class="actions">
      ${options.serverSlug ? `<a href="${options.siteUrl}/server/${options.serverSlug}" class="btn-primary">View Live Server Page →</a>` : ''}
      <a href="${options.siteUrl}" class="btn-secondary">Return to GTA SERVERS Directory</a>
    </div>
    <div class="footer-brand">
      GTA SERVERS Sentinel Moderation Pipeline · Secure Staff Control
    </div>
  </div>
</body>
</html>`;
}
