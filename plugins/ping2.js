const config = require('../settings');
const { malvin } = require('../malvin');
const moment = require('moment-timezone');

malvin({
    pattern: "ping",
    alias: ["speed", "pong"],
    desc: "Check bot's response time and status",
    category: "main",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        const start = Date.now();

        // Emojis and styles
        const emojiSets = {
            reactions: ['⚡', '🚀', '💨', '🎯', '🌟', '💎', '🔥', '✨', '🌀', '🔹'],
            bars: [
                '▰▰▰▰▰▰▰▰▰▰',
                '▰▱▱▱▱▱▱▱▱▱',
                '▰▰▱▱▱▱▱▱▱▱',
                '▰▰▰▱▱▱▱▱▱▱',
                '▰▰▰▰▱▱▱▱▱▱'
            ],
            status: ['🟢 ONLINE', '🔵 ACTIVE', '🟣 RUNNING', '🟡 RESPONDING']
        };

        const reactionEmoji = emojiSets.reactions[Math.floor(Math.random() * emojiSets.reactions.length)];
        const statusText = emojiSets.status[Math.floor(Math.random() * emojiSets.status.length)];
        const loadingBar = emojiSets.bars[Math.floor(Math.random() * emojiSets.bars.length)];

        // React with emoji
        await conn.sendMessage(from, {
            react: { text: reactionEmoji, key: mek.key }
        });

        // Time info
        const responseTime = (Date.now() - start) / 1000;
        const time = moment().tz('Africa/Harare').format('HH:mm:ss');
        const date = moment().tz('Africa/Harare').format('DD/MM/YYYY');

        // Owner & bot name
        const ownerName = config.OWNER_NAME || "Mr Malvin";
        const botName = config.BOT_NAME || "MALVIN-XD";
        const repoLink = config.REPO || "https://github.com/XdKing2/MALVIN-XD";

        // Final output
        const pingMsg = `
${loadingBar}
*${statusText}*

⚡ \`Response Time:\` ${responseTime.toFixed(2)}s
⏰ \`Time:\` ${time}
📅 \`Date:\` ${date}

💻 \`Developer:\` ${ownerName}
🤖 \`Bot Name:\` ${botName}

🌟 Don't forget to *star* & *fork* the repo!
🔗 ${repoLink}

${loadingBar}
`.trim();

        await conn.sendMessage(from, {
            text: pingMsg,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363402507750390@newsletter',
                    newsletterName: "🚀 ᴍᴀʟᴠɪɴ-xᴅ 🚀",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("❌ Ping command error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
