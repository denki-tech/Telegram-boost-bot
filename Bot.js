const { Telegraf } = require('telegraf');
const config = require('./config');
const userCommands = require('./commands/user');
const adminCommands = require('./commands/admin');
const referralCommands = require('./commands/referral');
const { showMenu } = require('./utils/menu');
const { addUser } = require('./services/database');
const { verifyChannelMembership } = require('./utils/verify'); // <-- added here

const bot = new Telegraf(config.BOT_TOKEN);

bot.use((ctx, next) => {
  ctx.isAdmin = config.ADMINS.includes(ctx.from.id);
  addUser(ctx.from.id, ctx.from.username || "unknown");
  return next();
});

bot.start(async (ctx) => {
  ctx.reply(`Welcome ${ctx.from.first_name}! Please follow our channel @${config.CHANNEL_USERNAME} to continue.`);

  const verified = await verifyChannelMembership(bot, ctx); // <-- verification check
  if (verified) {
    showMenu(ctx, ctx.isAdmin);
  } else {
    ctx.reply(`You must join @${config.CHANNEL_USERNAME} first, then type /start again.`);
  }
});

userCommands(bot);
adminCommands(bot);
referralCommands(bot);

bot.launch();
console.log("Bot running...");

