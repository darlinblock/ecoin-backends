const { Telegraf } = require("telegraf");
const express = require("express");
const admin = require("firebase-admin");
const { db } = require("./utils/firebase");
const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Webhook Handler
bot.start(async (ctx) => {
  try {
    const user = ctx.from;
    const telegramId = user.id.toString();
    const referralCode = ctx.startPayload || null;
    
    const userRef = db.collection("users").doc(telegramId);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      // Generate referral code from Telegram ID
      const refCode = `ECO-${telegramId}`;
      
      // Create new user with complete structure
      const newUser = {
        // Identity
        telegram_id: telegramId,
        username: user.username ? `@${user.username}` : 'Ecoin',
        first_name: user.first_name || 'Eco',
        last_name: user.last_name || 'Miners',
        profileurl: user.photo_url || 'https://gateway.pinata.cloud/ipfs/bafybeic2lbckwamkgm3t55xmvg6j6vsdciax5gooek3htvkxseinimq46y',
        registered_at: admin.firestore.FieldValue.serverTimestamp(),
        last_active: admin.firestore.FieldValue.serverTimestamp(),
        
        // Wallet
        wallet_address: null,
        presale_balance: 0,
        mining_balance: 0,
        total_withdrawn: 0,
        
        // Referral
        ref_code: refCode,
        referred_by: null,
        referrals: [],
        active_miners: [],
        referral_bonus: 0,
        
        // Mining
        base_hashrate: 0.1,
        bonus_hashrate: 0,
        total_hashrate: 0.1,
        is_mining: false,
        mining_start_time: null,
        mining_end_time: null,
        last_claim: null
      };

      // Process referral if exists
      if (referralCode) {
        const referrerId = referralCode.replace('ECO-', '');
        const referrerRef = db.collection("users").doc(referrerId);
        const referrer = await referrerRef.get();

        if (referrer.exists && referrer.id !== telegramId) {
          newUser.referred_by = referrer.id;
          
          await referrerRef.update({
            referrals: admin.firestore.FieldValue.arrayUnion(telegramId),
            bonus_hashrate: admin.firestore.FieldValue.increment(0.1),
            total_hashrate: admin.firestore.FieldValue.increment(0.1)
          });
        }
      }

      await userRef.set(newUser);
      
      // Welcome message with logo and buttons
      await ctx.replyWithPhoto(
        { url: `https://gateway.pinata.cloud/ipfs/bafybeibqbay4tbzr2azii4y27xlltvdqbqp6kwhseioiqbtmtzbiji6sfm` }, // Replace with your logo URL
        {
          caption: `🎉 *Welcome to ECoin Miner, ${user.first_name || 'User'}💞*\n\n` +
                   `Your referral code: *${refCode}*\n` +
                   `Share it to earn bonuses!`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '▶️ Start Mining', web_app: { url: "https:www.google.com" } }],
              [{ text: '👥 Join Community', url: 'https://t.me/yourgroup' }] // Replace with your group link
            ]
          }
        }
      );
    } else {
      // Update last active time for existing user
      await userRef.update({
        last_active: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Welcome back message with logo and buttons
      await ctx.replyWithPhoto(
        { url: 'https://example.com/logo.png' }, // Replace with your logo URL
        {
          caption: `👋 *Welcome back, ${user.first_name || 'User'}!*\n\n` +
                   `Your referral code: *${userSnapshot.data().ref_code}*\n` +
                   `Continue earning with us!`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '▶️ Continue Mining', web_app: { url: process.env.MINI_APP_URL } }],
              [{ text: '👥 Join Community', url: 'https://t.me/chainphonPX' }] // Replace with your group link
            ]
          }
        }
      );
    }

  } catch (error) {
    console.error('Error in start handler:', error);
    await ctx.reply('⚠️ An error occurred. Please try again later.');
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('⚠️ An error occurred. Please try again.');
});

// Setup webhook endpoint
app.use(express.json());
app.use(bot.webhookCallback("/webhook"));
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/webhook`);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('Bot is running');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot running on port ${PORT}`);
});
