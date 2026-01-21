// Global User State
let currentUser = null;

// --- Scheme Database (AP & Central) ---
const SCHEMES_DATA = [
    // --- AP State Schemes ---
    {
        id: 'ap_1',
        type: 'State (AP)',
        name: 'YSR Rythu Bharosa',
        description: 'Financial assistance of ₹13,500/year to farmer families for agriculture investment.',
        criteria: { occupation: 'farmer' },
        url: 'https://ysrrythubharosa.ap.gov.in/'
    },
    {
        id: 'ap_2',
        type: 'State (AP)',
        name: 'Jagananna Vidya Deevena',
        description: 'Full fee reimbursement for students from poor economic backgrounds.',
        criteria: { occupation: 'student', maxIncome: 250000 },
        url: 'https://jnanabhumi.ap.gov.in/'
    },
    {
        id: 'ap_3',
        type: 'State (AP)',
        name: 'YSR Cheyutha',
        description: 'Financial assistance of ₹75,000 over 4 years for women aged 45-60.',
        criteria: { gender: 'female', minAge: 45, maxAge: 60, maxIncome: 300000 },
        url: 'https://gramawardsachivalayam.ap.gov.in/'
    },
    {
        id: 'ap_4',
        type: 'State (AP)',
        name: 'YSR Pension Kanuka',
        description: 'Monthly pension for senior citizens, widows, and disabled persons.',
        criteria: { minAge: 60, maxIncome: 300000 },
        url: 'https://sspensions.ap.gov.in/'
    },
    {
        id: 'ap_5',
        type: 'State (AP)',
        name: 'Jagananna Amma Vodi',
        description: '₹15,000/year for mothers to send their children to school.',
        criteria: { gender: 'female', maxIncome: 200000 },
        url: 'https://jaganannaammavodi.ap.gov.in/'
    },

    // --- Central Govt Schemes ---
    {
        id: 'cen_1',
        type: 'Central',
        name: 'PM Kisan Samman Nidhi',
        description: 'Income support of ₹6,000/year for all landholding farmer families.',
        criteria: { occupation: 'farmer' },
        url: 'https://pmkisan.gov.in/'
    },
    {
        id: 'cen_2',
        type: 'Central',
        name: 'Pradhan Mantri Awas Yojana',
        description: 'Housing for All. Subsidy on home loans for EWS/LIG categories.',
        criteria: { maxIncome: 600000 },
        url: 'https://pmaymis.gov.in/'
    },
    {
        id: 'cen_3',
        type: 'Central',
        name: 'Ayushman Bharat (PM-JAY)',
        description: 'Health cover of ₹5 Lakhs per family per year for hospitalization.',
        criteria: { maxIncome: 500000 },
        url: 'https://pmjay.gov.in/'
    },
    {
        id: 'cen_4',
        type: 'Central',
        name: 'Sukanya Samriddhi Yojana',
        description: 'Small savings scheme for the girl child to secure her future.',
        criteria: { gender: 'female', maxAge: 10 },
        url: 'https://www.nsiindia.gov.in/'
    },
    {
        id: 'cen_5',
        type: 'Central',
        name: 'Atal Pension Yojana',
        description: 'Pension scheme for unorganized sector workers.',
        criteria: { minAge: 18, maxAge: 40 },
        url: 'https://npscra.nsdl.co.in/scheme-details.php'
    }
];

// DOM Elements
const views = {
    login: document.getElementById('loginSection'),
    register: document.getElementById('registerSection'),
    home: document.getElementById('homeSection'),
    about: document.getElementById('aboutSection'),
    dashboard: document.getElementById('dashboardSection'),
};

const navLinks = {
    home: document.getElementById('homeLink'),
    about: document.getElementById('aboutLink'),
    dashboard: document.getElementById('dashboardLink'),
    authBtn: document.getElementById('authBtn')
};

