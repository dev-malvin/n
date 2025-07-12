const axios = require('axios');
const config = require('../settings');
const { malvin } = require('../malvin');
const moment = require('moment-timezone');

malvin({
  pattern: 'version',
  react: '🚀',
  desc: 'Check current bot version & compare with remote repo',
  category: 'info',
  filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
  try {
    const time = moment().tz('Africa/Harare').format('HH:mm:ss');
    const date = moment().tz('Africa/Harare').format('DD/MM/YYYY');

    // Local version info
    const localPackage = require('../package.json');
    const currentVersion = localPackage.version;

    // Remote version info from GitHub
    const repoUrl = config.REPO || 'https://github.com/XdKing2/MALVIN-XD';
    const repoPath = repoUrl.replace('https://github.com/', '');
    const rawUrl = `https://raw.githubusercontent.com/${repoPath}/master/package.json`;

    const { data: remotePackage } = await axios.get(rawUrl);
    const latestVersion = remotePackage.version;

    // Status decision
    const status = currentVersion === latestVersion
      ? '✅ Your bot is *up-to-date*!'
      : '⚠️ *Update Available!*';

    const versionInfo = `
🗂️ *Version Status*

🔖 *Current:* v${currentVersion}
🆕 *Latest:* v${latestVersion}

${status}

📅 *Checked:* ${date}
🕒 *Time:* ${time}

🤖 *Bot:* ${config.BOT_NAME || 'MALVIN-XD'}
👑 *Developer:* ${config.OWNER_NAME || 'Mr. Malvin King'}

📦 *Repo:* ${repoUrl}
⭐️ *Star the repo to support!*
`.trim();

    await conn.sendMessage(from, {
      image: {
        url: config.ALIVE_IMG || 'https://files.catbox.moe/01f9y1.jpg'
      },
      caption: versionInfo,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363402507750390@newsletter',
          newsletterName: config.BOT_NAME ? `${config.BOT_NAME} Bot` : 'ᴍᴀʟᴠɪɴ-xᴅ',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

  } catch (e) {
    console.error('Version check failed:', e);

    // Safe fallback
    const localVersion = require('../package.json').version;

    const fallback = `
❌ *Version Check Failed!*

📦 *Local Version:* v${localVersion}
🔗 *Repo:* ${config.REPO || 'Not configured'}

Error:
${e.message}
`.trim();

    reply(fallback);
  }
});
