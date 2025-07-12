const axios = require("axios");
const config = require('../settings');
const { malvin } = require("../malvin");

malvin({
  pattern: "tiktok",
  alias: ["tt", "tiktokdl"],
  react: '📥',
  desc: "Download TikTok video or audio",
  category: "download",
  use: ".tiktok <url>",
  filename: __filename
}, async (conn, m, mek, { from, args, reply }) => {
  const tiktokUrl = args[0];

  if (!tiktokUrl || !tiktokUrl.includes("tiktok.com")) {
    return reply("❌ Provide a valid TikTok URL.");
  }

  await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

  // Try primary API first
  let data;
  try {
    const res = await axios.get(`https://api.nexoracle.com/downloader/tiktok-nowm?apikey=free_key@maher_apis&url=${encodeURIComponent(tiktokUrl)}`);
    if (res.data?.status === 200) data = res.data.result;
  } catch (_) {}

  // Fallback: tikwm.com
  if (!data) {
    try {
      const fallback = await axios.get(`https://api.tikwm.com/?url=${encodeURIComponent(tiktokUrl)}&hd=1`);
      if (fallback.data?.data) {
        const r = fallback.data.data;
        data = {
          title: r.title,
          author: {
            username: r.author.unique_id,
            nickname: r.author.nickname
          },
          metrics: {
            digg_count: r.digg_count,
            comment_count: r.comment_count,
            share_count: r.share_count,
            download_count: r.download_count
          },
          url: r.play,
          music: { url: r.music },
          thumbnail: r.cover
        };
      }
    } catch (err) {
      return reply("❌ TikTok download failed from both APIs.");
    }
  }

  if (!data) return reply("❌ TikTok media not found.");

  const { title, author, url, music, metrics, thumbnail } = data;

  const caption = `🎬 *TɪᴋTᴏᴋ Dᴏᴡɴʟᴏᴀᴅᴇʀ*\n
╭─❍ ᴍᴀʟᴠɪɴ-ᴡᴏʀʟᴅ ❍
┊🎵 *Title:* ${title}
┊👤 *Author:* @${author.username} (${author.nickname})
┊❤️ *Likes:* ${metrics.digg_count}
┊💬 *Comments:* ${metrics.comment_count}
┊🔁 *Shares:* ${metrics.share_count}
┊📥 *Downloads:* ${metrics.download_count}
╰─❍
_Reply with:_ 
*1* for 📥 Video  
*2* for 🎧 Audio

> ${config.FOOTER || "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀʟᴠɪɴ-xᴅ"}`;

  const preview = await conn.sendMessage(from, {
    image: { url: thumbnail },
    caption
  }, { quoted: mek });

  const msgId = preview.key.id;

  conn.ev.on('messages.upsert', async ({ messages }) => {
    const replyMsg = messages[0];
    if (!replyMsg?.message) return;

    const text = replyMsg.message.conversation || replyMsg.message.extendedTextMessage?.text;
    const isReplyTo = replyMsg.message?.extendedTextMessage?.contextInfo?.stanzaId === msgId;
    if (!isReplyTo) return;

    try {
      const loading = await conn.sendMessage(from, { text: '⏳ Processing your download...' }, { quoted: mek });

      if (text === "1") {
        const videoBuffer = Buffer.from((await axios.get(url, { responseType: 'arraybuffer' })).data, 'binary');
        await conn.sendMessage(from, {
          video: videoBuffer,
          caption: `🎥 Video by @${author.username}`
        }, { quoted: mek });

      } else if (text === "2") {
        if (!music?.url) return reply("❌ No audio found.");
        const audioBuffer = Buffer.from((await axios.get(music.url, {
          responseType: 'arraybuffer',
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })).data, 'binary');

        await conn.sendMessage(from, {
          audio: audioBuffer,
          mimetype: 'audio/mp4',
          fileName: `${author.username}.mp3`,
          ptt: false
        }, { quoted: mek });

      } else {
        return reply("❌ Invalid choice. Reply with *1* or *2*.");
      }

      await conn.sendMessage(from, { text: "✅ Sent!", edit: loading.key });

    } catch (err) {
      console.error("❌ Download error:", err);
      await reply("❌ Failed to send media.");
    }
  });
});
