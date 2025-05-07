const steem = require('steem');

const WIF_POSTING_KEY = process.env.POSTING_KEY;
const VOTER = 'lumi2024';
const TARGET_TAG = 'crypto';
const VOTE_WEIGHT = 100;

function isEligible(post) {
  const postTime = new Date(post.created + 'Z');
  const now = new Date();
  const ageMs = now - postTime;

  let tags = [];
  try {
    const md = JSON.parse(post.json_metadata || '{}');
    tags = md.tags || [];
  } catch (e) {}

  return (
    tags.includes(TARGET_TAG) &&
    ageMs > 5 * 60 * 1000 &&
    ageMs < 60 * 60 * 1000 &&
    post.author !== VOTER &&
    !post.active_votes.some(v => v.voter === VOTER)
  );
}

steem.api.getDiscussionsByCreated({ tag: '', limit: 30 }, (err, posts) => {
  if (err) {
    console.error('❌ Erreur récupération posts :', err);
    process.exit(1);
  }

  const target = posts.find(isEligible);

  if (!target) {
    console.log('ℹ️ Aucun post crypto récent trouvé.');
    process.exit(0);
    return;
  }

  console.log(`🔍 Ciblé : ${target.author}/${target.permlink}`);

  steem.broadcast.vote(
    WIF_POSTING_KEY,
    VOTER,
    target.author,
    target.permlink,
    VOTE_WEIGHT * 100,
    (err, result) => {
      if (err) {
        console.error('❌ Erreur de vote :', err.message || err);
      } else {
        console.log(`✅ Voté avec succès pour ${target.author}/${target.permlink}`);
      }
      process.exit(0);
    }
  );
});
