const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');

const readUsers = () => {
  try {
    if (!fs.existsSync(usersFilePath)) return [];
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf8') || '[]');
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing users:', error);
    return false;
  }
};

// POST /api/auth/login
exports.login = (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Spider-Sense Alert: Username and Password are required!'
      });
    }

    const users = readUsers();
    const cleanUsername = username.trim().toLowerCase();
    let user = users.find((u) => u.username.toLowerCase() === cleanUsername);

    if (user) {
      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Access Denied! Incorrect security code/password.'
        });
      }
    } else {
      // Auto-register new custom user identity
      user = {
        id: `user-${Date.now().toString(36)}`,
        username: cleanUsername,
        password,
        name: username.trim(),
        role: 'Daily Bugle Correspondent',
        avatar: '🕸️',
        badge: 'NEW CORRESPONDENT',
        isGuest: false
      };
      users.push(user);
      writeUsers(users);
    }

    // Return sanitized user object
    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      message: `Welcome to the Daily Bugle, ${user.name}!`,
      user: safeUser,
      token: `marvel-jwt-${user.id}-${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server auth error' });
  }
};

// POST /api/auth/guest
exports.guestLogin = (req, res) => {
  try {
    const randomId = Math.random().toString(36).substring(2, 6);
    const guestAvatars = ['🕵️', '🦹', '🕶️', '👤', '🌐'];
    const avatar = guestAvatars[Math.floor(Math.random() * guestAvatars.length)];

    const guestUser = {
      id: `guest-${randomId}`,
      username: `guest_${randomId}`,
      name: `Anonymous Vigilante #${randomId.toUpperCase()}`,
      role: 'Civilian Reader / Guest',
      avatar,
      badge: 'ANONYMOUS GUEST',
      isGuest: true
    };

    res.json({
      success: true,
      message: 'Sneaking into the Daily Bugle as Anonymous Guest!',
      user: guestUser,
      token: `guest-token-${guestUser.id}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating guest session' });
  }
};

// GET /api/auth/presets
exports.getPresets = (req, res) => {
  try {
    const users = readUsers();
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json({ success: true, presets: safeUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching preset identities' });
  }
};
