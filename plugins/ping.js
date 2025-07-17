const config = require('../settings');
const { malvin, commands } = require('../malvin');

malvin({
    pattern: "ping2",
    alias: ["pong", "ping2", "ping3"],
    use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        const startTime = Date.now();

        const emojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹', '💎', '🏆', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // React instantly with a random emoji
        await conn.sendMessage(from, {
            react: { text: randomEmoji, key: mek.key }
        });

        const ping = Date.now() - startTime;

        // Speed categorization
        let badge = '🐢 Slow', color = '🔴';
        if (ping <= 150) {
            badge = '🚀 Super Fast';
            color = '🟢';
        } else if (ping <= 300) {
            badge = '⚡ Fast';
            color = '🟡';
        } else if (ping <= 600) {
            badge = '⚠️ Medium';
            color = '🟠';
        }

        // Final response
        await conn.sendMessage(from, {
            text: `> *ᴍᴀʟᴠɪɴ-xᴅ ʀᴇsᴘᴏɴsᴇ: ${ping} ms ${randomEmoji}*\n> *sᴛᴀᴛᴜs: ${color} ${badge}*\n> *ᴠᴇʀsɪᴏɴ: ${config.version}*`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363402507750390@newsletter',
                    newsletterName: "Malvin King Tech",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("❌ Error in ping command:", e);
        reply(`⚠️ Error: ${e.message}`);
    }
});
