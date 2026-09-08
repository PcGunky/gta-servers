// Discord Webhook Dispatcher for Real-Time Server Submissions, Comprehensive Content Audits,
// 1-Click Interactive Moderation Controls (Accept / Decline buttons), and Auto-Deletion of resolved messages.

export interface DiscordSubmissionPayload {
  name: string;
  slug: string;
  ip: string;
  port: number;
  platform: string;
  server_type: string;
  country: string;
  language?: string;
  cfx_code?: string | null;
  banner_url?: string | null;
  logo_url?: string | null;
  discord_url?: string | null;
  website_url?: string | null;
  current_players?: number;
  max_players?: number;
  submitter_ip?: string | null;
  description?: string | null;
  long_description?: string | null;
  rules?: string[] | null;
  tags?: string[] | null;
}

export interface DiscordSubmissionResult {
  success: boolean;
  messageId?: string;
}

/**
 * Truncate helper ensuring strings fit comfortably within Discord's 1024-character field limit.
 */
function truncateField(text: string | null | undefined, maxLength = 800): string {
  if (!text) return 'None provided';
  const clean = text.trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength - 3) + '...';
}

export async function sendSubmissionDiscordWebhook(payload: DiscordSubmissionPayload): Promise<DiscordSubmissionResult> {
  const webhookUrl = process.env.DISCORD_STAFF_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    console.log('[Discord Webhook] DISCORD_STAFF_WEBHOOK_URL not configured. Skipping staff verification alert for:', payload.name);
    return { success: false };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gtaservers.io';
  const serverUrl = `${siteUrl}/server/${payload.slug}`;
  const modSecret = process.env.MODERATION_SECRET || 'gta_mod_sec_87e2b90ca14d59f3';

  // Secure 1-click moderation links
  let approveUrl = `${siteUrl}/api/servers/moderate?id=${encodeURIComponent(payload.slug)}&action=approve&secret=${encodeURIComponent(modSecret)}`;
  let rejectUrl = `${siteUrl}/api/servers/moderate?id=${encodeURIComponent(payload.slug)}&action=reject&secret=${encodeURIComponent(modSecret)}`;

  const connectTarget = payload.cfx_code 
    ? `cfx.re/join/${payload.cfx_code}` 
    : `${payload.ip}:${payload.port}`;

  const buildFields = (appUrl: string, rejUrl: string) => {
    const fields: Array<{ name: string; value: string; inline?: boolean }> = [
      {
        name: '⚡ Moderation Decision (Pre-Moderation)',
        value: `[✅ **Accept & Publish**](${appUrl})  ·  [❌ **Decline & Delete**](${rejUrl})\n*Click green to accept into directory or red to reject.*`,
        inline: false
      },
      {
        name: '🎮 Platform & Type',
        value: `${payload.platform} · ${payload.server_type}`,
        inline: true
      },
      {
        name: '🌍 Country & Lang',
        value: `${payload.country} · ${payload.language || 'English'}`,
        inline: true
      },
      {
        name: '🔌 Connect Target',
        value: `\`${connectTarget}\``,
        inline: true
      },
      {
        name: '👥 Initial Players',
        value: `${payload.current_players || 0} / ${payload.max_players || 1000}`,
        inline: true
      },
      {
        name: '🌐 Submitter IP',
        value: payload.submitter_ip ? `\`${payload.submitter_ip}\`` : '`Unknown / Proxy`',
        inline: true
      },
      {
        name: '🔗 Pending Directory Page',
        value: `[Preview Server (${payload.slug})](${serverUrl})`,
        inline: true
      }
    ];

    // Links row if any exist
    const links: string[] = [];
    if (payload.discord_url) links.push(`[Discord Community](${payload.discord_url})`);
    if (payload.website_url) links.push(`[Official Website](${payload.website_url})`);
    if (links.length > 0) {
      fields.push({
        name: '💬 External Links',
        value: links.join(' · '),
        inline: false
      });
    }

    // Tags
    if (payload.tags && payload.tags.length > 0) {
      const cleanDisplayTags = payload.tags.filter(t => !t.startsWith('cfx:') && !t.startsWith('discord_msg:') && t !== 'pending_approval');
      if (cleanDisplayTags.length > 0) {
        const formattedTags = cleanDisplayTags.map(t => `\`${t}\``).join(' ');
        fields.push({
          name: '🏷️ Tags',
          value: truncateField(formattedTags, 400),
          inline: false
        });
      }
    }

    // Full Text Content Audit: Short Description
    if (payload.description) {
      fields.push({
        name: '📝 Short Description (Screen for hate speech / scams)',
        value: truncateField(payload.description, 600),
        inline: false
      });
    }

    // Full Text Content Audit: Long Description / About
    if (payload.long_description && payload.long_description !== payload.description) {
      fields.push({
        name: '📖 Extended About Section',
        value: truncateField(payload.long_description, 900),
        inline: false
      });
    }

    // Full Text Content Audit: Rules
    if (payload.rules && payload.rules.length > 0) {
      const rulesText = payload.rules.map((r, i) => `${i + 1}. ${r}`).join('\n');
      fields.push({
        name: '📜 Stated Rules',
        value: truncateField(rulesText, 600),
        inline: false
      });
    }

    return fields;
  };

  const buildEmbed = (fields: any[]) => {
    const embed: Record<string, any> = {
      title: `🛡️ New Server Submission (Pending Review): ${payload.name}`,
      url: serverUrl,
      description: `A new server has been registered and is **pending staff approval**. Review all text and banners below, then click **Accept** or **Decline**.`,
      color: 0xf59e0b, // Amber / Pending status color
      fields,
      footer: {
        text: 'GTA SERVERS Sentinel Moderation Pipeline · Click Buttons to Decide'
      },
      timestamp: new Date().toISOString()
    };

    if (payload.logo_url && (payload.logo_url.startsWith('http://') || payload.logo_url.startsWith('https://'))) {
      embed.thumbnail = { url: payload.logo_url };
    }

    if (payload.banner_url && (payload.banner_url.startsWith('http://') || payload.banner_url.startsWith('https://'))) {
      embed.image = { url: payload.banner_url };
    }

    return embed;
  };

  const buildComponents = (appUrl: string, rejUrl: string) => [
    {
      type: 1, // Action Row
      components: [
        {
          type: 2, // Button
          style: 5, // Link button
          label: 'Accept & Publish',
          emoji: { name: '✅' },
          url: appUrl
        },
        {
          type: 2, // Button
          style: 5, // Link button
          label: 'Decline & Delete',
          emoji: { name: '❌' },
          url: rejUrl
        }
      ]
    }
  ];

  try {
    const cleanWebhook = webhookUrl.split('?')[0];
    const postUrl = `${cleanWebhook}?wait=true`;

    const res = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'GTA SERVERS Sentinel',
        avatar_url: 'https://vyituhexijiwvalgdabj.supabase.co/storage/v1/object/public/Kratn_tuebingen/gta_server_list.png',
        content: `🚨 **New Server Pending Moderation** — "${payload.name}" requires staff approval:`,
        embeds: [buildEmbed(buildFields(approveUrl, rejectUrl))],
        components: buildComponents(approveUrl, rejectUrl)
      })
    });

    if (!res.ok) {
      return { success: false };
    }

    const data = await res.json();
    const messageId = data?.id;

    // If we have the messageId, patch the message so the button URLs include &msg=ID for instantaneous auto-deletion
    if (messageId) {
      const approveWithMsg = `${approveUrl}&msg=${messageId}`;
      const rejectWithMsg = `${rejectUrl}&msg=${messageId}`;

      fetch(`${cleanWebhook}/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [buildEmbed(buildFields(approveWithMsg, rejectWithMsg))],
          components: buildComponents(approveWithMsg, rejectWithMsg)
        })
      }).catch(() => {});
    }

    return { success: true, messageId };
  } catch (err: any) {
    console.error('Failed to dispatch Discord verification webhook:', err.message);
    return { success: false };
  }
}

/**
 * Permanently deletes a webhook message from Discord so the queue only contains pending submissions.
 */
export async function deleteDiscordWebhookMessage(messageId: string): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_STAFF_WEBHOOK_URL;
  if (!webhookUrl || !messageId) return false;

  try {
    const cleanWebhook = webhookUrl.split('?')[0];
    const res = await fetch(`${cleanWebhook}/messages/${messageId}`, {
      method: 'DELETE'
    });
    return res.ok || res.status === 204;
  } catch (err: any) {
    console.error('Failed to delete Discord message:', err.message);
    return false;
  }
}