// --- Navigation Logic ---
function showView(viewId) {
    Object.values(views).forEach(el => el.style.display = 'none');
    if (views[viewId]) views[viewId].style.display = 'block';

    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    if (navLinks[viewId]) navLinks[viewId].classList.add('active');
}

navLinks.home.addEventListener('click', (e) => { e.preventDefault(); showView('home'); });
navLinks.about.addEventListener('click', (e) => { e.preventDefault(); showView('about'); });
navLinks.dashboard.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser) showView('dashboard');
    else showView('login');
});

// Auth Button Logic (Login / Logout)
navLinks.authBtn.addEventListener('click', () => {
    if (currentUser) {
        auth.signOut().then(() => {
            alert("Logged out successfully");
            showView('login');
        });
    } else {
        showView('login');
    }
});

document.getElementById('getStartedBtn').addEventListener('click', () => {
    if (currentUser) showView('dashboard');
    else showView('login');
});

document.getElementById('showRegister').addEventListener('click', () => showView('register'));
document.getElementById('showLogin').addEventListener('click', () => showView('login'));

// --- Authentication Logic ---
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        navLinks.authBtn.innerText = "Logout";
        loadUserProfile(user.uid);
    } else {
        currentUser = null;
        navLinks.authBtn.innerText = "Login";
    }
});

// Login
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
            showView('dashboard');
            document.getElementById('loginForm').reset();
        })
        .catch(err => document.getElementById('loginMessage').innerText = err.message);
});

// Register
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;

    if (pass !== confirm) {
        document.getElementById('registerMessage').innerText = "Passwords do not match!";
        return;
    }

    try {
        const cred = await auth.createUserWithEmailAndPassword(email, pass);
        await db.collection('users').doc(cred.user.uid).set({
            email: email,
            age: Number(document.getElementById('regAge').value),
            gender: document.getElementById('regGender').value,
            income: Number(document.getElementById('regIncome').value),
            occupation: document.getElementById('regOccupation').value,
            createdAt: new Date()
        });
        alert("Registration Successful!");
        showView('dashboard');
        document.getElementById('registerForm').reset();
    } catch (err) {
        document.getElementById('registerMessage').innerText = err.message;
    }
});

// --- Dashboard & Logic ---

async function loadUserProfile(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('dashAge').value = data.age || '';
            document.getElementById('dashIncome').value = data.income || '';
            document.getElementById('dashOccupation').value = data.occupation || 'student';
            checkEligibility(data);
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const updates = {
        age: Number(document.getElementById('dashAge').value),
        income: Number(document.getElementById('dashIncome').value),
        occupation: document.getElementById('dashOccupation').value,
        updatedAt: new Date()
    };

    await db.collection('users').doc(currentUser.uid).update(updates);
    alert("Profile Updated!");
    checkEligibility(updates);
});

function checkEligibility(user) {
    const resultsContainer = document.getElementById('eligibilityResults');
    resultsContainer.innerHTML = '';
    let eligibleSchemes = [];

    SCHEMES_DATA.forEach(scheme => {
        let isEligible = true;
        const c = scheme.criteria;

        if (c.occupation && c.occupation !== user.occupation) isEligible = false;
        if (c.gender && c.gender !== user.gender) isEligible = false;
        if (c.minAge && user.age < c.minAge) isEligible = false;
        if (c.maxAge && user.age > c.maxAge) isEligible = false;
        if (c.maxIncome && user.income > c.maxIncome) isEligible = false;

        if (isEligible) eligibleSchemes.push(scheme);
    });

    if (eligibleSchemes.length === 0) {
        resultsContainer.innerHTML = '<p class="text-muted">No schemes found matching your profile currently.</p>';
    } else {
        eligibleSchemes.forEach(s => {
            const div = document.createElement('div');
            div.className = 'scheme-item';
            div.innerHTML = `
                <div style="width: 100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="scheme-badge ${s.type === 'Central' ? 'cen' : 'ap'}">${s.type}</span>
                        <button class="btn-primary" onclick="window.open('${s.url}', '_blank')" 
                                style="padding:5px 10px; font-size:0.8rem; height:auto; width:auto; background:var(--accent); color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">
                            Apply Now <i class="fas fa-external-link-alt" style="margin-left:5px;"></i>
                        </button>
                    </div>
                    <strong style="display:block; margin-top:5px; font-size:1.1rem; color:var(--text-main);">${s.name}</strong>
                    <small style="color:var(--text-muted); display:block; margin-top:5px;">${s.description}</small>
                </div>
            `;
            resultsContainer.appendChild(div);
        });
    }

    window.lastSchemes = eligibleSchemes;
}

