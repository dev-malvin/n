const { malvin } = require("../malvin");
const { downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys");

malvin({
  pattern: "post",
  alias: ["poststatus", "status", "story", "repost", "reshare"],
  react: "📤",
  desc: "Post replied media to bot's WhatsApp status",
  category: "owner",
  filename: __filename
}, async (conn, mek, m, { isOwner, reply }) => {
  try {
    if (!isOwner) return reply("🚫 *Owner-only command.*");

    if (!m.quoted || !m.quoted.message) {
      return reply("⚠️ *Reply to an image, video, or audio message.*");
    }

    const quoted = m.quoted;
    const messageType = getContentType(quoted.message);
    const mediaMsg = quoted.message[messageType];

    if (!["imageMessage", "videoMessage", "audioMessage"].includes(messageType)) {
      return reply("❌ *Unsupported media type. Only image, video, and audio are allowed.*");
    }

    const mime = mediaMsg.mimetype || '';
    const caption = mediaMsg.caption || m.text || '';

    // Download media
    const stream = await downloadContentFromMessage(mediaMsg, messageType.replace("Message", "").toLowerCase());
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Prepare media content
    let statusMedia = {};
    if (messageType === "imageMessage") {
      statusMedia = { image: buffer, caption };
    } else if (messageType === "videoMessage") {
      statusMedia = { video: buffer, caption };
    } else if (messageType === "audioMessage") {
      statusMedia = {
        audio: buffer,
        mimetype: "audio/mp4",
        ptt: mediaMsg?.ptt || false
      };
    }

    // Send to status
    await conn.sendMessage("status@broadcast", statusMedia);
    reply("✅ *Status posted successfully!*");

  } catch (err) {
    console.error("❌ Error in .post command:", err);
    reply(`⚠️ *Failed to post status:* ${err.message}`);
  }
});
