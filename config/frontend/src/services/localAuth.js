// ==========================================
// LOCAL STORAGE AUTHENTICATION SERVICE
// Built-in storage instead of external database
// ==========================================

const USERS_KEY = 'pesa_afrik_users';
const SESSION_KEY = 'pesa_afrik_session';

// Generate UUID
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Get all users from localStorage
const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Initialize with some demo users if empty
export const initializeDemoUsers = () => {
  const users = getUsers();
  if (users.length === 0) {
    const demoUsers = [
      {
        id: generateId(),
        email: 'demo@pesa-afrik.com',
        password: 'demo123',
        name: 'Demo User',
        country: 'Kenya',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        email: 'john@pesa-afrik.com',
        password: 'john123',
        name: 'John Kamwengu',
        country: 'Kenya',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        email: 'sarah@pesa-afrik.com',
        password: 'sarah123',
        name: 'Sarah Wawira',
        country: 'Nigeria',
        createdAt: new Date().toISOString()
      }
    ];
    saveUsers(demoUsers);
    
    // Initialize wallets and transactions for demo users
    demoUsers.forEach(user => {
      initializeUserData(user.id);
    });
    
    console.log('Demo users initialized:', demoUsers.length);
    return demoUsers;
  }
  return users;
};

// Initialize user data (wallets and transactions)
export const initializeUserData = (userId) => {
  const walletsKey = `pesa_afrik_wallets_${userId}`;
  const transactionsKey = `pesa_afrik_transactions_${userId}`;
  
  // Check if already initialized
  if (localStorage.getItem(walletsKey)) {
    return;
  }
  
  // Generate random balances
  const randomBalance = (min, max) => {
    return Math.random() * (max - min) + min;
  };
  
  // Generate random date within last 30 days
  const randomDate = () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString();
  };
  
  // Create wallets with random balances
  const wallets = {
    main: {
      id: generateId(),
      userId: userId,
      type: 'pesa-afrik',
      name: 'Main Wallet',
      balance: randomBalance(1000, 50000).toFixed(2),
      currency: 'PESA',
      createdAt: new Date().toISOString()
    },
    bitcoin: {
      id: generateId(),
      userId: userId,
      type: 'bitcoin',
      name: 'Bitcoin Wallet',
      balance: randomBalance(0.1, 2.5).toFixed(6),
      currency: 'BTC',
      createdAt: new Date().toISOString()
    },
    ethereum: {
      id: generateId(),
      userId: userId,
      type: 'ethereum',
      name: 'Ethereum Wallet',
      balance: randomBalance(1, 15).toFixed(4),
      currency: 'ETH',
      createdAt: new Date().toISOString()
    },
    tether: {
      id: generateId(),
      userId: userId,
      type: 'usdt',
      name: 'USDT Wallet',
      balance: randomBalance(5000, 25000).toFixed(2),
      currency: 'USDT',
      createdAt: new Date().toISOString()
    }
  };
  
  // Generate random transactions
  const transactionTypes = ['deposit', 'withdrawal', 'swap', 'buy', 'sell'];
  const currencies = ['PESA', 'BTC', 'ETH', 'USDT'];
  const statuses = ['completed', 'completed', 'completed', 'pending'];
  
  const transactions = [];
  const numTransactions = Math.floor(randomBalance(5, 15));
  
  for (let i = 0; i < numTransactions; i++) {
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const amount = randomBalance(10, 5000).toFixed(2);
    
    transactions.push({
      id: generateId(),
      userId: userId,
      type: type,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      amount: amount,
      currency: currency,
      fee: (amount * 0.001).toFixed(2),
      fromAddress: type === 'withdrawal' || type === 'send' ? wallets.main.address : null,
      toAddress: type === 'deposit' || type === 'receive' ? wallets.main.address : null,
      txHash: type === 'completed' ? generateId().replace(/-/g, '').substring(0, 16) : null,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} of ${amount} ${currency}`,
      createdAt: randomDate(),
      completedAt: statuses[Math.floor(Math.random() * statuses.length)] === 'completed' ? randomDate() : null
    });
  }
  
  // Sort transactions by date (newest first)
  transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Save to localStorage
  localStorage.setItem(walletsKey, JSON.stringify(wallets));
  localStorage.setItem(transactionsKey, JSON.stringify(transactions));
  
  console.log(`User data initialized for ${userId}`);
};

// Register a new user
export const register = (email, password, name, country) => {
  const users = getUsers();
  
  // Check if email already exists
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return { success: false, error: 'Email already registered' };
  }
  
  // Create new user
  const newUser = {
    id: generateId(),
    email: email.toLowerCase(),
    password: password,
    name: name || email.split('@')[0],
    country: country || 'Kenya',
    createdAt: new Date().toISOString()
  };
  
  // Save user
  users.push(newUser);
  saveUsers(users);
  
  // Initialize user data (wallets and transactions)
  initializeUserData(newUser.id);
  
  console.log('New user registered:', newUser.email);
  return { success: true, user: newUser };
};

// Login user
export const login = (email, password) => {
  const users = getUsers();
  
  // Find user by email and password
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  
  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  // Create session
  const session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    country: user.country,
    loginAt: new Date().toISOString()
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  
  console.log('User logged in:', user.email);
  return { success: true, user: session };
};

// Logout user
export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
  console.log('User logged out');
  return { success: true };
};

// Get current session
export const getCurrentSession = () => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

// Get user by ID
export const getUserById = (userId) => {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};

// Get user wallets
export const getUserWallets = (userId) => {
  const walletsKey = `pesa_afrik_wallets_${userId}`;
  const wallets = localStorage.getItem(walletsKey);
  return wallets ? JSON.parse(wallets) : {};
};

// Get user transactions
export const getUserTransactions = (userId) => {
  const transactionsKey = `pesa_afrik_transactions_${userId}`;
  const transactions = localStorage.getItem(transactionsKey);
  return transactions ? JSON.parse(transactions) : [];
};

// Update user profile
export const updateProfile = (userId, updates) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }
  
  // Update user fields
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveUsers(users);
  
  // Update session if exists
  const session = getCurrentSession();
  if (session && session.userId === userId) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      ...session,
      ...updates
    }));
  }
  
  return { success: true, user: users[userIndex] };
};

export default {
  initializeDemoUsers,
  initializeUserData,
  register,
  login,
  logout,
  getCurrentSession,
  getUserById,
  getUserWallets,
  getUserTransactions,
  updateProfile
};