// --- Easy Apply Logic ---
window.openApplyModal = (schemeName) => {
    const modal = document.getElementById('applyModal');
    const nameDisplay = document.getElementById('applySchemeName');
    const ageInput = document.getElementById('applyAge');
    const emailInput = document.getElementById('applyEmail');

    // Auto-fill
    nameDisplay.innerText = schemeName;
    ageInput.value = document.getElementById('dashAge').value;

    // Auto-fill email if user is logged in
    if (currentUser && currentUser.email) {
        if (emailInput) emailInput.value = currentUser.email;
    }

    modal.style.display = 'flex';
};

const closeApplyBtn = document.getElementById('closeApply');
if (closeApplyBtn) {
    closeApplyBtn.addEventListener('click', () => {
        document.getElementById('applyModal').style.display = 'none';
    });
}

const applyForm = document.getElementById('applyForm');
if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('applyEmail').value;
        const name = document.getElementById('applyName').value;
        const scheme = document.getElementById('applySchemeName').innerText;

        document.getElementById('applyModal').style.display = 'none';

        // Construct Mailto Link
        const subject = encodeURIComponent(`Application Confirmation: ${scheme}`);
        const body = encodeURIComponent(
            `Dear ${name},\n\n` +
            `This is to confirm your application for: ${scheme}.\n\n` +
            `Your Profile:\n` +
            `Age: ${document.getElementById('applyAge').value}\n` +
            `Email: ${email}\n\n` +
            `Status: Submitted successfully.\n\n` +
            `Best Regards,\nGov Scheme Portal`
        );

        // Construct Gmail Web Link
        // https://mail.google.com/mail/?view=cm&fs=1&to=EMAIL&su=SUBJECT&body=BODY
        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`;

        console.log("Opening Gmail:", gmailLink);

        // Open Gmail in New Tab
        window.open(gmailLink, '_blank');

        // Show Toast
        showToast(`Opening Gmail to finalize your application... 📧`);
    });
}

// --- Smart Search Logic ---
const schemeSearch = document.getElementById('schemeSearch');
if (schemeSearch) {
    schemeSearch.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('#eligibilityResults .scheme-item');

        cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(val) ? 'block' : 'none';
        });
    });
}

// --- Instant Alerts (Toast) ---
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-bell" style="margin-right:10px; color:#00D2D3;"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.4s ease-in forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Update Alerts
const originalAlert = window.alert;
window.alert = showToast; // Override default alert for cleaner UI

// --- PDF Generation ---
document.getElementById('downloadPDF').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(108, 99, 255);
    doc.text("Gov Schemes Eligibility Report", 15, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 28);

    doc.setLineWidth(0.5);
    doc.line(15, 32, 195, 32);

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text("User Profile:", 15, 42);
    doc.setFont("helvetica", "normal");
    doc.text(`Age: ${document.getElementById('dashAge').value} | Occupation: ${document.getElementById('dashOccupation').value}`, 15, 50);
    doc.text(`Annual Income: Rs. ${document.getElementById('dashIncome').value}`, 15, 58);

    doc.setFont("helvetica", "bold");
    doc.text("Eligible Schemes:", 15, 75);

    let y = 85;
    if (window.lastSchemes && window.lastSchemes.length > 0) {
        window.lastSchemes.forEach((s, i) => {
            if (y > 270) { doc.addPage(); y = 20; }

            doc.setFillColor(240, 240, 250);
            doc.rect(15, y - 5, 180, 22, 'F');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(0, 50, 100);
            doc.text(`${i + 1}. ${s.name} (${s.type})`, 18, y);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(80);

            // split long text
            const descLines = doc.splitTextToSize(s.description, 170);
            doc.text(descLines, 18, y + 6);

            y += 28;
        });
    } else {
        doc.text("No suitable schemes found based on current profile.", 15, y);
    }

    doc.save("Eligibility_Report.pdf");
});

// --- Local RAG "Brain" ---
class LocalRAGBot {
    constructor(data) {
        this.knowledgeBase = data;
        this.stopWords = new Set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']);
    }

    // 1. "Embed" / Tokenize Query
    processQuery(query) {
        return query.toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .split(/\s+/)
            .filter(word => !this.stopWords.has(word) && word.length > 2);
    }

    // 2. Retrieval: Find best matching schemes
    retrieve(keywords) {
        if (keywords.length === 0) return [];

        const scores = this.knowledgeBase.map(scheme => {
            let score = 0;
            const text = `${scheme.name} ${scheme.description} ${scheme.type} ${JSON.stringify(scheme.criteria)}`.toLowerCase();

            keywords.forEach(word => {
                if (text.includes(word)) score += 3; // Word match
            });

            // Boost for occupation/gender keywords in criteria
            keywords.forEach(word => {
                if (scheme.criteria.occupation === word) score += 5;
                if (scheme.criteria.gender === word) score += 5;
            });

            return { scheme, score };
        });

        // Return top 3 matches with score > 0
        return scores.filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(s => s.scheme);
    }

    // 3. Augment & Generate
    // 3. Augment & Generate
    // 3. Augment & Generate
    // 3. Augment & Generate
    generateResponse(query, userProfile) {
        const tokens = this.processQuery(query);
        let matches = this.retrieve(tokens);

        // Force-include schemes if critical keywords are present (e.g. "pension")
        // This ensures they appear even if scoring is weird
        if (query.toLowerCase().includes('pension')) {
            const pensions = this.knowledgeBase.filter(s => s.name.toLowerCase().includes('pension'));
            // Add if not already in matches
            pensions.forEach(p => {
                if (!matches.find(m => m.id === p.id)) matches.push(p);
            });
        }

        // Fallback: If no keyword matches, check if we have profile overrides from chat
        // If user says "Age 60 income 10k", tokens might be empty or generic.
        // We should check ALL schemes against the profile in this case.
        if (matches.length === 0) {
            const hasProfileContext = query.match(/\d/) ||
                query.toLowerCase().includes('male') ||
                query.toLowerCase().includes('female');

            if (hasProfileContext) {
                // Universal Check: User provided data but no specific scheme keyword
                // Let's check matching against EVERYTHING
                matches = this.knowledgeBase;
            } else {
                if (query.toLowerCase().includes('eligible')) return this.checkProfileEligibility(userProfile);
                return "I couldn't find specific schemes matching your query. Try keywords like 'farmer', 'student', 'pension', or 'women'.";
            }
        }

        // Filter: Separate Eligible vs Ineligible
        const eligible = [];
        const ineligible = [];
        const checkedSchemes = new Set(); // Avoid duplicates if knowledgeBase override used

        matches.forEach(m => {
            if (checkedSchemes.has(m.id)) return;
            checkedSchemes.add(m.id);

            const check = this.checkSpecificEligibility(m, userProfile);
            if (check.isEligible) {
                eligible.push(m);
            } else {
                m.failReason = check.reason;
                ineligible.push(m);
            }
        });

        // Construct Response
        if (eligible.length === 0 && ineligible.length === 0) {
            return "No relevant schemes found.";
        }

        // Conversational Response for "Why"
        const askingWhy = query.toLowerCase().includes('why') || query.toLowerCase().includes('reason');
        let response = "";

        if (eligible.length > 0) {
            response += `<strong>✅ You are eligible for:</strong><br>`;
            eligible.forEach(m => {
                response += `<div style="margin-top:5px; padding:5px; background:rgba(0,255,0,0.1); border-radius:5px;">
                                <strong>${m.name}</strong><br>${m.description}
                             </div>`;
            });
        }

        if (ineligible.length > 0) {
            if (askingWhy) response += `<br><strong>⚠️ Here is why you are NOT eligible:</strong><br>`;
            else if (eligible.length > 0) response += `<br><strong>⚠️ Other schemes (Not Eligible):</strong><br>`;
            else response += `<strong>⚠️ matching schemes found, but you don't meet the criteria yet:</strong><br>`;

            let missingOccupation = false;

            ineligible.forEach(m => {
                // Highlight the reason if asking "Why"
                const reasonStyle = askingWhy ? "color:red; font-weight:bold;" : "color:#ff6b6b; font-size:0.9em;";
                response += `<div style="margin-top:5px; color:#aaa;">
                                <strong>${m.name}</strong> - Reason: <span style="${reasonStyle}">${m.failReason}</span>
                             </div>`;
                if (m.failReason.includes('occupation')) missingOccupation = true;
            });

            if (missingOccupation) {
                response += `<div style="margin-top:10px; font-size:0.9em; color:#0abde3;">
                                💡 <strong>Tip:</strong> Mention your occupation (e.g., "I am a farmer") if applicable.
                             </div>`;
            }
        }

        return response;
    }

    checkSpecificEligibility(scheme, user) {
        if (!user) return { isEligible: true };
        const c = scheme.criteria;

        // Strict Occupation Check (Fail if user has no occupation but scheme requires one)
        if (c.occupation) {
            if (!user.occupation || user.occupation !== c.occupation) {
                return { isEligible: false, reason: `Requires occupation: ${c.occupation}` };
            }
        }

        if (c.gender && user.gender && c.gender !== user.gender)
            return { isEligible: false, reason: `Requires gender: ${c.gender}` };

        if (c.minAge && user.age && user.age < c.minAge)
            return { isEligible: false, reason: `Minimum age is ${c.minAge} (You are ${user.age})` };

        if (c.maxAge && user.age && user.age > c.maxAge)
            return { isEligible: false, reason: `Maximum age is ${c.maxAge} (You are ${user.age})` };

        if (c.maxIncome && user.income && user.income > c.maxIncome)
            return { isEligible: false, reason: `Income limit is ₹${c.maxIncome}` };

        return { isEligible: true };
    }

    checkProfileEligibility(user) {
        if (!user || !user.age) return "Please update your profile in the Dashboard so I can check your eligibility.";
        return `Based on your profile (Age: ${user.age}, ${user.occupation}), please visit the Dashboard to see your full report.`;
    }
}

