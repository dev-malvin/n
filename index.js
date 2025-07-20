// Anti-crash Handlers
process.on("uncaughtException", (err) => {
  console.error("[❗] Uncaught Exception:", err.stack || err.message);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[❗] Unhandled Promise Rejection:", reason);
});

// Dependencies with Optimized Imports
const axios = require("axios");
const config = require("./settings");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  downloadContentFromMessage,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  fetchLatestBaileysVersion,
  Browsers,
} = require(config.BAILEYS);
const { log: l } = console;
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  isUrl,
  runtime,
  fetchJson,
} = require("./lib/functions");
const {
  AntiDelDB,
  initializeAntiDeleteSettings,
  setAnti,
  getAnti,
  saveContact,
  loadMessage,
  getName,
  saveGroupMetadata,
  getGroupMetadata,
  saveMessageCount,
  saveMessage,
} = require("./data");
const fs = require("fs").promises; // Using promises API for async file operations
const path = require("path");
const os = require("os");
const P = require("pino")({ level: "silent" });
const qrcode = require("qrcode-terminal");
const chalk = require("chalk");
const express = require("express");
const { getPrefix } = require("./lib/prefix");

// Constants
const ownerNumber = ["263780934873"];
const app = express();
const port = process.env.PORT || 7860;

// Temporary Directory Management
const tempDir = path.join(os.tmpdir, "cache-temp");
(async () => {
  if (!(await fs.access(tempDir).then(() => true).catch(() => false))) {
    await fs.mkdir(tempDir, { recursive: true });
  }
})();

const clearTempDir = async () => {
  try {
    const files = await fs.readdir(tempDir);
    await Promise.all(
      files.map((file) =>
        fs.unlink(path.join(tempDir, file)).catch((err) => l("[⚠️] Failed to delete file:", err))
      )
    );
  } catch (err) {
    l("[❌] Error clearing temp directory:", err);
  }
};
setInterval(clearTempDir, 5 * 60 * 1000);

// Session Management
const sessionDir = path.join(__dirname, "sessions");
const credsPath = path.join(sessionDir, "creds.json");

(async () => {
  if (!(await fs.access(sessionDir).then(() => true).catch(() => false))) {
    await fs.mkdir(sessionDir, { recursive: true });
  }
})();

async function loadSession() {
  try {
    if (!config.SESSION_ID) {
      l(chalk.red("No SESSION_ID provided - QR login will be generated"));
      return null;
    }
    l(chalk.yellow("[⏳] Downloading creds data..."));
    l(chalk.cyan("[🆔️] Downloading MEGA.nz session..."));

    const megaFileId = config.SESSION_ID.startsWith("malvin~")
      ? config.SESSION_ID.replace("malvin~", "")
      : config.SESSION_ID;
    const filer = File.fromURL(`https://mega.nz/file/${megaFileId}`);
    const data = await new Promise((resolve, reject) =>
      filer.download((err, data) => (err ? reject(err) : resolve(data)))
    );
    await fs.writeFile(credsPath, data);
    l(chalk.green("[✅] MEGA session downloaded successfully"));
    return JSON.parse(data.toString());
  } catch (error) {
    l("❌ Error loading session:", error.message);
    l(chalk.green("Will generate QR code instead"));
    return null;
  }
}

