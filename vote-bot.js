const steem = require('steem');

const WIF_POSTING_KEY = process.env.POSTING_KEY;  // Met dans GitHub Secrets
const VOTER = 'lumi2024';
const TAG = 'crypto';
const VOTE_WEIGHT = 100; // en %

// Vérifie si le post respecte les critères
function isEligible(post) {
  const postTime = new Date(post.created + 'Z');
  const now = new Date();
  const ageMs = now - postTime;

  return (
    ageMs > 5 * 60 * 1000 &&          // > 5 minutes (sinon 0 reward)
    ageMs < 60 * 60 * 1000 &&         // < 1 heure
    post.active_votes.length > 0 &&  // déjà au moins un vote
    post.author !== VOTER &&         // ne pas voter soi-même
    !post.active_votes.some(v => v.voter === VOTER) // pas déjà voté
  );
}

// Récupère les 10 posts crypto les plus tendances
steem.api.getDiscussionsByTrending({ tag: TAG, limit: 10 }, (err, posts) => {
  if (err) {
    console.error('❌ Erreur de récupération des posts :', err);
    process.exit(1);
  }

  const target = posts.find(isEligible);

  if (!target) {
    console.log('ℹ️ Aucun post éligible trouvé.');
    process.exit(0);
    return;
  }

  console.log(`🔍 Ciblé : ${target.author}/${target.permlink}`);

  // Vote
  steem.broadcast.vote(
    WIF_POSTING_KEY,
    VOTER,
    target.author,
    target.permlink,
    VOTE_WEIGHT * 100,
    (err, result) => {
      if (err) {
        console.error('❌ Erreur lors du vote :', err.message || err);
      } else {
        console.log(`✅ Voté avec succès pour ${target.author}/${target.permlink}`);
      }
      process.exit(0);
    }
  );
});
