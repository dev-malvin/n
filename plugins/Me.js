const config = require('../settings');
const { malvin, commands } = require('../malvin');
const { runtime } = require('../lib/functions');
const axios = require('axios');
const moment = require("moment-timezone");
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
        // Use timezone from settings
        const timezone = config.TIMEZONE || "Africa/Nairobi";
        const currentTime = moment().tz(timezone).format("HH:mm:ss");
        const currentDate = moment().tz(timezone).format("dddd, MMMM Do YYYY");
        const prefix = getPrefix();
        const totalCommands = Object.keys(commands).length;

        const menuCaption = `        
╭═✦〔 🤖 *${config.BOT_NAME}* 〕✦═╮
│ 👤 ᴏᴡɴᴇʀ   : @${config.OWNER_NUMBER}
│ 🌍 ᴍᴏᴅᴇ    : [ ${config.MODE.toUpperCase()} ]
│ ⏰ ᴛɪᴍᴇ    : ${currentTime}
│ 📅 ᴅᴀᴛᴇ    : ${currentDate}
│ 🛠️ ᴘʀᴇғɪx  : [ ${prefix} ]
│ 📈 ᴄᴍᴅs   : ${totalCommands}
│ 🔄 ᴜᴘᴛɪᴍᴇ  : ${runtime(process.uptime())}
│ 👑 ᴅᴇᴠ     : ᴍᴀʟᴠɪɴ ᴋɪɴɢ
│ 🚀 ᴠᴇʀsɪᴏɴ : ${config.version}
╰═✨🌟🌟🌟🌟🌟🌟🌟✨═╯

📚 *ᴍᴇɴᴜ ɴᴀᴠɪɢᴀᴛɪᴏɴ:*
> _ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ ᴛᴏ ᴏᴘᴇɴ ᴀ ᴄᴀᴛᴇɢᴏʀʏ._

╭═✦〔 🌐 *ᴄᴀᴛᴇɢᴏʀʏ ʟɪsᴛ* 〕✦═╮
│
│ ➊ 📥  *ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇɴᴜ*
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
│ ⓭ 🎵  *ᴀᴜᴅɪᴏ ᴍᴇɴᴜ*
│ ⓮ 🔒  *ᴘʀɪᴠᴀᴄʏ ᴍᴇɴᴜ*
│
╰═✨🌟🌟🌟🌟🌟🌟🌟✨═╯

💡 _ᴛʏᴘᴇ_ *${prefix}ᴀʟʟᴍᴇɴᴜ* _ᴛᴏ sᴇᴇ ᴇᴠᴇʀʏᴛʜɪɴɢ._

> ${config.DESCRIPTION}
`;

        // Context for mentioning and newsletter forwarding
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

        // Menu data with image URLs from settings
        const menuData = {
            '1': {
                title: "📥 *Download Menu* 📥",
                content: `
╭═✦〔 📥 *ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇɴᴜ* 〕✦═╮
│
│ 🌐 *sᴏᴄɪᴀʟ ᴍᴇᴅɪᴀ* 🌍
│ ➸ .fbdl
│ ➸ .igimagedl
│ ➸ .igvid
│ ➸ .pindl
│ ➸ .tiktok
│ ➸ .tiktok2
│ ➸ .twitter
│ ➸ .yt
│ ➸ .yt2
│ ➸ .ytpost
│ ➸ .yts
│
│ 💿 *ғɪʟᴇs & ᴀᴘᴘs* 💾
│ ➸ .apk
│ ➸ .gdrive
│ ➸ .gitclone
│ ➸ .mediafire
│ ➸ .mediafire2
│
│ 🎥 *ᴍᴇᴅɪᴀ ᴄᴏɴᴛᴇɴᴛ* 📹
│ ➸ .getimage
│ ➸ .img
│ ➸ .movie
│ ➸ .moviedl
│ ➸ .music
│ ➸ .play
│ ➸ .series
│ ➸ .song
│ ➸ .tovideo
│ ➸ .tovideo2
│ ➸ .video2
│ ➸ .video3
│ ➸ .xvideo
│
│ 📖 *ᴍɪsᴄ* 📚
│ ➸ .bible
│ ➸ .biblelist
│ ➸ .news
│ ➸ .npm
│ ➸ .pair
│ ➸ .tts
│
╰═✨🌟🌟🌟🌟🌟🌟🌟🌟🌟✨═╯

> ${config.DESCRIPTION}`,
                image: true,
                imageUrl: config.MENU_IMAGES?.['1'] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/download_menu.jpg'
            },
            '2': {
                title: "👥 *Group Menu* 👥",
                content: `
╭═✧〔 💬 *ɢʀᴏᴜᴘ ᴍᴇɴᴜ* 〕✧═╮
│
│ 🔧 *ᴍᴀɴᴀɢᴇᴍᴇɴᴛ* 🛠️
│ ⬢ .requestlist
│ ⬢ .acceptall
│ ⬢ .rejectall
│ ⬢ .removemembers
│ ⬢ .removeadmins
│ ⬢ .removeall2
│ ⬢ .groupsprivacy
│ ⬢ .updategdesc
│ ⬢ .updategname
│ ⬢ .revoke
│ ⬢ .ginfo
│ ⬢ .newgc
│
│ 👥 *ɪɴᴛᴇʀᴀᴄᴛɪᴏɴ* 🤝
│ ⬢ .join
│ ⬢ .invite
│ ⬢ .hidetag
│ ⬢ .tagall
│ ⬢ .tagadmins
│ ⬢ .poll
│ ⬢ .broadcast2
│
│ 🔒 *sᴇᴄᴜʀɪᴛʏ* 🛡️
│ ⬢ .lockgc
│ ⬢ .unlockgc
│ ⬢ .unmute
│ ⬢ .antilink
│ ⬢ .antilinkkick
│ ⬢ .deletelink
│ ⬢ .antibot
│ ⬢ .delete
│ ⬢ .closetime
│ ⬢ .opentime
│ ⬢ .notify
│
│ 👑 *ᴀᴅᴍɪɴ* 🧑‍💼
│ ⬢ .add
│ ⬢ .bulkdemote
│ ⬢ .demote
│ ⬢ .out
│ ⬢ .promote
│ ⬢ .remove
│
╰═✨🔥🔥🔥🔥🔥🔥🔥🔥🔥✨═╯

> ${config.DESCRIPTION}`,
                image: true,
                imageUrl: config.MENU_IMAGES?.['2'] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/group_menu.jpg'
            },
            '3': {
                title: "😄 *Fun Menu* 😄",
                content: `
╭═✦〔 🕹️ *ғᴜɴ ᴍᴇɴᴜ* 〕✦═╮
│
│ 🎲 *ɢᴀᴍᴇs* 🎮
│ ✪ .8ball
│ ✪ .coinflip
│ ✪ .guessnumber
│ ✪ .rps
│ ✪ .tictactoe
│ ✪ .truth
│ ✪ .dare
│ ✪ .quiz
│ ✪ .roll
│
│ 😄 *sᴏᴄɪᴀʟ* 💖
│ ✪ .angry
│ ✪ .compliment
│ ✪ .confused
│ ✪ .cute
│ ✪ .flirt
│ ✪ .happy
│ ✪ .heart
│ ✪ .kiss
│ ✪ .lovetest
│ ✪ .loveyou
│ ✪ .sad
│ ✪ .shy
│ ✪ .couplepp
│ ✪ .ship
│
│ 🔥 *ᴇɴᴛᴇʀᴛᴀɪɴᴍᴇɴᴛ* 🎉
│ ✪ .animequote
│ ✪ .didyouknow
│ ✪ .fact
│ ✪ .joke
│ ✪ .pickupline
│ ✪ .quote
│ ✪ .quoteimage
│ ✪ .spamjoke
│
│ 🎨 *ᴄʀᴇᴀᴛɪᴠᴇ* 🖌️
│ ✪ .aura
│ ✪ .character
│ ✪ .emoji
│ ✪ .emix
│ ✪ .fancy
│ ✪ .rcolor
│ ✪ .ringtone
│
│ ⚙️ *ᴍɪsᴄ* 🛠️
│ ✪ .compatibility
│ ✪ .count
│ ✪ .countx
│ ✪ .flip
│ ✪ .hack
│ ✪ .hot
│ ✪ .konami
│ ✪ .marige
│ ✪ .moon
│ ✪ .nikal
│ ✪ .pick
│ ✪ .pray4me
│ ✪ .rate
│ ✪ .remind
│ ✪ .repeat
│ ✪ .rw
│ ✪ .send
│ ✪ .shapar
│ ✪ .shout
│ ✪ .squidgame
│ ✪ .suspension
│
│ 🔞 *ɴsғᴡ* 🚫
│ ✪ .anal
│ ✪ .ejaculation
│ ✪ .erec
│ ✪ .nsfw
│ ✪ .nude
│ ✪ .orgasm
│ ✪ .penis
│ ✪ .sex
│ ✪ .suspension
│
╰═✨🌟🌟🌟🌟🌟🌟🌟🌟🌟✨═╯

> ${config.DESCRIPTION}`,
                image: true,
                imageUrl: config.MENU_IMAGES?.['3'] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/fun_menu.jpg'
            },
            '4': {
                title: "👑 *Owner Menu* 👑",
                content: `
╭═✧〔 👑 *ᴏᴡɴᴇʀ ᴍᴇɴᴜ* 〕✧═╮
│
│ 🔧 *ʙᴏᴛ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ* 🛠️
│ ➟ .admin
│ ➟ .setbotimage
│ ➟ .setbotname
│ ➟ .setownername
│ ➟ .setreacts
│ ➟ .shutdown
│ ➟ .restart
│ ➟ .update
│ ➟ .dev
│ ➟ .delsudo
│ ➟ .setsudo
│ ➟ .listsudo
│
│ 🚫 *ᴜsᴇʀ ᴄᴏɴᴛʀᴏʟ* 🚷
│ ➟ .ban
│ ➟ .unban
│ ➟ .block
│ ➟ .unblock
│ ➟ .listban
│
│ 📢 *ᴄᴏᴍᴍᴜɴɪᴄᴀᴛɪᴏɴ* 📣
│ ➟ .broadcast
│ ➟ .channelreact
│ ➟ .forward
│ ➟ .msg
│ ➟ .post
│
│ 🔍 *ɪɴғᴏʀᴍᴀᴛɪᴏɴ* 🔎
│ ➟ .getpp
│ ➟ .getprivacy
│ ➟ .gjid
│ ➟ .jid
│ ➟ .person
│ ➟ .savecontact
│
│ 🎨 *ᴄᴏɴᴛᴇɴᴛ* 🖼️
│ ➟ .pp
│ ➟ .sticker
│ ➟ .take
│ ➟ .dailyfact
│
│ 🔐 *sᴇᴄᴜʀɪᴛʏ* 🛡️
│ ➟ .anti-call
│ ➟ .clearchats
│
│ ⚙️ *ᴍɪsᴄ* 🛠️
│ ➟ .leave
│ ➟ .vv
│ ➟ .vv2
│ ➟ .vv4
│
╰═✨🔥🔥🔥🔥🔥🔥🔥🔥🔥✨═╯

> ${config.DESCRIPTION}`,
                image: true,
                imageUrl: config.MENU_IMAGES?.['4'] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/owner_menu.jpg'
            },
            '5': {
                title: "🤖 *AI Menu* 🤖",
                content: `
╭═✦〔 🧠 *ᴀɪ ᴍᴇɴᴜ* 〕✦═╮
│
│ 🤖 *ᴀɪ ᴍᴏᴅᴇʟs* 🧠
│ ⬣ .ai
│ ⬣ .deepseek
│ ⬣ .fluxai
│ ⬣ .llama3
│ ⬣ .malvin
│ ⬣ .metaai
│ ⬣ .openai
│ ⬣ .stabilityai
│ ⬣ .stablediffusion
│
╰═✨🌟🌟🌟🌟🌟🌟✨═╯

> ${config.DESCRIPTION}`,
                image: true,
                imageUrl: config.MENU_IMAGES?.['5'] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/ai_menu.jpg'
            },
            '6': {
                title: "🎎 *Anime Menu* 🎎",
                content: `
╭═✧〔 🌸 *ᴀɴɪᴍᴇ ᴍᴇɴᴜ* 〕✧═╮
│
│ 🌸 *ᴄʜᴀʀᴀᴄᴛᴇʀs* 🎀
│ ⊸ .animegirl
│ ⊸ .animegirl1
│ ⊸ .animegirl2
│ ⊸ .animegirl3
│ ⊸ .animegirl4
│ ⊸ .animegirl5
│ ⊸ .megumin
│ ⊸ .neko
│ ⊸ .waifu
│
│ 😺 *ᴀɴɪᴍᴀʟs* 🐾
│ ⊸ .awoo
│ ⊸ .cat
│ ⊸ .dog
│
│ 👗 *ᴄᴏsᴘʟᴀʏ* 👘
│ ⊸ .garl
│ ⊸ .maid
│
╰═✨🔥🔥🔥🔥🔥🔥🔥✨═╯

> ${config.DESCRIPTION}`,
                image: true,
                imageUrl: config.MENU_IMAGES?.['6'] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/anime_menu.jpg'
            },
            '7': {
                title: "🔄 *Convert Menu* 🔄",
                content: `
╭═✦〔 🔁 *ᴄᴏɴᴠᴇʀᴛ ᴍᴇɴᴜ* 〕✦═╮
│
│ 🖼️ *ɪᴍᴀɢᴇs* 📸
│ ✷ .blur
│ ✷ .grey
│ ✷ .imgjoke
│ ✷ .invert
│ ✷ .jail
│ ✷ .nokia
│ ✷ .rmbg
│ ✷ .wanted
│
│ 🎙️ *ᴀᴜᴅɪᴏ* 🎵
│ ✷ .aivoice
│ ✷ .tomp3
│ ✷ .toptt
│ ✷ .tts2
│ ✷ .tts3
│
│ 📄 *ғɪʟᴇs* 📑
│ ✷ .convert
│ ✷ .topdf
│ ✷ .vsticker
│
│ 🔗 *ᴜᴛɪʟɪᴛʏ* 🔧
│ ✷ .ad
│ ✷ .attp
│ ✷ .readmore
│ ✷ .tinyurl
│
╰═✨🌟🌟🌟🌟🌟🌟🌟✨═╯

> ${config.DESCRIPTION}`,
                image: true,
                imageUrl: config.MENU_IMAGES?.['7'] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/convert_menu.jpg'
            },
            '8': {
                title: "📌 *Other Menu* 📌",
                content: `
╭═✧〔 🧩 *ᴏᴛʜᴇʀ ᴍᴇɴᴜ* 〕✧═╮
│
│ 🔍 *ɪɴғᴏ* 📚
│ ├─ .countryinfo
│ ├─ .define
│ ├─ .weather
│ ├─ .wikipedia
│
│ 🌐 *sᴛᴀʟᴋɪɴɢ* 🌍
│ ├─ .tiktokstalk
│ ├─ .xstalk
│ ├─ .ytstalk
│ ├─ .githubstalk
│
│ 🔐 *ᴄᴏᴅɪɴɢ* 💻
│ ├─ .base64
│ ├─ .unbase64
│ ├─ .binary
│ ├─ .dbinary
│ ├─ .urlencode
│ ├─ .urldecode
│
│ ⚙️ *ᴜᴛɪʟɪᴛɪᴇs* 🛠️
│ ├─ .calculate
│ ├─ .caption
│ ├─ .checkmail
│ ├─ .createapi
│ ├─ .gpass
│ ├─ .imgscan
│ ├─ .npm
│ ├─ .otpbox
│ ├─ .srepo
│ ├─ .tempmail
│ ├─ .tempnum
│ ├─ .trt
│ ├─ .vcc
│ ├─ .wastalk
│ ├─ .cancelallreminders
│ ├─ .cancelreminder
│ ├─ .check
│ ├─ .myreminders
│ ├─ .reminder
│ ├─ .tourl
│
│ 📸 *ɪᴍᴀɢᴇs* 🖼️
│ ├─ .remini
│ ├─ .screenshot
│
╰═✨🔥🔥🔥🔥🔥🔥🔥🔥🔥✨═╯

> ${config.DESCRIPTION}`,
                image: true,
                imageUrl: config.MENU_IMAGES?.['8'] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/other_menu.jpg'
            },
            '9': {
                title: "💞 *Reaction Menu* 💞",
                content: `
╭═✦〔 💫 *ʀᴇᴀᴄᴛɪᴏɴ ᴍᴇɴᴜ* 〕✦═╮
│
│ 😄 *ᴘᴏsɪᴛɪᴠᴇ* 💖
│ ⬩ .blush
│ ⬩ .cuddle
│ ⬩ .happy
│ ⬩ .highfive
│ ⬩ .hug
│ ⬩ .kiss
│ ⬩ .lick
│ ⬩ .nom
│ ⬩ .pat
│ ⬩ .smile
│ ⬩ .wave
│
│ 😺 *ᴘʟᴀʏғᴜʟ* 🎉
│ ⬩ .awoo
│ ⬩ .dance
│ ⬩ .glomp
│ ⬩ .handhold
│ ⬩ .poke
│ ⬩ .wink
│
│ 😈 *ᴛᴇᴀsɪɴɢ* 😜
│ ⬩ .bite
│ ⬩ .bonk
│ ⬩ .bully
│ ⬩ .cringe
│ ⬩ .cry
│ ⬩ .kill
│ ⬩ .slap
│ ⬩ .smug
│ ⬩ .yeet
│
╰═✨🌟🌟🌟🌟🌟🌟🌟✨═╯

> ${config.DESCRIPTION}`,
                image: true,
                imageUrl: config.MENU_IMAGES?.['9'] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/reaction_menu.jpg'
            },
            '10': {
                title: "🏠 *Main Menu* 🏠",
                content: `
╭═✧〔 🏕️ *ᴍᴀɪɴ ᴍᴇɴᴜ* 〕✧═╮
│
│ 🤖 *sᴛᴀᴛᴜs* 📊
│ ⊹ .alive
│ ⊹ .alive2
│ ⊹ .online
│ ⊹ .ping
│ ⊹ .ping2
│ ⊹ .uptime
│ ⊹ .version
│
│ 📅 *sʏsᴛᴇᴍ* ⏰
│ ⊹ .date
│ ⊹ .time
│
│ 📚 *ɪɴғᴏ* ℹ️
│ ⊹ .bothosting
│ ⊹ .env
│ ⊹ .fetch
│ ⊹ .repo
│ ⊹ .support
│
│ 🆘 *ʜᴇʟᴘ* ❓
│ ⊹ .help
│ ⊹ .menu
│ ⊹ .menu2
│ ⊹ .menu3
│ ⊹ .list
│ ⊹ .report
│
│ 👤 *ᴏᴡɴᴇʀ* 👑
│ ⊹ .owner
│
╰═✨🔥🔥🔥🔥🔥🔥✨═╯

> ${config.DESCRIPTION}`,
                image: true,
                imageUrl: config.MENU_IMAGES?.['10'] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/main_menu.jpg'
            },
            '11': {
                title: "🎨 *Logo Maker* 🎨",
                content: `
╭═✦〔 🎨 *ʟᴏɢᴏ ᴍᴀᴋᴇʀ* 〕✦═╮
│
│ 🎨 *ᴛʜᴇᴍᴇs* 🌟
│ ⬢ .america
│ ⬢ .blackpink
│ ⬢ .naruto
│ ⬢ .nigeria
│ ⬢ .pornhub
│ ⬢ .sadgirl
│ ⬢ .thor
│ ⬢ .zodiac
│
│ ✨ *ᴇғғᴇᴄᴛs* 💥
│ ⬢ .3dcomic
│ ⬢ .3dpaper
│ ⬢ .boom
│ ⬢ .bulb
│ ⬢ .clouds
│ ⬢ .frozen
│ ⬢ .futuristic
│ ⬢ .galaxy
│ ⬢ .luxury
│ ⬢ .neonlight
│ ⬢ .sunset
│ ⬢ .typography
│ ⬢ .ytlogo
│
│ 🦁 *ᴄʜᴀʀᴀᴄᴛᴇʀs* 🐾
│ ⬢ .angelwings
│ ⬢ .bear
│ ⬢ .cat
│ ⬢ .deadpool
│ ⬢ .devilwings
│ ⬢ .dragonball
│ ⬢ .sans
│
│ 🖌️ *ᴄʀᴇᴀᴛɪᴠᴇ* 🎨
│ ⬢ .birthday
│ ⬢ .castle
│ ⬢ .eraser
│ ⬢ .hacker
│ ⬢ .leaf
│ ⬢ .paint
│ ⬢ .tatoo
│
╰═✨🌟🌟🌟🌟🌟🌟🌟🌟🌟✨═╯

> ${config.DESCRIPTION}`,
                image: true,
                imageUrl: config.MENU_IMAGES?.['11'] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/logo_maker_menu.jpg'
            },
            '12': {
                title: "⚙️ *Settings Menu* ⚙️",
                content: `
╭═✧〔 ⚙️ *sᴇᴛᴛɪɴɢs ᴍᴇɴᴜ* 〕✧═╮
│
│ 🤖 *ʙᴇʜᴀᴠɪᴏʀ* 🤖
│ ➢ .aichat
│ ➢ .auto-react
│ ➢ .auto-recording
│ ➢ .auto-reply
│ ➢ .auto-seen
│ ➢ .auto-sticker
│ ➢ .auto-typing
│ ➢ .auto-voice
│ ➢ .customreact
│ ➢ .fakerecording
│ ➢ .faketyping
│ ➢ .heartreact
│ ➢ .ownerreact
│ ➢ .status-react
│ ➢ .status-reply
│
│ 🔧 *ɢʀᴏᴜᴘ* 👥
│ ➢ .admin-events
│ ➢ .goodbye
│ ➢ .welcome
│ ➢ .mention-reply
│
│ ⚙️ *sʏsᴛᴇᴍ* 🛠️
│ ➢ .always-online
│ ➢ .mode
│ ➢ .setprefix
│ ➢ .setvar
│
│ 🛡️ *ғɪʟᴛᴇʀs* 🔒
│ ➢ .anti-bad
│ ➢ .antidelete
│
│ 📝 *ᴘʀᴏғɪʟᴇ* 🧑
│ ➢ .autobio
│
╰═✨🔥🔥🔥🔥🔥🔥🔥✨═╯

> ${config.DESCRIPTION}`,
                image: true,
                imageUrl: config.MENU_IMAGES?.['12'] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/settings_menu.jpg'
            },
            '13': {
                title: "🎵 *Audio Menu* 🎵",
                content: `
╭═✦〔 🎵 *ᴀᴜᴅɪᴏ ᴍᴇɴᴜ* 〕✦═╮
│
│ 🎵 *ᴇғғᴇᴄᴛs* 🎶
│ ⬩ .baby
│ ⬩ .bass
│ ⬩ .blown
│ ⬩ .chipmunk
│ ⬩ .deep
│ ⬩ .demon
│ ⬩ .earrape
│ ⬩ .fast
│ ⬩ .fat
│ ⬩ .nightcore
│ ⬩ .radio
│ ⬩ .reverse
│ ⬩ .robot
│ ⬩ .slow
│ ⬩ .smooth
│ ⬩ .tupai
│
╰═✨🌟🌟🌟🌟🌟🌟✨═╯

> ${config.DESCRIPTION}`,
                image: true,
                imageUrl: config.MENU_IMAGES?.['13'] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/audio_menu.jpg'
            },
            '14': {
                title: "🔒 *Privacy Menu* 🔒",
                content: `
╭═✧〔 🔒 *ᴘʀɪᴠᴀᴄʏ ᴍᴇɴᴜ* 〕✧═╮
│
│ 🔒 *sᴇᴛᴛɪɴɢs* 🛡️
│ ✷ .anticall
│ ✷ .blocklist
│ ✷ .getbio
│ ✷ .groupsprivacy
│ ✷ .privacy
│ ✷ .setmyname
│ ✷ .setonline
│ ✷ .setppall
│ ✷ .updatebio
│ ✷ .pmblock
│
╰═✨🔥🔥🔥🔥🔥🔥🔥✨═╯

> ${config.DESCRIPTION}`,
                image: true,
                imageUrl: config.MENU_IMAGES?.['14'] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/privacy_menu.jpg'
            }
        };

        // Message handler remains unchanged
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
                                        image: { url: selectedMenu.imageUrl },
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
                                text: `❌ *Invalid Option!* ❌\n\nPlease reply with a number between 1-14 to select a menu.\n\n*Example:* Reply with "1" for Download Menu\n\n> ${config.DESCRIPTION}`,
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

        conn.ev.on("messages.upsert", handler);
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
