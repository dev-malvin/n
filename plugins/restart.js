const { malvin } = require('../malvin');
const { sleep } = require('../lib/functions');
const { exec } = require('child_process');

malvin({
  pattern: "restart",
  alias: ["reboot", "refresh"],
  desc: "Restart the MALVIN-XD bot system",
  category: "system",
  react: "♻️",
  filename: __filename,
  ownerOnly: true
}, async (conn, mek, m, { reply }) => {
  try {
    // Initial Notification
    await reply(`
♻️ *MALVIN-XD BOT RESTART INITIATED!*

🔁 Restarting in *3 seconds*...
🛑 Please do not send commands until the bot is fully back online.
`.trim());

    // Countdown
    await sleep(1000);
    await reply("⏳ Restarting in *2*...");
    await sleep(1000);
    await reply("⏳ Restarting in *1*...");
    await sleep(1000);

    // Final message before execution
    await reply(`
⚡ *System Restarting Now...*
🔌 Estimated downtime: 15–20 seconds
🧠 Auto-reconnect will handle bot reactivation.
`);

    // Execute the restart command
    exec("pm2 restart all", (error) => {
      if (error) {
        console.error("Restart error:", error);
        return reply(`❌ *Restart Failed:*\n${error.message}\n\nTry running \`pm2 restart all\` manually.`);
      }
    });

  } catch (e) {
    console.error("Restart failed:", e);
    reply(`🚫 *Restart Error:*\n${e.message}\n\nManual restart may be required.`);
  }
});
