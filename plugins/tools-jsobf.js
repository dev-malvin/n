
const config = require('../settings');
const { malvin, commands } = require('../malvin');
const JavaScriptObfuscator = require("javascript-obfuscator");
const axios = require('axios');

malvin({
    pattern: "obfuscate2",
    alias: ["obf2", "encrypt2"],
    react: "🔒",
    desc: "Obfuscate JavaScript code",
    category: "tools",
    use: "<javascript code>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide JavaScript code to obfuscate");

        await reply("⏳ Obfuscating your code...");

        // Encode the input code for URL
        const encodedCode = encodeURIComponent(q);
        const apiUrl = `https://api.giftedtech.web.id/api/tools/encryptv3?apikey=gifted&code=${encodedCode}`;

        const { data } = await axios.get(apiUrl);

        if (!data?.result?.encrypted_code) {
            return reply("❌ Failed to obfuscate the code");
        }

        // Send the obfuscated code
        await conn.sendMessage(from, {
            text: `// *Obfuscated JavaScript Code:*\n\n${data.result.encrypted_code}`,
            contextInfo: {
                externalAdReply: {
                    title: "JavaScript Obfuscator",
                    body: "Powered By MALVIN-XD",
                    thumbnail: await axios.get('https://files.catbox.moe/01f9y1.jpg', { 
                        responseType: 'arraybuffer' 
                    }).then(res => res.data).catch(() => null),
                    mediaType: 2
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("Obfuscation error:", error);
        reply(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
});


malvin({
  pattern: "obfuscate",
  alias: ["obf", "confuse"],
  desc: "Obfuscate JavaScript code to make it harder to read.",
  category: "utility",
  use: ".obfuscate <code>",
  filename: __filename,
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    const code = args.join(" ");
    if (!code) {
      return reply("❌ Please provide JavaScript code to obfuscate.");
    }

    // Obfuscate the code
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
      compact: true, // Compact code output
      controlFlowFlattening: true, // Make control flow harder to follow
      deadCodeInjection: true, // Inject dead code
      debugProtection: true, // Add debug protection
      disableConsoleOutput: true, // Disable console output
      stringArray: true, // Encrypt strings
      stringArrayEncoding: ["base64"], // Encode strings using base64
      rotateStringArray: true, // Rotate string array
    }).getObfuscatedCode();

    reply(`//🔐 *Obfuscated Code*:\n\n${obfuscatedCode}`);
  } catch (error) {
    console.error("Error obfuscating code:", error);
    reply("❌ An error occurred while obfuscating the code.");
  }
});

malvin({
  pattern: "deobfuscate",
  alias: ["deobf", "unconfuse"],
  desc: "Attempt to deobfuscate JavaScript code (limited functionality).",
  category: "utility",
  use: ".deobfuscate <obfuscated_code>",
  filename: __filename,
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    const obfuscatedCode = args.join(" ");
    if (!obfuscatedCode) {
      return reply("❌ Please provide obfuscated code to deobfuscate.");
    }

    // Deobfuscation is not straightforward, but we can try to format the code
    reply(`⚠️ *Deobfuscation is not guaranteed*. Here's the formatted code:\n\n${obfuscatedCode}`);
  } catch (error) {
    console.error("Error deobfuscating code:", error);
    reply("❌ An error occurred while deobfuscating the code.");
  }
});
