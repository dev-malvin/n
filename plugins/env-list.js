const config = require('../settings');
const { malvin } = require('../malvin');
const fs = require('fs');

function isEnabled(value) {
    return value && value.toString().toLowerCase() === 'true';
}

function generateSettingsList() {
    const settingsList = [
        { name: 'Status View', key: 'AUTO_STATUS_SEEN', emoji: '👁️' },
        { name: 'Status Reply', key: 'AUTO_STATUS_REPLY', emoji: '💬' },
        { name: 'Status React', key: 'AUTO_STATUS_REACT', emoji: '🤩' },
        { name: 'Status Reply Msg', key: 'AUTO_STATUS_MSG', emoji: '💭', isText: true },
        { name: 'Auto Reply', key: 'AUTO_REPLY', emoji: '↩️' },
        { name: 'Auto Sticker', key: 'AUTO_STICKER', emoji: '🖼️' },
        { name: 'Custom Reacts', key: 'CUSTOM_REACT', emoji: '👍' },
        { name: 'Auto React', key: 'AUTO_REACT', emoji: '💥' },
        { name: 'Delete Links', key: 'DELETE_LINKS', emoji: '🔗' },
        { name: 'Anti-Link', key: 'ANTI_LINK', emoji: '🚫' },
        { name: 'Anti-Bad Words', key: 'ANTI_BAD', emoji: '🛑' },
        { name: 'Auto Typing', key: 'AUTO_TYPING', emoji: '⌨️' },
        { name: 'Auto Recording', key: 'AUTO_RECORDING', emoji: '🎙️' },
        { name: 'Always Online', key: 'ALWAYS_ONLINE', emoji: '🌐' },
        { name: 'Public Mode', key: 'PUBLIC_MODE', emoji: '🌍' },
        { name: 'Read Message', key: 'READ_MESSAGE', emoji: '📖' },
    ];

    return settingsList.map(s => {
        if (s.isText) {
            return `🔹 *${s.emoji} ${s.name}:* ${config[s.key] || 'Not Set'}`;
        } else {
            return `🔹 *${s.emoji} ${s.name}:* ${isEnabled(config[s.key]) ? "✅ Enabled" : "❌ Disabled"}`;
        }
    }).join('\n');
}

malvin({
    pattern: 'env',
    alias: ['setting', 'allvar'],
    desc: 'View and manage bot settings',
    category: 'main',
    react: '⚙️',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const settingsMessage = `
╭─❍〔 *ᴍᴀʟᴠɪɴ xᴅ sᴇᴛᴛɪɴɢs* 〕❍─
┊
┆ *📌 ᴄᴜʀʀᴇɴᴛ ᴄᴏɴғɪɢᴇʀᴀᴛɪᴏɴs:*
┆──────────────
${generateSettingsList()}
╰━━━━━━━━━━━━━┈⊷

🔗 *Description:* ${config.DESCRIPTION || 'No description available'}
`;

        const imageUrl = config.MENU_IMAGE_URL || 'https://files.catbox.moe/ebqp72.png';

        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: settingsMessage,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363402507750390@newsletter',
                    newsletterName: "ᴍᴀʟᴠɪɴ xᴅ ᴇɴᴠ",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(from, {
      audio: { url: 'https://files.catbox.moe/wz8rh7.mp3' },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: mek });

    } catch (e) {
        console.error("❌ Error in env command:", e);
        reply("⚠️ An error occurred while fetching the settings. Please try again.");
    }
});
