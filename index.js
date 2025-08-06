const { Telegraf } = require("telegraf");
const express = require("express");
const { db } = require("./utils/firebase");
const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Webhook Handler
bot.start(async (ctx) => {
  const user = ctx.from;
  const ref = ctx.startPayload || null;
  const docRef = db.collection("users").doc(user.id.toString());
  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    await docRef.set({
      telegram_id: user.id.toString(),
      username: user.username || '',
      profileurl: user.photo_url || '',
      refcode: "ECO-" + user.id.toString(),
      referred_by: ref,
      ref_count: 0,
      wallet: null,
      mining_balance: 0,
      presale_balance: 0,
      wallet_balance: 0,
      mining_start_time: new Date(),
      created_at: new Date(),
    });

    if (ref) {
      const inviterRef = db.collection("users").where("refcode", "==", ref);
      const snap = await inviterRef.get();
      snap.forEach((doc) => {
        doc.ref.update({
          ref_count: admin.firestore.FieldValue.increment(1),
        });
      });
    }
  }
  ctx.reply("Welcome to ECoin Miner!");
});

// Setup webhook endpoint
app.use(bot.webhookCallback("/webhook"));
bot.telegram.setWebhook(process.env.WEBHOOK_URL);

// Start server
app.listen(3000, () => console.log("Bot running"));
