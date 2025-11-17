import admin from 'firebase-admin';
import User from '../models/User.js';

// init Firebase Admin SDK
if (!admin.apps.length) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({
            credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
        });
    } else if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_PRIVATE_KEY &&
        process.env.FIREBASE_CLIENT_EMAIL
    ) {
        const serviceAccount = {
            type: 'service_account',
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle escaped newlines
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        throw new Error(
            'Firebase credentials not found. Set GOOGLE_APPLICATION_CREDENTIALS or provide inline credentials via environment variables.',
        );
    }
}

// Helper function to generate random username
const generateRandomUsername = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    return `CineFan#${randomNum}`;
};

// Helper function to generate random avatar index
const getRandomAvatar = () => {
    return Math.floor(Math.random() * 20); // 0-19 (20 avatars available)
};

export const verifyFirebaseToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;
        const email = decodedToken.email;
        const fullName = decodedToken.name || decodedToken.displayName || '';

        // Find or create user with proper error handling
        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            try {
                // Create new user with random username and avatar
                user = new User({
                    firebaseUid: uid,
                    email: email,
                    name: fullName,
                    username: generateRandomUsername(),
                    avatar: getRandomAvatar(),
                    role: 'user',
                });
                await user.save();
                console.log(`Created new user: ${user.email} with username ${user.username}`);
            } catch (dbError) {
                // Handle potential race condition or other DB errors
                if (dbError.code === 11000) {
                    // Duplicate key error - another request might have created the user
                    user = await User.findOne({ firebaseUid: uid });
                    if (!user) {
                        console.error('Race condition detected but user still not found:', dbError);
                        return res.status(500).json({ error: 'Database error occurred' });
                    }
                } else {
                    console.error('Database error creating user:', dbError);
                    return res.status(500).json({ error: 'Database error occurred' });
                }
            }
        }

        // Attach full user object to request
        req.user = user;

        next();
    } catch (error) {
        console.error('Error verifying Firebase token:', error);
        return res.status(401).json({ error: 'Unauthorized' });
    }
};