// Initialize Bot
const ragBot = new LocalRAGBot(SCHEMES_DATA);

// --- Chatbot Logic Integration ---
const chatToggler = document.getElementById('chatbotToggler');
const chatWindow = document.getElementById('chatbotWindow');
const closeChat = document.getElementById('closeChat');
const clearChat = document.getElementById('clearChat'); // New
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatBody = document.getElementById('chatBody');

chatToggler.addEventListener('click', () => {
    chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
});

closeChat.addEventListener('click', () => chatWindow.style.display = 'none');

// Clear Chat Logic
if (clearChat) {
    clearChat.addEventListener('click', () => {
        chatBody.innerHTML = '<div class="chat-msg bot">Chat cleared. How can I help?</div>';
    });
}

function addMessage(html, type) {
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.innerHTML = html; // Allow HTML for formatting
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Helper: Extract entities from text
function extractProfileOverride(text, currentProfile) {
    let profile = { ...currentProfile };
    const lowerText = text.toLowerCase();

    // Extract Age
    // Matches: "60 aged", "aged 60", "60 years", "60 yrs", "age 60", "is 60", "am 60"
    const ageMatch = text.match(/(\d{1,3})\s?(?:years|yrs|aged|old)/i) ||
        text.match(/(?:age|is|am)\s?(\d{1,3})/i);

    if (ageMatch) {
        profile.age = Number(ageMatch[1]);
        console.log("Extracted Age:", profile.age); // Debug
    }

    // Extract Income ("income 50000", "50k", "earns 10000")
    // Simple parser for 50000 or 50k
    const incomeMatch = text.match(/(?:income|earn|salary|make).*?(\d+)(?:k)?/i);
    if (incomeMatch) {
        let val = Number(incomeMatch[1]);
        if (text.includes(val + 'k') || text.includes(val + 'K')) val *= 1000;
        profile.income = val;
    }

    // Extract Gender
    if (lowerText.includes('female') || lowerText.includes('woman') || lowerText.includes('girl') || lowerText.includes('lady')) {
        profile.gender = 'female';
    } else if (lowerText.includes('male') || lowerText.includes('man') || lowerText.includes('boy') || lowerText.includes('gentleman')) {
        profile.gender = 'male';
    }

    // Extract Occupation (Simple Keyword Match)
    if (lowerText.includes('student')) profile.occupation = 'student';
    else if (lowerText.includes('farmer')) profile.occupation = 'farmer';

    return profile;
}

function handleChat() {
    const text = chatInput.value.trim();
    if (!text) return; // Empty check

    addMessage(text, 'user');
    chatInput.value = '';

    // 1. Get Base Context (Dashboard)
    // Remove default "student" - leave empty if not known
    const baseProfile = {
        age: Number(document.getElementById('dashAge').value) || (currentUser ? 25 : 0),
        income: Number(document.getElementById('dashIncome').value) || 0,
        occupation: document.getElementById('dashOccupation').value || '',
        gender: document.getElementById('regGender') ? document.getElementById('regGender').value : 'male'
    };

    // 2. Override with Chat Entities
    const contextProfile = extractProfileOverride(text, baseProfile);
    console.log("RAG Context:", contextProfile);

    setTimeout(() => {
        const reply = ragBot.generateResponse(text, contextProfile);
        addMessage(reply, 'bot');
    }, 600);
}

// --- New Scheme Alert System ---
window.subscribeToAlerts = () => {
    if (!currentUser) {
        showToast("Please Login to Subscribe for Alerts! 🔒");
        return;
    }

    // Simulate Subscription
    const btn = document.getElementById('subscribeBtn');
    btn.innerHTML = '<i class="fas fa-check"></i> Subscribed';
    btn.style.background = 'var(--accent)';
    btn.disabled = true;

    showToast("✅ Subscribed! You will be notified of new schemes.");

    // Simulate finding a "New Scheme" after 5 seconds to demonstrate
    setTimeout(() => {
        showToast("🔔 New Scheme Alert: 'Digital India Internship' matched your profile!");

        // Add to list dynamically (Mock)
        const results = document.getElementById('eligibilityResults');
        const div = document.createElement('div');
        div.className = 'scheme-item';
        div.style.borderLeft = '5px solid var(--secondary)';
        div.innerHTML = `
            <div style="width: 100%;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="scheme-badge badge-central">New Arrival</span>
                    <button class="btn-primary" onclick="window.open('https://digitalindia.gov.in', '_blank')" 
                            style="padding:5px 10px; font-size:0.8rem; background:var(--accent); color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">
                        Apply Now <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
                <strong style="display:block; margin-top:5px; font-size:1.1rem; color:var(--text-main);">Digital India Internship</strong>
                <small style="color:var(--text-muted); display:block; margin-top:5px;">Exclusive internship opportunity for students.</small>
            </div>
        `;
        results.prepend(div);

    }, 5000);
};

chatSend.addEventListener('click', handleChat);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });
