
const config = require('../settings');
const { isJidGroup } = require(config.BAILEYS);
const fallbackPP = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';

const contextInfo = (jid) => ({
    mentionedJid: [jid],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363402507750390@newsletter',
        newsletterName: 'ᴍᴀʟᴠɪɴ ᴋɪɴɢ',
        serverMessageId: 143,
    }
});

const getProfilePicture = async (conn, jid) => {
    try {
        return await conn.profilePictureUrl(jid, 'image');
    } catch {
        return fallbackPP;
    }
};

const formatTimestamp = () => new Date().toLocaleString();

const GroupEvents = async (conn, update) => {
    try {
        if (!isJidGroup(update.id)) return;

        const metadata = await conn.groupMetadata(update.id);
        const desc = metadata.desc || "No description set.";
        const groupName = metadata.subject;
        const memberCount = metadata.participants.length;

        for (const participant of update.participants) {
            const userId = participant;
            const username = userId.split('@')[0];
            const timestamp = formatTimestamp();
            const userPp = await getProfilePicture(conn, userId);
            const groupPp = await getProfilePicture(conn, update.id);

            // === WELCOME ===
            if (update.action === 'add' && config.WELCOME === "true") {
                const welcomeMsg = `
╔═━━━─── • ───━━━═╗
       🎊 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 🎊
╚═━━━─── • ───━━━═╝
👋 𝗛𝗲𝘆 @${username}!
🌟 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 *${groupName}*

🧮 𝗠𝗲𝗺𝗯𝗲𝗿 𝗡𝗼: ${memberCount}
🕒 𝗝𝗼𝗶𝗻𝗲𝗱: ${timestamp}

📜 𝗚𝗿𝗼𝘂𝗽 𝗗𝗲𝘀𝗰:
${desc}

💫 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 ${config.BOT_NAME}
`.trim();

                await conn.sendMessage(update.id, {
                    image: { url: userPp },
                    caption: welcomeMsg,
                    mentions: [userId],
                    contextInfo: contextInfo(userId),
                });

            // === GOODBYE ===
            } else if (update.action === 'remove' && config.WELCOME === "true") {
                const goodbyeMsg = `
╔═━━━─── • ───━━━═╗
     👋 𝗚𝗢𝗢𝗗𝗕𝗬𝗘 👋
╚═━━━─── • ───━━━═╝
@${username} 𝗹𝗲𝗳𝘁 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽.

🕒 𝗟𝗲𝗳𝘁: ${timestamp}
👥 𝗥𝗲𝗺𝗮𝗶𝗻𝗶𝗻𝗴: ${memberCount}

🎈 𝗪𝗲 𝘄𝗶𝘀𝗵 𝘁𝗵𝗲𝗺 𝗴𝗼𝗼𝗱 𝗹𝘂𝗰𝗸!

🤖 𝗙𝗿𝗼𝗺 ${config.BOT_NAME}
`.trim();

                await conn.sendMessage(update.id, {
                    image: { url: userPp },
                    caption: goodbyeMsg,
                    mentions: [userId],
                    contextInfo: contextInfo(userId),
                });

            // === DEMOTE ===
            } else if (update.action === 'demote' && config.ADMIN_EVENTS === "true") {
                const demoter = update.author.split('@')[0];
                const demoteMsg = `
⚠️ *Admin Removed*

@${demoter} removed @${username} from admin list.

🕒 ${timestamp}
📌 Group: ${groupName}
`.trim();

                await conn.sendMessage(update.id, {
                    image: { url: groupPp },
                    caption: demoteMsg,
                    mentions: [userId, update.author],
                    contextInfo: contextInfo(update.author),
                });

            // === PROMOTE ===
            } else if (update.action === 'promote' && config.ADMIN_EVENTS === "true") {
                const promoter = update.author.split('@')[0];
                const promoteMsg = `
🛡️ *New Admin Alert!*

@${promoter} promoted @${username} to admin!

🕒 ${timestamp}
📌 Group: ${groupName}

🎉 𝗖𝗼𝗻𝗴𝗿𝗮𝘁𝘀, 𝗮𝗱𝗺𝗶𝗻 @${username}!
`.trim();

                await conn.sendMessage(update.id, {
                    image: { url: groupPp },
                    caption: promoteMsg,
                    mentions: [userId, update.author],
                    contextInfo: contextInfo(update.author),
                });
            }
        }
    } catch (err) {
        console.error("❌ GroupEvents Error:", err);
    }
};

module.exports = GroupEvents;
