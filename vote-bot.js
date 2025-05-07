const steem = require('steem');

const WIF_POSTING_KEY = process.env.POSTING_KEY;
const VOTER = 'lumi2024';
const TAG = 'crypto';
const VOTE_WEIGHT = 100;  // en %

steem.api.getDiscussionsByTrending({ tag: TAG, limit: 5 }, (err, posts) => {
  if (err) return console.error('❌ Erreur de récupération:', err);

  const target = posts.find(p => p.author !== VOTER); // éviter de voter pour soi-même

  if (!target) {
    console.log('ℹ️ Aucun post éligible trouvé.');
    process.exit(0);
    return;
  }

  console.log(`🔍 Ciblage du post: ${target.author}/${target.permlink}`);

  steem.broadcast.vote(
    WIF_POSTING_KEY,
    VOTER,
    target.author,
    target.permlink,
    VOTE_WEIGHT * 100,
    (err, result) => {
      if (err) {
        console.error('❌ Erreur lors du vote:', err.message || err);
      } else {
        console.log(`✅ Vote réussi pour ${target.author}/${target.permlink}`);
      }
      process.exit(0);
    }
  );
});
