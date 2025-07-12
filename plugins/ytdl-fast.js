const { malvin } = require('../malvin');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../settings');
const ffmpeg = require('fluent-ffmpeg');

malvin({
    pattern: "play",
    alias: ["ytplay", "ytmp3"],
    react: "📲",
    desc: "Download YouTube audio by name or link",
    category: "download",
    use: '.play <song name or YouTube URL>',
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        let input = q || (m.quoted && m.quoted.text?.trim());
        if (!input) return reply("❓ *Please enter a song name or YouTube link!*");

        await reply("🔍 *Searching YouTube...*");

        // Search
        const search = await ytsearch(input);
        const vid = search?.results?.[0];
        if (!vid || !vid.url) return reply("❌ *No results found!*");

        const title = vid.title.replace(/[^\w\s]/gi, "").slice(0, 40);
        const videoUrl = vid.url;
        const thumbnail = vid.thumbnail;
        const duration = vid.timestamp || "Unknown";
        const outputPath = path.join(__dirname, `${title}.mp3`);

        const apis = [
        
            `https://apis-malvin.vercel.app/download/dlmp3?url=${videoUrl}`,
            `https://apis.davidcyriltech.my.id/youtube/mp3?url=${videoUrl}`,
            `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${videoUrl}`,
            `https://api.dreaded.site/api/ytdl/audio?url=${videoUrl}`
        ];

        let success = false;
        for (const api of apis) {
            try {
                const res = await axios.get(api);
                const audioUrl = res.data?.result?.downloadUrl || res.data?.url;
                if (!audioUrl) continue;

                const stream = await axios({ url: audioUrl, method: "GET", responseType: "stream" });
                if (stream.status !== 200) continue;

                await new Promise((resolve, reject) => {
                    ffmpeg(stream.data)
                        .audioCodec('libmp3lame')
                        .format('mp3')
                        .save(outputPath)
                        .on('end', resolve)
                        .on('error', reject);
                });

                // Send result
                await conn.sendMessage(from, {
                    document: fs.readFileSync(outputPath),
                    fileName: `${title}.mp3`,
                    mimetype: 'audio/mp3',
                    caption: `
╭───〘 🎧 𝙿𝙻𝙰𝚈 𝚁𝙴𝚂𝚄𝙻𝚃 〙───◆
│ 📝 *ᴛɪᴛʟᴇ:* ${vid.title}
│ ⏱️ *ᴅᴜʀᴀᴛɪᴏɴ:* ${duration}
│ 🔗 *ʟɪɴᴋ:* ${videoUrl}
╰───────────────◆
> Powered by ᴍᴀʟᴠɪɴ-ᴇɴɢɪɴᴇ ⚙️
                    `.trim()
                }, { quoted: mek });

                fs.unlinkSync(outputPath);
                success = true;
                break;

            } catch (err) {
                console.warn("⚠️ API failed:", api, err.message);
                continue;
            }
        }

        if (!success) {
            reply("🚫 *All servers failed. Try again later.*");
        }

    } catch (e) {
        console.error("❌ Error in .play:", e);
        reply("🚨 *Something went wrong!*\n" + e.message);
    }
});
