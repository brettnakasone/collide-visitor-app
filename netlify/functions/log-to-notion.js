// netlify/functions/log-to-notion.js
// This function receives form data and logs it to your Notion database.
// To activate: Add NOTION_TOKEN to Netlify environment variables.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { name, phone, email, visit1ISO, visit2ISO } = JSON.parse(event.body);
    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    const DATABASE_ID = 'f727bf80465b4d1db688538649e3af73';

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: {
          Name: { title: [{ text: { content: name } }] },
          Phone: { phone_number: phone },
          Email: { email: email },
          'Visit 1': { date: { start: visit1ISO } },
          'Visit 2': { date: { start: visit2ISO } },
          Status: { select: { name: 'Submitted' } },
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { statusCode: 500, body: `Notion error: ${err}` };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
