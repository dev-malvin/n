const axios = require("axios");
const { malvin } = require("../malvin");

malvin({
  pattern: "quoteimage",
  alias: ["qimg", "quoteimg", "inspire"],
  desc: "Get a motivational quote on a background image.",
  category: "fun",
  react: "🖼️",
  filename: __filename
}, async (conn, m, store, { from, reply }) => {
  try {
    // Get quote
    const res = await axios.get("https://zenquotes.io/api/random");
    const content = res.data[0]?.q;
    const author = res.data[0]?.a || "Unknown";

    // Use an open quote image API (Luminai / ZenQuotes / Custom)
    const imageUrl = `https://api.luminai.my.id/api/image/quote?quote=${encodeURIComponent(content)}&author=${encodeURIComponent(author)}`;

    await conn.sendMessage(from, {
      image: { url: imageUrl },
      caption: `🖋️ _"${content}"_\n\n— ${author}\n\n🔖 𝙶𝚎𝚗𝚎𝚛𝚊𝚝𝚎𝚍 𝚋𝚢 *𝙼𝙰𝙻𝚅𝙸𝙽-𝚇𝙳*`,
    }, { quoted: m });

  } catch (e) {
    console.error("❌ QuoteImage Error:", e.message);
    reply("⚠️ _𝙲𝚘𝚞𝚕𝚍 𝚗𝚘𝚝 𝚐𝚎𝚗𝚎𝚛𝚊𝚝𝚎 𝚚𝚞𝚘𝚝𝚎 𝚒𝚖𝚊𝚐𝚎. 𝚃𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚕𝚊𝚝𝚎𝚛._");
  }
});
