import { schedule } from '@netlify/functions';

/**
 * Netlify Scheduled Function: runs automatically every 15 minutes 24/7
 * Triggers the monitoring endpoint to poll FiveM server statuses and record telemetry snapshots.
 */
export const handler = schedule('*/15 * * * *', async () => {
  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://gtagameservers.com';
  const targetEndpoint = `${siteUrl.replace(/\/+$/, '')}/api/cron/monitor`;

  try {
    const res = await fetch(targetEndpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'Netlify-Scheduled-Cron/1.0',
        'Accept': 'application/json'
      }
    });

    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        endpoint: targetEndpoint,
        response: data
      })
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err.message
      })
    };
  }
});
