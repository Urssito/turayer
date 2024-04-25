const webpush = require('web-push');

webpush.setVapidDetails(
    'mailto:lucca.urso112@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);
