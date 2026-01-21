// Mock Firebase Service using LocalStorage
// This replaces the real Firebase SDKs for demonstration purposes

console.log("⚠️ Running in Mock Backend Mode");

class MockAuth {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('mock_user_session')) || null;
        this.authStateCallback = null;
        // Trigger initial state
        setTimeout(() => {
            if (this.authStateCallback) this.authStateCallback(this.currentUser);
        }, 100);
    }

    onAuthStateChanged(callback) {
        this.authStateCallback = callback;
        callback(this.currentUser);
    }

    async signInWithEmailAndPassword(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('mock_users')) || {};
                const user = users[email];

                if (user && user.password === password) {
                    this._updateSession({ uid: user.uid, email: email });
                    resolve({ user: this.currentUser });
                } else {
                    reject(new Error("Invalid email or password (Mock)"));
                }
            }, 800);
        });
    }

    async createUserWithEmailAndPassword(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('mock_users')) || {};
                if (users[email]) {
                    reject(new Error("Email already in use (Mock)"));
                } else {
                    const uid = 'user_' + Date.now();
                    users[email] = { uid, password, email };
                    localStorage.setItem('mock_users', JSON.stringify(users));

                    this._updateSession({ uid, email });
                    resolve({ user: this.currentUser });
                }
            }, 800);
        });
    }

    async signOut() {
        return new Promise(resolve => {
            setTimeout(() => {
                this._updateSession(null);
                resolve();
            }, 500);
        });
    }

    _updateSession(user) {
        this.currentUser = user;
        if (user) localStorage.setItem('mock_user_session', JSON.stringify(user));
        else localStorage.removeItem('mock_user_session');

        if (this.authStateCallback) this.authStateCallback(user);
    }
}

class MockFirestore {
    collection(name) {
        return new MockCollection(name);
    }
}

class MockCollection {
    constructor(name) {
        this.name = name;
    }

    doc(id) {
        return new MockDoc(this.name, id);
    }
}

class MockDoc {
    constructor(colName, docId) {
        this.key = `mock_db_${colName}_${docId}`;
    }

    async set(data) {
        return new Promise(resolve => {
            localStorage.setItem(this.key, JSON.stringify(data));
            resolve();
        });
    }

    async get() {
        return new Promise(resolve => {
            const data = JSON.parse(localStorage.getItem(this.key));
            resolve({
                exists: !!data,
                data: () => data
            });
        });
    }

    async update(data) {
        return new Promise(resolve => {
            const current = JSON.parse(localStorage.getItem(this.key)) || {};
            const updated = { ...current, ...data };
            localStorage.setItem(this.key, JSON.stringify(updated));
            resolve();
        });
    }
}

// Expose globally
window.auth = new MockAuth();
window.db = new MockFirestore();
