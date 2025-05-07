const steem = require('steem');

const WIF_POSTING_KEY = process.env.POSTING_KEY;
const VOTER           = 'lumi2024';
const TARGET_TAG      = 'crypto';
const VOTE_WEIGHT     = 100;

let voted = false;

steem.api.streamOperations((err, op) => {
  if (voted) return;
  if (err) return console.error(err);
  if (op[0] === 'comment' && op[1].parent_author === '') {
    try {
      const md = JSON.parse(op[1].json_metadata || '{}');
      if ((md.tags || []).includes(TARGET_TAG)) {
        console.log('🔍 Post trouvé:', op[1].author, op[1].permlink);
        steem.broadcast.vote(
          process.env.POSTING_KEY,
          VOTER,
          op[1].author,
          op[1].permlink,
          VOTE_WEIGHT * 100,
          (e, r) => {
            if (e) {
              console.error('❌ Erreur de vote:', e.message || e);
            } else {
              console.log('✅ Voté avec succès:', op[1].author, op[1].permlink);
              voted = true;
              process.exit(0);
            }
          }
        );
      }
    } catch (e) {}
  }
});