async function connectToWA() {
  l(chalk.cyan("[🟠] Connecting to WhatsApp ⏳️..."));
  const creds = await loadSession();

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir, {
    creds: creds || undefined,
  });

  const { version } = await fetchLatestBaileysVersion();
  const conn = makeWASocket({
    logger: P,
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version,
    getMessage: async () => ({}),
  });

  conn.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === "close") {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        l(chalk.red("[⏳️] Connection lost, reconnecting..."));
        setTimeout(connectToWA, 5000);
      } else {
        l(chalk.red("[🛑] Connection closed, please change session ID"));
      }
    } else if (connection === "open") {
      l("[🧩] Plugins installed successfully ✅");

      const pluginPath = path.join(__dirname, "plugins");
      const plugins = (await fs.readdir(pluginPath)).filter(
        (file) => path.extname(file).toLowerCase() === ".js"
      );
      for (const plugin of plugins) {
        require(path.join(pluginPath, plugin));
      }

      l(chalk.green("[🤖] MALVIN XD Connected ✅"));

      try {
        const botname = "ᴍᴀʟᴠɪɴ-xᴅ";
        const ownername = "ᴍᴀʟᴠɪɴ ᴋɪɴɢ";
        const malvin = {
          key: { remoteJid: "status@broadcast", participant: "0@s.whatsapp.net" },
          message: {
            newsletterAdminInviteMessage: {
              newsletterJid: "120363402507750390@newsletter",
              newsletterName: "ᴍᴀʟᴠɪɴ ᴛᴇᴄʜ🪀",
              caption: `${botname} ʙʏ ${ownername}`,
              inviteExpiration: 0,
            },
          },
        };

        const prefix = getPrefix();
        const username = "XdKing2";
        const mrmalvin = `https://github.com/${username}`;
        const upMessage = `\`Malvin Bot Connected!\` ✅\n\n> _One of the Best W.A Bot._\n\n────────────────\n> 🌟 \`Star Repo\` : ${config.REPO}\n> 🪄 \`Follow Us\` : ${mrmalvin}\n> ⛔ \`Bot Prefix\` ${prefix}\n> 📺 \`ʏᴏᴜᴛᴜʙᴇ ᴛᴜᴛᴏʀɪᴀʟꜱ\` : https://youtube.com/@malvintech2\n────────────────\n\n> © ${ownername} | Connected at ${new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" })} on July 20, 2025`;

        await conn.sendMessage(conn.user.id, {
          image: { url: "https://files.catbox.moe/01f9y1.jpg" },
          caption: upMessage,
        });

        const newsletterChannels = [
          "120363402507750390@newsletter",
          "120363419136706156@newsletter",
          "120363420267586200@newsletter",
        ];
        const [followed, alreadyFollowing, failed] = await (async () => {
          const results = [[], [], []];
          for (const channelJid of newsletterChannels) {
            try {
              const metadata = await conn.newsletterMetadata("jid", channelJid);
              if (metadata.viewer_metadata === null) {
                await conn.newsletterFollow(channelJid);
                results[0].push(channelJid);
              } else {
                results[1].push(channelJid);
              }
            } catch (error) {
              results[2].push(channelJid);
              l(`❌ Failed to follow ${channelJid}:`, error.message);
            }
          }
          return results;
        })();
        const summary = `📡 Newsletter Follow Status:\n\n✅ Followed: ${followed.length} channel(s)\n📌 Already following: ${alreadyFollowing.length} channel(s)${failed.length > 0 ? `\n❌ Failed: ${failed.length} channel(s)` : ""}\n\n💡 Tip: Following these channels keeps your bot updated.`;
        l(chalk.cyan(summary.trim()));
      } catch (sendError) {
        l("[🔴] Error sending messages:", sendError);
      }
    }

    if (qr) {
      l(chalk.red("[🟢] Scan the QR code to connect or use session ID"));
    }
  });

  conn.ev.on("creds.update", saveCreds);

  conn.ev.on("messages.upsert", async (mek) => {
    try {
      mek = mek.messages[0];
      if (!mek.message) return;

      mek.message =
        getContentType(mek.message) === "ephemeralMessage"
          ? mek.message.ephemeralMessage.message
          : mek.message;

      if (config.READ_MESSAGE === "true") {
        await conn.readMessages([mek.key]);
        l(chalk.cyan(`[📖] Marked message from ${mek.key.remoteJid} as read`));
      }

      if (mek.message.viewOnceMessageV2) {
        mek.message =
          getContentType(mek.message) === "ephemeralMessage"
            ? mek.message.ephemeralMessage.message
            : mek.message;
      }

      if (mek.key?.remoteJid === "status@broadcast" && config.AUTO_STATUS_SEEN === "true") {
        await conn.readMessages([mek.key]);
        l(chalk.cyan(`[📺] Auto-read status from ${mek.key.participant}`));
      }

      const newsletterJids = [
        "120363402507750390@newsletter",
        "120363419136706156@newsletter",
        "120363420267586200@newsletter",
      ];
      if (mek.key?.remoteJid && newsletterJids.includes(mek.key.remoteJid)) {
        try {
          const serverId = mek.newsletterServerId;
          if (serverId) {
            const emoji = ["❤️", "🔥", "😯"][Math.floor(Math.random() * 3)];
            await conn.newsletterReactMessage(mek.key.remoteJid, serverId.toString(), emoji);
            l(chalk.cyan(`[😺] Reacted to newsletter ${mek.key.remoteJid} with ${emoji}`));
          }
        } catch (e) {
          l(chalk.red(`[❌] Newsletter reaction failed: ${e.message}`));
        }
      }

      if (mek.key?.remoteJid === "status@broadcast" && config.AUTO_STATUS_REACT === "true") {
        const kingmalvin = await conn.decodeJid(conn.user.id);
        const emoji = [
          "❤️",
          "💸",
          "😇",
          "🍂",
          "💥",
          "💯",
          "🔥",
          "💫",
          "💎",
          "💗",
          "🤍",
          "🖤",
          "👀",
          "🙌",
        ][Math.floor(Math.random() * 14)];
        await conn.sendMessage(mek.key.remoteJid, {
          react: { text: emoji, key: mek.key },
        }, { statusJidList: [mek.key.participant, kingmalvin] });
        l(chalk.cyan(`[😺] Reacted to status from ${mek.key.participant} with ${emoji}`));
      }

      if (mek.key?.remoteJid === "status@broadcast" && config.AUTO_STATUS_REPLY === "true") {
        const user = mek.key.participant;
        const text = config.AUTO_STATUS_MSG || "Thanks for the update!";
        await conn.sendMessage(user, { text, react: { text: "💜", key: mek.key } }, { quoted: mek });
        l(chalk.cyan(`[📩] Replied to status from ${user} with: ${text}`));
      }

      await saveMessage(mek).catch((err) =>
        l(chalk.red(`[❌] Failed to save message: ${err.message}`))
      );

      const m = sms(conn, mek);
      const type = getContentType(mek.message) || "unknown";
      const from = mek.key.remoteJid;
      const isGroup = from.endsWith("@g.us");
      const sender = mek.key.fromMe
        ? conn.user.id.split(":")[0] + "@s.whatsapp.net"
        : mek.key.participant || mek.key.remoteJid;
      const senderNumber = sender.split("@")[0];
      const botNumber = conn.user.id.split(":")[0];
      const pushname = mek.pushName || "Sin Nombre";
      const isMe = botNumber.includes(senderNumber);
      const isOwner = ownerNumber.includes(senderNumber) || isMe;
      const botNumber2 = await jidNormalizedUser(conn.user.id);
      const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(() => ({})) : {};
      const groupName = isGroup ? groupMetadata.subject : "";
      const participants = isGroup ? groupMetadata.participants || [] : [];
      const groupAdmins = isGroup ? getGroupAdmins(participants) : [];
      const isBotAdmins = isGroup && groupAdmins.includes(botNumber2);
      const isAdmins = isGroup && groupAdmins.includes(sender);
      const reply = (text) => conn.sendMessage(from, { text }, { quoted: mek });

      const bannedUsers = JSON.parse(await fs.readFile("./lib/ban.json", "utf-8"));
      if (bannedUsers.includes(sender)) {
        l(chalk.red(`[🚫] Ignored message from banned user: ${sender}`));
        return;
      }

      const ownerFile = JSON.parse(await fs.readFile("./lib/sudo.json", "utf-8"));
      const ownerNumberFormatted = `${config.OWNER_NUMBER}@s.whatsapp.net`;
      const isFileOwner = ownerFile.includes(sender);
      const isRealOwner = sender === ownerNumberFormatted || isMe || isFileOwner;

      if (!isRealOwner && config.MODE === "private") {
        l(chalk.red(`[🚫] Ignored in private mode from ${sender}`));
        return;
      }
      if (!isRealOwner && isGroup && config.MODE === "inbox") {
        l(chalk.red(`[🚫] Ignored in group ${groupName} from ${sender} in inbox mode`));
        return;
      }
      if (!isRealOwner && !isGroup && config.MODE === "groups") {
        l(chalk.red(`[🚫] Ignored in private chat from ${sender} in groups mode`));
        return;
      }

      const body =
        type === "conversation"
          ? mek.message.conversation
          : type === "extendedTextMessage"
          ? mek.message.extendedTextMessage.text
          : type === "imageMessage" && mek.message.imageMessage.caption
          ? mek.message.imageMessage.caption
          : type === "videoMessage" && mek.message.videoMessage.caption
          ? mek.message.videoMessage.caption
          : "";
      const isCmd = body?.startsWith(getPrefix());
      const command = isCmd ? body.slice(getPrefix().length).trim().split(" ")[0].toLowerCase() : "";
      const args = body?.trim().split(/ +/).slice(1) || [];
      const q = args.join(" ");
      const text = args.join(" ");

      if (!isCmd) return;

      const events = require("./malvin");
      const cmd = events.commands.find((c) => c.pattern === command) || events.commands.find((c) => c.alias?.includes(command));
      if (!cmd) {
        l(chalk.yellow(`[⚠️] Unknown command: ${command} from ${pushname} (${sender})`));
        return;
      }

      l(chalk.cyan(`[📡] Command: ${command} | Sender: ${pushname} (${sender}) | Chat: ${isGroup ? groupName : "Private"}`));
      if (cmd.react) {
        await conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
        l(chalk.cyan(`[😺] Reacted with ${cmd.react} for ${command}`));
      }

      try {
        await cmd.function(conn, mek, m, {
          from,
          quoted: type === "extendedTextMessage" && mek.message.extendedTextMessage.contextInfo?.quotedMessage,
          body,
          isCmd,
          command,
          args,
          q,
          text,
          isGroup,
          sender,
          senderNumber,
          botNumber2,
          botNumber,
          pushname,
          isMe,
          isOwner,
          isCreator: isRealOwner,
          groupMetadata,
          groupName,
          participants,
          groupAdmins,
          isBotAdmins,
          isAdmins,
          reply,
        });
        l(chalk.green(`[✅] Executed ${command} by ${pushname} in ${isGroup ? groupName : "Private"}`));
      } catch (e) {
        l(chalk.red(`[❌] Error in ${command}: ${e.message}`));
        reply(`Error: ${e.message}`);
      }
    } catch (e) {
      l(chalk.red(`[❌] Messages.upsert error: ${e.message}`));
    }
  });

  // Utility Methods
  conn.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/: \d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {};
      return (decode.user && decode.server && `${decode.user}@${decode.server}`) || jid;
    }
    return jid;
  };

  conn.copyNForward = async (jid, message, forceForward = false, options = {}) => {
    let vtype;
    if (options.readViewOnce) {
      message.message = message.message.ephemeralMessage?.message || message.message;
      vtype = Object.keys(message.message.viewOnceMessage.message)[0];
      delete message.message.viewOnceMessage.message[vtype].viewOnce;
      message.message = { ...message.message.viewOnceMessage.message };
    }

    const mtype = Object.keys(message.message)[0];
    const content = await generateForwardMessageContent(message, forceForward);
    const ctype = Object.keys(content)[0];
    const context = mtype !== "conversation" ? message.message[mtype].contextInfo : {};
    content[ctype].contextInfo = { ...context, ...content[ctype].contextInfo };
    const waMessage = await generateWAMessageFromContent(jid, content, options);
    await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
    return waMessage;
  };

  conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    const quoted = message.msg || message;
    const mime = quoted.mimetype || "";
    const messageType = message.mtype?.replace(/Message/gi, "") || mime.split("/")[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    const buffer = await stream.reduce((acc, chunk) => Buffer.concat([acc, chunk]), Buffer.alloc(0));
    const type = await FileType.fromBuffer(buffer);
    const trueFileName = attachExtension ? `${filename}.${type.ext}` : filename;
    await fs.writeFile(trueFileName, buffer);
    return trueFileName;
  };

  conn.downloadMediaMessage = async (message) => {
    const mime = (message.msg || message).mimetype || "";
    const messageType = message.mtype?.replace(/Message/gi, "") || mime.split("/")[0];
    const stream = await downloadContentFromMessage(message, messageType);
    return await stream.reduce((acc, chunk) => Buffer.concat([acc, chunk]), Buffer.alloc(0));
  };

  conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
    const { headers } = await axios.head(url);
    const mime = headers["content-type"];
    if (mime.split("/")[1] === "gif") {
      return conn.sendMessage(jid, { video: await getBuffer(url), caption, gifPlayback: true, ...options }, { quoted, ...options });
    }
    if (mime === "application/pdf") {
      return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: "application/pdf", caption, ...options }, { quoted, ...options });
    }
    if (mime.split("/")[0] === "image") {
      return conn.sendMessage(jid, { image: await getBuffer(url), caption, ...options }, { quoted, ...options });
    }
    if (mime.split("/")[0] === "video") {
      return conn.sendMessage(jid, { video: await getBuffer(url), caption, mimetype: "video/mp4", ...options }, { quoted, ...options });
    }
    if (mime.split("/")[0] === "audio") {
      return conn.sendMessage(jid, { audio: await getBuffer(url), caption, mimetype: "audio/mpeg", ...options }, { quoted, ...options });
    }
  };

  conn.cMod = (jid, copy, text = "", sender = conn.user.id, options = {}) => {
    const mtype = Object.keys(copy.message)[0];
    const isEphemeral = mtype === "ephemeralMessage";
    const msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
    const content = msg[mtype];
    if (typeof content === "string") msg[mtype] = text || content;
    else if (content.caption) content.caption = text || content.caption;
    else if (content.text) content.text = text || content.text;
    if (typeof content !== "string") msg[mtype] = { ...content, ...options };
    if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
    if (copy.key.remoteJid.includes("@s.whatsapp.net")) sender = sender || copy.key.remoteJid;
    else if (copy.key.remoteJid.includes("@broadcast")) sender = sender || copy.key.remoteJid;
    copy.key.remoteJid = jid;
    copy.key.fromMe = sender === conn.user.id;
    return proto.WebMessageInfo.fromObject(copy);
  };

  conn.getFile = async (PATH, save) => {
    let res, data;
    data =
      Buffer.isBuffer(PATH) ||
      /^data:.*?\/.*?;base64,/i.test(PATH)
        ? Buffer.from(PATH.split(",")[1], "base64")
        : /^https?:\/\//.test(PATH)
        ? await (res = await getBuffer(PATH))
        : await fs.access(PATH).then(() => fs.readFile(PATH)).catch(() => Buffer.alloc(0));
    const type = await FileType.fromBuffer(data) || { mime: "application/octet-stream", ext: ".bin" };
    const filename = path.join(__dirname, `${Date.now()}.${type.ext}`);
    if (data && save) await fs.writeFile(filename, data);
    return { res, filename, size: await getSizeMedia(data), ...type, data };
  };

  conn.sendFile = async (jid, PATH, fileName, quoted = {}, options = {}) => {
    const { filename, mime, data } = await conn.getFile(PATH, true);
    let type = "", pathFile = filename;
    if (options.asDocument) type = "document";
    else if (options.asSticker || /webp/.test(mime)) {
      const { writeExif } = require("./exif.js");
      pathFile = await writeExif({ mimetype: mime, data }, { packname: config.packname, author: config.author });
      type = "sticker";
    } else if (/image/.test(mime)) type = "image";
    else if (/video/.test(mime)) type = "video";
    else if (/audio/.test(mime)) type = "audio";
    else type = "document";
    await conn.sendMessage(jid, { [type]: { url: pathFile }, mimetype: mime, fileName, ...options }, { quoted, ...options });
    await fs.unlink(pathFile);
  };

  conn.parseMention = async (text) => [...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + "@s.whatsapp.net");

  conn.sendMedia = async (jid, path, fileName = "", caption = "", quoted = "", options = {}) => {
    const { mime, filename } = await conn.getFile(path, true);
    let type = "";
    if (options.asDocument) type = "document";
    else if (options.asSticker || /webp/.test(mime)) {
      const { writeExif } = require("./exif");
      const media = { mimetype: mime, data: await fs.readFile(filename) };
      const pathFile = await writeExif(media, { packname: config.packname, author: config.author });
      type = "sticker";
      await fs.unlink(filename);
      await conn.sendMessage(jid, { sticker: { url: pathFile }, ...options }, { quoted, ...options });
      return fs.unlink(pathFile);
    } else if (/image/.test(mime)) type = "image";
    else if (/video/.test(mime)) type = "video";
    else if (/audio/.test(mime)) type = "audio";
    else type = "document";
    await conn.sendMessage(jid, { [type]: { url: filename }, caption, mimetype: mime, fileName, ...options }, { quoted, ...options });
    await fs.unlink(filename);
  };

  conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
    const buffer = options.packname || options.author ? await writeExifVid(buff, options) : await videoToWebp(buff);
    await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, options);
    await fs.unlink(buffer);
  };

  conn.sendImageAsSticker = async (jid, buff, options = {}) => {
    const buffer = options.packname || options.author ? await writeExifImg(buff, options) : await imageToWebp(buff);
    await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, options);
    await fs.unlink(buffer);
  };

  conn.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
    conn.sendMessage(jid, { text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map((v) => v[1] + "@s.whatsapp.net") }, ...options }, { quoted });

  conn.sendImage = async (jid, path, caption = "", quoted = "", options) => {
    const buffer = await (Buffer.isBuffer(path) ? Promise.resolve(path) : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split(",")[1], "base64") : /^https?:\/\//.test(path) ? getBuffer(path) : fs.readFile(path).catch(() => Buffer.alloc(0)));
    return conn.sendMessage(jid, { image: buffer, caption, ...options }, { quoted });
  };

  conn.sendText = (jid, text, quoted = "", options) => conn.sendMessage(jid, { text, ...options }, { quoted });

  conn.sendButtonText = (jid, buttons = [], text, footer, quoted = "", options = {}) => {
    conn.sendMessage(jid, { text, footer, buttons, headerType: 2, ...options }, { quoted, ...options });
  };

  conn.send5ButImg = async (jid, text = "", footer = "", img, but = [], thumb, options = {}) => {
    const message = await prepareWAMessageMedia({ image: img, jpegThumbnail: thumb }, { upload: conn.waUploadToServer });
    const template = generateWAMessageFromContent(
      jid,
      proto.Message.fromObject({
        templateMessage: { hydratedTemplate: { imageMessage: message.imageMessage, hydratedContentText: text, hydratedFooterText: footer, hydratedButtons: but } },
      }),
      options
    );
    conn.relayMessage(jid, template.message, { messageId: template.key.id });
  };

  conn.getName = async (jid, withoutContact = false) => {
    const id = conn.decodeJid(jid);
    withoutContact = conn.withoutContact || withoutContact;
    let v = id.endsWith("@g.us")
      ? await conn.groupMetadata(id).catch(() => ({}))
      : id === "0@s.whatsapp.net"
      ? { id, name: "WhatsApp" }
      : id === conn.decodeJid(conn.user.id)
      ? conn.user
      : {};
    return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international");
  };

  conn.sendContact = async (jid, kon, quoted = "", opts = {}) => {
    const list = await Promise.all(
      kon.map(async (i) => ({
        displayName: await conn.getName(i + "@s.whatsapp.net"),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i + "@s.whatsapp.net")}\nFN:${global.OwnerName}\nTEL;waid=${i}:${i}\nEMAIL;type=INTERNET:${global.email}\nURL:https://github.com/${global.github}/malvin-xd\nADR:;;${global.location};;;;\nEND:VCARD`,
      }))
    );
    conn.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted });
  };

  conn.setStatus = (status) =>
    conn.query({
      tag: "iq",
      attrs: { to: "@s.whatsapp.net", type: "set", xmlns: "status" },
      content: [{ tag: "status", attrs: {}, content: Buffer.from(status, "utf-8") }],
    }) && status;

  conn.serializeM = (mek) => sms(conn, mek);
}

// Express Setup
app.use(express.static(path.join(__dirname, "lib")));
app.get("/", (req, res) => res.redirect("/malvin.html"));
app.listen(port, () =>
  l(
    chalk.cyan(`
╭──[ 🤖 WELCOME DEAR USER! ]─
│
│ If you enjoy using this bot,
│ please ⭐  Star it & 🍴  Fork it on GitHub!
│ Your support keeps it growing! 💙 
╰─────────`)
  )
);

setTimeout(connectToWA, 4000);
