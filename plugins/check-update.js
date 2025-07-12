const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { malvin, commands } = require('../malvin');
const { runtime } = require('../lib/functions');
const config = require('../settings');

const GITHUB_TOKEN = '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'; // Your token

malvin({
  pattern: 'version',
  alias: ['changelog', 'cupdate', 'checkupdate'],
  react: '🚀',
  desc: 'Check bot version, system info, and update status.',
  category: 'owner',
  filename: __filename
}, async (conn, mek, m, { from, pushname, reply }) => {
  try {
    const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';

    // Read local version file
    const versionPath = path.join(__dirname, '../data/version.json');
    let localVersion = 'Unknown';
    let changelog = 'No changelog found.';
    if (fs.existsSync(versionPath)) {
      const localData = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
      localVersion = localData.version || localVersion;
      changelog = localData.changelog || changelog;
    }

    // Fetch latest version from GitHub (base64-decoded)
    const apiURL = 'https://api.github.com/repos/dev-malvin/m/contents/data/version.json';
    let latestVersion = 'Unknown';
    let latestChangelog = 'Not available';
    let remoteValid = false;

    try {
      const { data } = await axios.get(apiURL, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });

      const decoded = Buffer.from(data.content, 'base64').toString();
      const remote = JSON.parse(decoded);
      latestVersion = remote.version || latestVersion;
      latestChangelog = remote.changelog || latestChangelog;
      remoteValid = true;
    } catch (err) {
      console.warn('⚠️ Could not fetch remote version:', err.message);
    }

    // System details
    const pluginCount = fs.readdirSync(path.join(__dirname, '../plugins')).filter(f => f.endsWith('.js')).length;
    const commandCount = commands.length;
    const uptime = runtime(process.uptime());
    const ram = process.memoryUsage().heapUsed / 1024 / 1024;
    const totalRam = os.totalmem() / 1024 / 1024;
    const hostname = os.hostname();
    const lastUpdated = fs.existsSync(versionPath)
      ? fs.statSync(versionPath).mtime.toLocaleString()
      : 'Unknown';

    const updateAvailable = remoteValid && localVersion !== latestVersion;
    const updateStatus = updateAvailable
      ? `🔄 *Update Available!*\n👉 *Current:* ${localVersion}\n👉 *Latest:* ${latestVersion}\n\nUse *.update* to upgrade.`
      : `✅ Your MALVIN-XD bot is up-to-date!`;

    const caption = `
╭──〔 *MALVIN-XD STATUS* 〕─

🧑‍💻 ᴜsᴇʀ: *${pushname}*
📍 ʜᴏsᴛ: *${hostname}*
🕒 ᴜᴘᴛɪᴍᴇ: *${uptime}*

╭─💾 *Sʏsᴛᴇᴍ* ─
├ RAM: *${ram.toFixed(2)}MB / ${totalRam.toFixed(2)}MB*
├ Pʟᴜɢɪɴs: *${pluginCount}*
├ Cᴏᴍᴍᴀɴᴅs: *${commandCount}*
╰─────────

╭─📦 *Vᴇʀsɪᴏɴs* ─
├📍 Lᴏᴄᴀʟ: *${localVersion}*
├🆕️ Lᴀᴛᴇsᴛ: *${latestVersion}*
╰──────────

📅 *Last Local Update:* ${lastUpdated}
📜 *Changelog:* ${latestChangelog}

📎 *Repo:* https://github.com/XdKing2/MALVIN-XD
👑 *Owner:* https://github.com/XdKing2

${updateStatus}
`.trim();

    // Send result to requester
    await conn.sendMessage(from, {
      image: { url: 'https://files.catbox.moe/01f9y1.jpg' },
      caption,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true
      }
    }, { quoted: mek });

    // 🔔 Notify Owner if update is available
    if (updateAvailable && from !== ownerJid) {
      await conn.sendMessage(ownerJid, {
        text: `🚨 *Update Detected!*\n\n🔧 Local version: *${localVersion}*\n🆕 Latest version: *${latestVersion}*\n\n📜 Changelog:\n${latestChangelog}\n\nUse *.update* to apply the latest update.`,
        contextInfo: {
          mentionedJid: [ownerJid]
        }
      });
    }

  } catch (err) {
    console.error('❌ Version command error:', err);
    reply('❌ Failed to retrieve version info.');
  }
});
