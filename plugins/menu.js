/*
const config = require('../settings');
const { malvin, commands } = require('../malvin');
const { runtime } = require('../lib/functions');
const axios = require('axios');
const moment = require("moment-timezone"); // Use timezone-aware moment
const fs = require('fs');

const { getPrefix } = require('../lib/prefix');





malvin({
    pattern: "menu",
    alias: "m",
    desc: "Show interactive menu system",
    category: "main",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Set the correct timezone, e.g., Africa/Harare. You can change it to match your region
        const currentTime = moment().tz("Africa/Harare").format("HH:mm:ss");
        const currentDate = moment().tz("Africa/Harare").format("dddd, MMMM Do YYYY");
        const prefix = getPrefix();
        const totalCommands = Object.keys(commands).length;

        const menuCaption = `        
╭─╼『 🤖 *${config.BOT_NAME}* 』╾─╮
│ 👤 ᴏᴡɴᴇʀ   : @${config.OWNER_NUMBER}
│ 🌐 ᴍᴏᴅᴇ    : [ ${config.MODE.toUpperCase()} ]
│ 🕒 ᴛɪᴍᴇ    : ${currentTime}
│ 📆 ᴅᴀᴛᴇ    : ${currentDate}
│ 🛠️ ᴘʀᴇғɪx  : [ ${prefix} ]
│ 📊 ᴄᴍᴅs   : ${totalCommands}
│ 🔁 ᴜᴘᴛɪᴍᴇ  : ${runtime(process.uptime())}
│ 👑 ᴅᴇᴠ     : ᴍᴀʟᴠɪɴ ᴋɪɴɢ
│ 🚀 ᴠᴇʀsɪᴏɴ : ${config.version}
╰────────────⭑

📚 *ᴍᴇɴᴜ ɴᴀᴠɪɢᴀᴛɪᴏɴ:*
> _ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ ᴛᴏ ᴏᴘᴇɴ ᴀ ᴄᴀᴛᴇɢᴏʀʏ._

╭──〔 🌐 *ᴄᴀᴛᴇɢᴏʀʏ ʟɪsᴛ* 〕─╮
│
│ ➊ ⬇️  *ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇɴᴜ*
│ ➋ 💬  *ɢʀᴏᴜᴘ ᴍᴇɴᴜ*
│ ➌ 🕹️  *ғᴜɴ ᴍᴇɴᴜ*
│ ➍ 👑  *ᴏᴡɴᴇʀ ᴍᴇɴᴜ*
│ ➎ 🧠  *ᴀɪ ᴍᴇɴᴜ*
│ ➏ 🌸  *ᴀɴɪᴍᴇ ᴍᴇɴᴜ*
│ ➐ 🔁  *ᴄᴏɴᴠᴇʀᴛ ᴍᴇɴᴜ*
│ ➑ 🧩  *ᴏᴛʜᴇʀ ᴍᴇɴᴜ*
│ ➒ 💫  *ʀᴇᴀᴄᴛɪᴏɴ ᴍᴇɴᴜ*
│ ➓ 🏕️  *ᴍᴀɪɴ ᴍᴇɴᴜ*
│ ⓫ 🎨  *ʟᴏɢᴏ ᴍᴀᴋᴇʀ*
│ ⓬ ⚙️  *sᴇᴛᴛɪɴɢs ᴍᴇɴᴜ*
│
╰────────────⭑

💡 _ᴛʏᴘᴇ_ *${prefix}ᴀʟʟᴍᴇɴᴜ* _ᴛᴏ sᴇᴇ ᴇᴠᴇʀʏᴛʜɪɴɢ._

> ${config.DESCRIPTION}
`;


        // Context for mentioning and newsletter forwarding (kept as you had)
        const contextInfo = {
    mentionedJid: [config.OWNER_NUMBER + '@s.whatsapp.net'],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363402507750390@newsletter',
        newsletterName: config.OWNER_NAME,
        serverMessageId: 143
    }
};

        const sendMenuImage = async () => {
            try {
                return await conn.sendMessage(
                    from,
                    {
                        image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/qumhu4.jpg' },
                        caption: menuCaption,
                        contextInfo
                    },
                    { quoted: mek }
                );
            } catch (e) {
                console.log('Image send failed, fallback to text');
                return await conn.sendMessage(
                    from,
                    { text: menuCaption, contextInfo },
                    { quoted: mek }
                );
            }
        };

        const sendMenuAudio = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await conn.sendMessage(from, {
      audio: { url: 'https://files.catbox.moe/wz8rh7.mp3' },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: mek });
    
            } catch (e) {
                console.log('Audio send failed');
            }
        };

        let sentMsg;
        try {
            sentMsg = await Promise.race([
                sendMenuImage(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Image timeout')), 10000))
            ]);
            await Promise.race([
                sendMenuAudio(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Audio timeout')), 8000))
            ]);
        } catch (e) {
            console.log('Error sending menu:', e.message);
            if (!sentMsg) {
                await conn.sendMessage(
                    from,
                    { text: menuCaption, contextInfo },
                    { quoted: mek }
                );
            }
        }
    
        
        const messageID = sentMsg.key.id;

        // Menu data (complete version)
        const menuData = {
            '1': {
                title: "📥 *Download Menu* 📥",
                content: `

╭──➊ *ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇɴᴜ* ➊──

📥 ᴅᴏᴡɴʟᴏᴀᴅᴇʀs & ᴍᴇᴅɪᴀ ᴛᴏᴏʟs

│ ⬡ ᴀᴘᴋ
│ ⬡ ғʙ
│ ⬡ ɢᴅʀɪᴠᴇ
│ ⬡ ɪᴍɢ
│ ⬡ ɪɢɪᴍᴀɢᴇᴅʟ
│ ⬡ ɪɢᴠɪᴅ
│ ⬡ ᴍᴇᴅɪᴀғɪʀᴇ
│ ⬡ ᴍᴇᴅɪᴀғɪʀᴇ2
│ ⬡ ᴛɪᴋᴛᴏᴋ
│ ⬡ ᴛɪᴋᴛᴏᴋ2
│ ⬡ ʏᴛᴘᴏsᴛ
│ ⬡ ʏᴛ2
│ ⬡ ᴘɪɴᴅʟ
│ ⬡ ᴛᴡɪᴛᴛᴇʀ

📚 ᴋɴᴏᴡʟᴇᴅɢᴇ & ᴜᴛɪʟs

│ ⬡ ʙɪʙʟᴇ
│ ⬡ ʙɪʙʟᴇʟɪsᴛ
│ ⬡ ɴᴇᴡs
│ ⬡ ɴᴘᴍ
│ ⬡ ᴘᴀɪʀ
│ ⬡ ɢɪᴛᴄʟᴏɴᴇ

🎧 ᴀᴜᴅɪᴏ & ᴠɪᴅᴇᴏ

│ ⬡ sᴏɴɢ
│ ⬡ ᴘʟᴀʏ
│ ⬡ ᴠɪᴅᴇᴏ
│ ⬡ ᴠɪᴅᴇᴏ2
│ ⬡ ᴛᴛs

🎬 ᴇɴᴛᴇʀᴛᴀɪɴᴍᴇɴᴛ
│ ⬡ ᴍᴏᴠɪᴇ
│ ⬡ ʏᴛs

╰──────────

> ${config.DESCRIPTION}`,
                image: true
            },
            '2': {
                title: "👥 *Group Menu* 👥",
                content: `

╭─➋ *ɢʀᴏᴜᴘ ᴍᴇɴᴜ* ➋─

🔧 ɢʀᴏᴜᴘ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ
│ ⬡ ʀᴇϙᴜᴇsᴛʟɪsᴛ
│ ⬡ ᴀᴄᴄᴇᴘᴛᴀʟʟ
│ ⬡ ʀᴇᴊᴇᴄᴛᴀʟʟ
│ ⬡ ʀᴇᴍᴏᴠᴇᴍᴇᴍʙᴇʀs
│ ⬡ ʀᴇᴍᴏᴠᴇᴀᴅᴍɪɴs
│ ⬡ ʀᴇᴍᴏᴠᴇᴀʟʟ2
│ ⬡ ɢʀᴏᴜᴘsᴘʀɪᴠᴀᴄʏ
│ ⬡ ᴜᴘᴅᴀᴛᴇɢᴅᴇsᴄ
│ ⬡ ᴜᴘᴅᴀᴛᴇɢɴᴀᴍᴇ
│ ⬡ ʀᴇᴠᴏᴋᴇ
│ ⬡ ɢɪɴғᴏ

👥 ᴍᴇᴍʙᴇʀ ɪɴᴛᴇʀᴀᴄᴛɪᴏɴ
│ ⬡ ᴊᴏɪɴ
│ ⬡ ɪɴᴠɪᴛᴇ
│ ⬡ ʜɪᴅᴇᴛᴀɢ
│ ⬡ ᴛᴀɢᴀʟʟ
│ ⬡ ᴛᴀɢᴀᴅᴍɪɴs
│ ⬡ ᴘᴏʟʟ
│ ⬡ ʙʀᴏᴀᴅᴄᴀsᴛ

🔒 ɢʀᴏᴜᴘ sᴇᴄᴜʀɪᴛʏ & ᴄᴏɴᴛʀᴏʟ
│ ⬡ ʟᴏᴄᴋɢᴄ
│ ⬡ ᴜɴʟᴏᴄᴋɢᴄ
│ ⬡ ᴍᴜᴛᴇ
│ ⬡ ᴜɴᴍᴜᴛᴇ
│ ⬡ ᴀɴᴛɪʟɪɴᴋ
│ ⬡ ᴀɴᴛɪʟɪɴᴋᴋɪᴄᴋ
│ ⬡ ᴅᴇʟᴇᴛᴇʟɪɴᴋ
│ ⬡ ᴀɴᴛɪʙᴏᴛ
│ ⬡ ᴅᴇʟᴇᴛᴇ

✨ ᴄʀᴇᴀᴛɪᴏɴ & ᴛᴏᴏʟs
│ ⬡ ɴᴇᴡɢᴄ

╰───────────

> ${config.DESCRIPTION}`,
                image: true
            },
            '3': {
                title: "😄 *Fun Menu* 😄",
                content: `
╭─➌〔 *ғᴜɴ ᴍᴇɴᴜ* 〕➌─

│ ⬡ ᴄᴏᴜᴘʟᴇᴘᴘ
│ ⬡ ʀɪɴɢᴛᴏɴᴇ
│ ⬡ ᴇᴍɪx
│ ⬡ ʜᴀᴘᴘʏ
│ ⬡ ʜᴇᴀʀᴛ
│ ⬡ ᴀɴɢʀʏ
│ ⬡ sᴀᴅ
│ ⬡ sʜʏ
│ ⬡ ᴍᴏᴏɴ
│ ⬡ ᴄᴏɴғᴜsᴇᴅ
│ ⬡ ʜᴏᴛ
│ ⬡ ɴɪᴋᴀʟ
│ ⬡ ᴄᴏᴍᴘᴀᴛɪʙɪʟɪᴛʏ
│ ⬡ ᴀᴜʀᴀ
│ ⬡ 8ʙᴀʟʟ
│ ⬡ ᴄᴏᴍᴘʟɪᴍᴇɴᴛ
│ ⬡ ʟᴏᴠᴇᴛᴇsᴛ
│ ⬡ ᴇᴍᴏᴊɪ
│ ⬡ ғᴀɴᴄʏ
│ ⬡ ᴅɪᴅʏᴏᴜᴋɴᴏᴡ
│ ⬡ ᴍᴀʀɪɢᴇ
│ ⬡ ϙᴜɪᴢ
│ ⬡ sʜɪᴘ
│ ⬡ sϙᴜɪᴅɢᴀᴍᴇ
│ ⬡ ᴋᴏɴᴀᴍɪ
│ ⬡ ʜᴀᴄᴋ
│ ⬡ ϙᴜᴏᴛᴇ
│ ⬡ ʀᴡ
│ ⬡ ʀᴄᴏʟᴏʀ
│ ⬡ ʀᴏʟʟ
│ ⬡ ᴄᴏɪɴғʟɪᴘ
│ ⬡ ғʟɪᴘ
│ ⬡ ᴘɪᴄᴋ
│ ⬡ sʜᴀᴘᴀʀ
│ ⬡ ʀᴀᴛᴇ
│ ⬡ ᴄᴏᴜɴᴛx
│ ⬡ ᴄᴏᴜɴᴛ
│ ⬡ ᴊᴏᴋᴇ
│ ⬡ ғʟɪʀᴛ
│ ⬡ ᴛʀᴜᴛʜ
│ ⬡ ᴅᴀʀᴇ
│ ⬡ ғᴀᴄᴛ
│ ⬡ ᴘɪᴄᴋᴜᴘʟɪɴᴇ
│ ⬡ ᴄʜᴀʀᴀᴄᴛᴇʀ
│ ⬡ ʀᴇᴘᴇᴀᴛ
│ ⬡ sᴇɴᴅ

╰────────────
                
> ${config.DESCRIPTION}`,
                image: true
            },
            '4': {
                title: "👑 *Owner Menu* 👑",
                content: `
╭─➍〔 *ᴏᴡɴᴇʀ ᴍᴇɴᴜ* 〕➍─

📦 ᴍᴀɴᴀɢᴇᴍᴇɴᴛ & ᴄᴏɴᴛʀᴏʟ  
│ ⬡ ʙᴀɴ  
│ ⬡ ᴜɴʙᴀɴ  
│ ⬡ ʟɪsᴛʙᴀɴ  
│ ⬡ ʙʟᴏᴄᴋ  
│ ⬡ ᴜɴʙʟᴏᴄᴋ  
│ ⬡ ʙʟᴏᴄᴋʟɪsᴛ  
│ ⬡ sʜᴜᴛᴅᴏᴡɴ  
│ ⬡ ʀᴇsᴛᴀʀᴛ  
│ ⬡ ᴄʟᴇᴀʀᴄʜᴀᴛs  
│ ⬡ ʟᴇᴀᴠᴇ  
│ ⬡ ᴄʜᴀɴɴᴇʟʀᴇᴀᴄᴛ  
│ ⬡ ʙʀᴏᴀᴅᴄᴀsᴛ  
│ ⬡ sᴇᴛsᴜᴅᴏ  
│ ⬡ ᴅᴇʟsᴜᴅᴏ  
│ ⬡ ʟɪsᴛsᴜᴅᴏ  

👤 ᴘʀᴏꜰɪʟᴇ & ᴜsᴇʀ ᴛᴏᴏʟs  
│ ⬡ ᴘᴘ  
│ ⬡ sᴇᴛᴘᴘ  
│ ⬡ sᴇᴛᴘᴘᴀʟʟ  
│ ⬡ sᴇᴛᴍʏɴᴀᴍᴇ  
│ ⬡ ᴜᴘᴅᴀᴛᴇʙɪᴏ  
│ ⬡ ɢᴇᴛʙɪᴏ  
│ ⬡ ɢᴇᴛᴘᴘ  
│ ⬡ sᴇᴛᴏɴʟɪɴᴇ  
│ ⬡ ɢᴇᴛᴘʀɪᴠᴀᴄʏ  
│ ⬡ ᴘʀɪᴠᴀᴄʏ  
│ ⬡ ᴘᴇʀsᴏɴ  
│ ⬡ ɢᴇᴛ  
│ ⬡ sᴀᴠᴇᴄᴏɴᴛᴀᴄᴛ  
│ ⬡ ᴊɪᴅ  
│ ⬡ ɢᴊɪᴅ  
│ ⬡ ᴀɢᴇ  
│ ⬡ ᴛɪᴍᴇᴢᴏɴᴇ  
│ ⬡ ᴀᴅᴍɪɴ  
│ ⬡ ᴏᴡɴᴇʀ  

🛠️ ᴜᴛɪʟɪᴛʏ & ɢᴇɴᴇʀᴀʟ  
│ ⬡ ᴠᴠ2  
│ ⬡ ᴠᴠ  
│ ⬡ ᴅᴀɪʟʏғᴀᴄᴛ  
│ ⬡ ᴠᴇʀsɪᴏɴ  
│ ⬡ ᴍsɢ  
│ ⬡ ᴘᴏsᴛ  
│ ⬡ ᴛᴀᴋᴇ  
│ ⬡ sᴛɪᴄᴋᴇʀ  
│ ⬡ ғᴏʀᴡᴀʀᴅ

╰─────────────
                
> ${config.DESCRIPTION}`,
                image: true
            },
            '5': {
                title: "🤖 *AI Menu* 🤖",
                content: `
╭─➎〔 *ᴀɪ ᴍᴇɴᴜ* 〕➎─

┃ 💬 *ᴄʜᴀᴛ ᴀɪ*
┃ ────────────
┃ • ᴀɪ [query]
┃ • ɢᴘᴛ3 [query]
┃ • ɢᴘᴛ2 [query]
┃ • ɢᴘᴛᴍɪɴɪ [query]
┃ • ɢᴘᴛ [query]
┃ • ᴍᴇᴛᴀ [query]
┃ • ᴍᴀʟᴠɪɴ [query]

┃ 🖼️ *ɪᴍᴀɢᴇ ᴀɪ*
┃ ───────────
┃ • ɪᴍᴀɢɪɴᴇ [text]
┃ • ɪᴍᴀɢɪɴᴇ2 [text]
┃ • ᴍᴀʟᴠɪɴᴀɪ [query]

┃ 🔍 *ꜱᴘᴇᴄɪᴀʟɪᴢᴇᴅ*
┃ ───────────
┃ • ʙʟᴀᴄᴋʙᴏx [query]
┃ • ʟᴜᴍᴀ [query]
┃ • ᴅᴊ [query]
┃ • ᴍᴀʟᴠɪɴ [query]

╰────────────
               
> ${config.DESCRIPTION}`,
                image: true
            },
            '6': {
                title: "🎎 *Anime Menu* 🎎",
                content: `
╭─➏ *ᴀɴɪᴍᴇ ᴍᴇɴᴜ* ➏─

✨ ᴀɴɪᴍᴇ ɢɪʀʟs & ᴄʜᴀʀᴀᴄᴛᴇʀs
│ ⬡ ᴀɴɪᴍᴇɢɪʀʟ
│ ⬡ ᴀɴɪᴍᴇɢɪʀʟ1
│ ⬡ ᴀɴɪᴍᴇɢɪʀʟ2
│ ⬡ ᴀɴɪᴍᴇɢɪʀʟ3
│ ⬡ ᴀɴɪᴍᴇɢɪʀʟ4
│ ⬡ ᴀɴɪᴍᴇɢɪʀʟ5
│ ⬡ ᴡᴀɪғᴜ
│ ⬡ ɢᴀʀʟ
│ ⬡ ᴍᴇɢᴜᴍɪɴ
│ ⬡ ᴍᴀɪᴅ
│ ⬡ ᴀᴡᴏᴏ
│ ⬡ ɴᴇᴋᴏ

🐾 ᴀɴɪᴍᴀʟ-ᴛʏᴘᴇ
│ ⬡ ᴅᴏɢ
│ ⬡ ᴄᴀᴛ

╰─────────────

> ${config.DESCRIPTION}`,
                image: true
            },
            '7': {
                title: "🔄 *Convert Menu* 🔄",
                content: `
╭─➐ *ᴄᴏɴᴠᴇʀᴛ ᴍᴇɴᴜ* ➐─

🛠️ ᴄᴏɴᴠᴇʀsɪᴏɴ & ᴛᴏᴏʟs
│ ⬡ ᴄᴏɴᴠᴇʀᴛ
│ ⬡ ᴛᴏᴍᴘ3
│ ⬡ ᴛᴏᴘᴛᴛ
│ ⬡ ᴛᴏᴘᴅғ
│ ⬡ ᴀɪᴠᴏɪᴄᴇ
│ ⬡ ᴛᴛs2
│ ⬡ ᴛᴛs3
│ ⬡ ʀᴇᴀᴅᴍᴏʀᴇ
│ ⬡ ᴛɪɴʏᴜʀʟ

🎨 ɪᴍᴀɢᴇ & sᴛʏʟᴇ
│ ⬡ ᴘʜᴏᴛᴏ
│ ⬡ ʙʟᴜʀ
│ ⬡ ɢʀᴇʏ
│ ⬡ ɪɴᴠᴇʀᴛ
│ ⬡ ᴊᴀɪʟ
│ ⬡ ɴᴏᴋɪᴀ
│ ⬡ ᴡᴀɴᴛᴇᴅ
│ ⬡ ʀᴍʙɢ
│ ⬡ ɪᴍɢᴊᴏᴋᴇ

🎭 sᴛɪᴄᴋᴇʀ & ғᴜɴ
│ ⬡ ᴠsᴛɪᴄᴋᴇʀ
│ ⬡ ᴀᴛᴛᴘ

📢 ᴏᴛʜᴇʀs
│ ⬡ ᴀᴅ
│ ⬡ ᴀᴅ


╰─────────

> ${config.DESCRIPTION}`,
                image: true
            },
            '8': {
                title: "📌 *Other Menu* 📌",
                content: `
╭─➑ *ᴏᴛʜᴇʀ ᴍᴇɴᴜ* ➑─

🔎 ɪɴꜰᴏ & ꜱᴇᴀʀᴄʜ  
│ ⬡ ᴡᴇᴀᴛʜᴇʀ  
│ ⬡ ᴡɪᴋɪᴘᴇᴅɪᴀ  
│ ⬡ ᴄᴏᴜɴᴛʀʏɪɴғᴏ  
│ ⬡ ᴅᴇғɪɴᴇ  
│ ⬡ ᴡᴀsᴛᴀʟᴋ  
│ ⬡ ᴛɪᴋᴛᴏᴋsᴛᴀʟᴋ  
│ ⬡ xsᴛᴀʟᴋ  
│ ⬡ ʏᴛsᴛᴀʟᴋ  
│ ⬡ sʀᴇᴘᴏ  
│ ⬡ ɴᴘᴍ  
│ ⬡ ɪᴍɢsᴄᴀɴ  

🧰 ᴛᴏᴏʟꜱ & ᴄᴏɴᴠᴇʀꜱɪᴏɴꜱ  
│ ⬡ ᴄᴀʟᴄᴜʟᴀᴛᴇ  
│ ⬡ ʙɪɴᴀʀʏ  
│ ⬡ ᴅʙɪɴᴀʀʏ  
│ ⬡ ʙᴀsᴇ64  
│ ⬡ ᴜɴʙᴀsᴇ64  
│ ⬡ ᴜʀʟᴇɴᴄᴏᴅᴇ  
│ ⬡ ᴜʀʟᴅᴇᴄᴏᴅᴇ  
│ ⬡ ss  
│ ⬡ ᴄᴀᴘᴛɪᴏɴ  
│ ⬡ ᴛʀᴛ  
│ ⬡ ɢᴘᴀss  

📦 ᴀᴘɪꜱ & ᴛᴇᴍᴘ ꜱᴇʀᴠɪᴄᴇꜱ  
│ ⬡ ᴄʀᴇᴀᴛᴇᴀᴘɪ  
│ ⬡ ᴛᴇᴍᴘɴᴜᴍ  
│ ⬡ ᴠᴄᴄ  
│ ⬡ ᴏᴛᴘʙᴏx  
│ ⬡ ᴛᴇᴍᴘᴍᴀɪʟ  
│ ⬡ ᴄʜᴇᴄᴋᴍᴀɪʟ  


╰─────────

> ${config.DESCRIPTION}`,
                image: true
            },
            '9': {
                title: "💞 *Reactions Menu* 💞",
                content: `

╭─➒ *ʀᴇᴀᴄᴛɪᴏɴꜱ ᴍᴇɴᴜ* ➒─

🎭 ʀᴇᴀᴄᴛɪᴏɴ ᴇᴍᴏᴛɪᴏɴs
│ ⬡ ᴄʀʏ
│ ⬡ ʙʟᴜsʜ
│ ⬡ sᴍɪʟᴇ
│ ⬡ ʜᴀᴘᴘʏ
│ ⬡ ᴄʀɪɴɢᴇ
│ ⬡ sᴍᴜɢ
│ ⬡ ᴡɪɴᴋ

🤗 ᴄᴜᴛᴇ & ᴡʜᴏʟᴇsᴏᴍᴇ
│ ⬡ ᴄᴜᴅᴅʟᴇ
│ ⬡ ʜᴜɢ
│ ⬡ ᴀᴡᴏᴏ
│ ⬡ ᴘᴀᴛ
│ ⬡ ʜᴀɴᴅʜᴏʟᴅ
│ ⬡ ʜɪɢʜғɪᴠᴇ
│ ⬡ ᴡᴀᴠᴇ
│ ⬡ ɢʟᴏᴍᴘ

😈 sɪʟʟʏ & sᴀssʏ
│ ⬡ ʙᴜʟʟʏ
│ ⬡ ʙᴏɴᴋ
│ ⬡ ʏᴇᴇᴛ
│ ⬡ ʟɪᴄᴋ
│ ⬡ ɴᴏᴍ
│ ⬡ ᴘᴏᴋᴇ
│ ⬡ ᴅᴀɴᴄᴇ

💥 ɪɴᴛᴇɴsᴇ ᴀᴄᴛɪᴏɴs
│ ⬡ ᴋɪʟʟ
│ ⬡ sʟᴀᴘ
│ ⬡ ᴋɪss


╰────────

> ${config.DESCRIPTION}`,
                image: true
            },
                        '10': {
                title: "🏠 *Main Menu* 🏠",
                content: `
╭──➓ *ᴍᴀɪɴ ᴍᴇɴᴜ* ➓──
│
│ ℹ️ *ʙᴏᴛ ɪɴғᴏ*✪
│────────
│ • ping
│ • env
│ • live
│ • alive
│ • runtime
│ • uptime
│ • repo
│ • owner
│ • user
│ • help
│ • time
│ • date
│ • report
│ • fetch
│ • githubstalk
│ • support
╰─✪
╭─❍
│ 🛠️ *ᴄᴏɴʀᴏʟs*
│────────
│ • menu
│ • menu2
│ • menu3 /allmenu
│ • restart
╰─✪

> ${config.DESCRIPTION}`,
            image: true
            },
             '11': {
                title: "🏠 *LOGO CMD* 🏠",
                content: `
╭──⓫ *ʟᴏɢᴏ ᴍᴇɴᴜ* ⓫──

🎨 ʟᴏɢᴏ & ᴛᴇxᴛ sᴛʏʟᴇs

│ ⬡ 3ᴅᴄᴏᴍɪᴄ
│ ⬡ 3ᴅᴘᴀᴘᴇʀ
│ ⬡ ɴᴇᴏɴʟɪɢʜᴛ
│ ⬡ ғᴜᴛᴜʀɪsᴛɪᴄ
│ ⬡ ᴄʟᴏᴜᴅs
│ ⬡ ɢᴀʟᴀxʏ
│ ⬡ ʟᴇᴀғ
│ ⬡ sᴜɴsᴇᴛ
│ ⬡ ᴅᴇᴠɪʟᴡɪɴɢs
│ ⬡ ᴀɴɢᴇʟᴡɪɴɢs
│ ⬡ ʙɪʀᴛʜᴅᴀʏ
│ ⬡ ʙʟᴀᴄᴋᴘɪɴᴋ
│ ⬡ ᴛʏᴘᴏɢʀᴀᴘʜʏ
│ ⬡ ᴢᴏᴅɪᴀᴄ
│ ⬡ ʟᴜxᴜʀʏ
│ ⬡ ᴘᴀɪɴᴛ

🦸 ᴄʜᴀʀᴀᴄᴛᴇʀ ᴛʜᴇᴍᴇᴅ
│ ⬡ ᴅʀᴀɢᴏɴʙᴀʟʟ
│ ⬡ ᴅᴇᴀᴅᴘᴏᴏʟ
│ ⬡ ɴᴀʀᴜᴛᴏ
│ ⬡ ᴛʜᴏʀ
│ ⬡ ᴀᴍᴇʀɪᴄᴀ
│ ⬡ ʜᴀᴄᴋᴇʀ
│ ⬡ ᴄᴀsᴛʟᴇ
│ ⬡ ғʀᴏᴢᴇɴ

😈 ғᴜɴ & sʏᴍʙᴏʟɪᴄ
│ ⬡ ᴄᴀᴛ
│ ⬡ sᴀᴅɢɪʀʟ
│ ⬡ ᴘᴏʀɴʜᴜʙ
│ ⬡ ɴɪɢᴇʀɪᴀ
│ ⬡ ʙᴏᴏᴍ
│ ⬡ ʙᴜʟʙ
│ ⬡ ᴛᴀᴛᴏᴏ
│ ⬡ ᴇʀᴀsᴇʀ
│ ⬡ ʙᴇᴀʀ

📺 ᴍɪsᴄ & ʟᴀʙᴇʟs
│ ⬡ sᴀɴs
│ ⬡ ʏᴛʟᴏɢᴏ

╰─✪

> ${config.DESCRIPTION}`,
                image: true
                },
            '12': {
                title: "🎐 *Settings Menu* 🎐",
                content: `

⚙️ ᴀᴜᴛᴏᴍᴀᴛɪᴏɴ & ʙᴇʜᴀᴠɪᴏʀ  

│ ⬡ ᴀᴜᴛᴏ-ᴛʏᴘɪɴɢ  
│ ⬡ ᴀᴜᴛᴏ-ʀᴇᴄᴏʀᴅɪɴɢ  
│ ⬡ ᴀᴜᴛᴏ-sᴇᴇɴ  
│ ⬡ ᴀʟᴡᴀʏs-ᴏɴʟɪɴᴇ  
│ ⬡ ᴀᴜᴛᴏ-ᴠᴏɪᴄᴇ  
│ ⬡ ᴀᴜᴛᴏ-sᴛɪᴄᴋᴇʀ  
│ ⬡ ᴀᴜᴛᴏ-ʀᴇᴘʟʏ  
│ ⬡ ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ  
│ ⬡ sᴛᴀᴛᴜs-ʀᴇᴀᴄᴛ  
│ ⬡ sᴛᴀᴛᴜs-ʀᴇᴘʟʏ  

👮 ᴀᴅᴍɪɴ & ꜱᴇᴄᴜʀɪᴛʏ  
│ ⬡ ᴀᴅᴍɪɴ-ᴇᴠᴇɴᴛs  
│ ⬡ ᴀɴᴛɪᴅᴇʟᴇᴛᴇ  
│ ⬡ ᴀɴᴛɪ-ʙᴀᴅ  
│ ⬡ sᴇᴛᴘʀᴇғɪx  
│ ⬡ sᴇᴛᴠᴀʀ  
│ ⬡ ᴍᴏᴅᴇ  

💬 ʀᴇᴘʟɪᴇꜱ & ɪɴᴛᴇʀᴀᴄᴛɪᴏɴꜱ  
│ ⬡ ᴡᴇʟᴄᴏᴍᴇ  
│ ⬡ ғᴀᴋᴇᴛʏᴘɪɴɢ  
│ ⬡ ғᴀᴋᴇʀᴇᴄᴏʀᴅɪɴɢ  
│ ⬡ ᴍᴇɴᴛɪᴏɴ-ʀᴇᴘʟʏ  
│ ⬡ ʀᴇᴀᴅ-ᴍᴇssᴀɢᴇ  
│ ⬡ ʜᴇᴀʀᴛʀᴇᴀᴄᴛ  

╰──────────●●►

> 📌 *ɴᴏᴛᴇ*: ᴀᴅᴅ "ᴏɴ/ᴏғғ" ᴡɪᴛʜ ᴛʜᴇ ᴅᴇsɪʀᴇᴅ sᴛᴀᴛᴇ ᴛᴏ ᴇɴᴀʙʟᴇ ᴏʀ ᴅɪsᴀʙʟᴇ ᴍᴏsᴛ ᴏ̄ ᴇ̄ ᴀʙᴏᴠᴇ👆 ғᴇᴀᴛᴜʀᴇs. ᴇɢ .ᴀᴜᴛᴏʀᴇᴀᴄᴛ ᴏɴ

📊 ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅs ʟɪsᴛ sᴇᴛᴛɪɴɢs: 25

> ${config.DESCRIPTION}`,
                image: true
            }
        };

        // Message handler with improved error handling
        const handler = async (msgData) => {
            try {
                const receivedMsg = msgData.messages[0];
                if (!receivedMsg?.message || !receivedMsg.key?.remoteJid) return;

                const isReplyToMenu = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;
                
                if (isReplyToMenu) {
                    const receivedText = receivedMsg.message.conversation || 
                                      receivedMsg.message.extendedTextMessage?.text;
                    const senderID = receivedMsg.key.remoteJid;

                    if (menuData[receivedText]) {
                        const selectedMenu = menuData[receivedText];
                        
                        try {
                            if (selectedMenu.image) {
                                await conn.sendMessage(
                                    senderID,
                                    {
                                        image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/qumhu4.jpg' },
                                        caption: selectedMenu.content,
                                        contextInfo: contextInfo
                                    },
                                    { quoted: receivedMsg }
                                );
                            } else {
                                await conn.sendMessage(
                                    senderID,
                                    { text: selectedMenu.content, contextInfo: contextInfo },
                                    { quoted: receivedMsg }
                                );
                            }

                            await conn.sendMessage(senderID, {
                                react: { text: '✅', key: receivedMsg.key }
                            });

                        } catch (e) {
                            console.log('Menu reply error:', e);
                            await conn.sendMessage(
                                senderID,
                                { text: selectedMenu.content, contextInfo: contextInfo },
                                { quoted: receivedMsg }
                            );
                        }

                    } else {
                        await conn.sendMessage(
                            senderID,
                            {
                                text: `❌ *Invalid Option!* ❌\n\nPlease reply with a number between 1-12 to select a menu.\n\n*Example:* Reply with "1" for Download Menu\n\n> ${config.DESCRIPTION}`,
                                contextInfo: contextInfo
                            },
                            { quoted: receivedMsg }
                        );
                    }
                }
            } catch (e) {
                console.log('Handler error:', e);
            }
        };

        // Add listener
        conn.ev.on("messages.upsert", handler);

        // Remove listener after 5 minutes
        setTimeout(() => {
            conn.ev.off("messages.upsert", handler);
        }, 300000);

    } catch (e) {
        console.error('Menu Error:', e);
        try {
            await conn.sendMessage(
                from,
                { text: `❌ Menu system is currently busy. Please try again later.\n\n> ${config.DESCRIPTION}` },
                { quoted: mek }
            );
        } catch (finalError) {
            console.log('Final error handling failed:', finalError);
        }
    }
});
*/
