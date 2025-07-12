const { malvin } = require("../malvin");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

malvin({
  pattern: "post",
  alias: ["poststatus", "status", "story", "repost", "reshare"],
  react: "📝",
  desc: "Post replied media to bot's WhatsApp status",
  category: "owner",
  filename: __filename
}, 
async (conn, mek, m, { isOwner, reply }) => {
  try {
    if (!isOwner) return reply("🚫 *Owner-only command.*");

    const quoted = m.quoted;
    if (!quoted || !quoted.message) {
      return reply("⚠️ *Reply to an image, video, or audio to post to status.*");
    }

    const messageType = Object.keys(quoted.message)[0];
    const mediaMsg = quoted.message[messageType];
    const mime = mediaMsg.mimetype || '';
    const caption = mediaMsg.caption || '';

    const isImage = messageType === "imageMessage";
    const isVideo = messageType === "videoMessage";
    const isAudio = messageType === "audioMessage";

    if (!isImage && !isVideo && !isAudio) {
      return reply("❌ *Unsupported media type. Only image, video, and audio allowed.*");
    }

    // Download media buffer
    const stream = await downloadContentFromMessage(mediaMsg, isImage ? 'image' : isVideo ? 'video' : 'audio');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    // Prepare status content
    let statusContent;
    if (isImage) {
      statusContent = { image: buffer, caption };
    } else if (isVideo) {
      statusContent = { video: buffer, caption };
    } else {
      statusContent = { audio: buffer, mimetype: "audio/mp4", ptt: mediaMsg.ptt || false };
    }

    await conn.sendMessage("status@broadcast", statusContent);
    return reply("✅ *Status posted successfully!*");

  } catch (e) {
    console.error("❌ Error posting status:", e);
    return reply("⚠️ *Failed to post status:*\n" + e.message);
  }
});
