import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Cấu hình Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyDyXmxsZAg6JxgcsujSIwMfbZTHscfJSCg",
    authDomain: "dulieuweb-6541e.firebaseapp.com",
    projectId: "dulieuweb-6541e",
    storageBucket: "dulieuweb-6541e.firebasestorage.app",
    messagingSenderId: "215480268517",
    appId: "1:215480268517:web:16600eafd6839fee5dc60c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'v2-database-school';

// --- State Management ---
let allQuestionsData = []; 
let currentQuestions = [];
let currentIndex = 0;
let userAnswers = [];
let timerInterval = null;
const TIME_PER_QUESTION = 60; // 60 giây mỗi câu

// --- Phân tích ngữ cảnh ---
const getPageContext = () => {
    const subject = document.title.split('-')[0].trim();
    const lesson = document.querySelector('h1')?.textContent?.trim() || "";
    return { subject, lesson };
};

// --- Giao diện Quiz ---
const initQuizUI = () => {
    const targetDiv = document.querySelector('.flex.justify-center.mb-12.px-4');
    if (!targetDiv) return;

    const quizContainer = document.createElement('div');
     quizContainer.id = "quiz-wrapper";
     quizContainer.className = "max-w-5xl mx-auto px-4 mb-20 hidden";
     quizContainer.innerHTML = `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 relative overflow-hidden">
            <!-- Progress Bar -->
            <div id="timer-progress-bar" class="absolute top-0 left-0 h-1 bg-indigo-500 transition-all duration-1000" style="width: 100%"></div>
            
            <div id="quiz-header" class="flex justify-between items-center mb-6 border-b border-slate-800 pb-4 mt-2">
                <div>
                    <h2 class="text-xl font-bold text-indigo-400" id="quiz-title">Luyện tập trắc nghiệm & Tự luận</h2>
                    <div class="flex items-center gap-2 mt-1">
                         <span id="timer-display" class="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-rose-400">60s</span>
                         <p class="text-[10px] text-slate-500 uppercase tracking-widest" id="quiz-subtitle">Thời gian còn lại</p>
                    </div>
                </div>
                <div class="text-right">
                    <span id="quiz-progress" class="text-sm font-mono text-indigo-400">0/0</span>
                </div>
            </div>
            <div id="quiz-content"></div>
            <div id="quiz-footer" class="mt-8 flex justify-between items-center">
                <button id="prev-q" class="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-all text-sm">Quay lại</button>
                <div id="quiz-action-area">
                     <button id="next-q" class="px-8 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all font-bold shadow-lg shadow-indigo-500/20">Câu tiếp theo</button>
                </div>
            </div>
        </div>
    `;

    const startBtnContainer = document.createElement('div');
    startBtnContainer.className = "flex justify-center mb-10";
    startBtnContainer.id = "start-container";
    startBtnContainer.innerHTML = `
        <button id="start-quiz-btn" class="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105 active:scale-95">
            <i class="fas fa-play-circle"></i> LUYỆN TẬP NGAY
        </button>
    `;

    targetDiv.after(quizContainer);
    targetDiv.after(startBtnContainer);
    document.getElementById('start-quiz-btn').onclick = startQuiz;
};

// --- Logic Xáo trộn ---
const shuffleData = (data) => {
    let shuffled = [...data].sort(() => Math.random() - 0.5);
    return shuffled.map(q => {
        if (q.type === 'multiple_choice') {
            const keys = ['A', 'B', 'C', 'D'];
            const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);
            return { ...q, displayOrder: shuffledKeys };
        }
        return q;
    });
};

// --- Tải dữ liệu & Màn hình đếm ngược ---
async function startQuiz() {
    const btn = document.getElementById('start-quiz-btn');
    const { subject, lesson } = getPageContext();
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang tải câu hỏi...`;

    try {
        const qRef = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
        const snap = await getDocs(qRef);
        allQuestionsData = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(q => q.subject === subject && (q.lesson === lesson || lesson.includes(q.lesson)));

        if (allQuestionsData.length === 0) {
            btn.innerHTML = `<i class="fas fa-info-circle"></i> Không có dữ liệu`;
            setTimeout(() => { btn.disabled = false; btn.innerHTML = `<i class="fas fa-play-circle"></i> BẮT ĐẦU`; }, 2000);
            return;
        }

        showCountdownOverlay();
    } catch (err) {
        btn.textContent = "Lỗi kết nối!";
        btn.disabled = false;
    }
}

function showCountdownOverlay() {
    const overlay = document.createElement('div');
    overlay.className = "fixed inset-0 z-[9999] bg-slate-950/90 flex flex-center items-center justify-center backdrop-blur-sm";
    overlay.id = "countdown-overlay";
    overlay.innerHTML = `
        <div class="text-center animate-bounceIn">
            <h2 class="text-indigo-400 text-xl font-bold mb-4">SẴN SÀNG?</h2>
            <div id="countdown-number" class="text-8xl font-black text-white mb-6">5</div>
            <p class="text-slate-400 max-w-xs mx-auto">Bạn có <span class="text-indigo-400 font-bold">60 giây</span> để trả lời mỗi câu hỏi. Chúc may mắn!</p>
        </div>
    `;
    document.body.appendChild(overlay);

    let count = 5;
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            const numEl = document.getElementById('countdown-number');
            if (numEl) numEl.textContent = count;
        } else {
            clearInterval(interval);
            overlay.classList.add('opacity-0');
            setTimeout(() => {
                overlay.remove();
                setupSession();
            }, 500);
        }
    }, 1000);
}

function setupSession() {
    // Ẩn nút bắt đầu và hiện khung quiz
    document.getElementById('start-container')?.classList.add('hidden');
    document.getElementById('quiz-wrapper').classList.remove('hidden');
    document.getElementById('quiz-footer').classList.remove('hidden');
    
    // Reset toàn bộ state
    clearInterval(timerInterval);
    currentIndex = 0;
    currentQuestions = shuffleData(allQuestionsData);
    userAnswers = new Array(currentQuestions.length).fill(null);
    
    // Hiển thị câu hỏi đầu tiên
    renderQuestion();
    document.getElementById('quiz-wrapper').scrollIntoView({ behavior: 'smooth' });
}

// --- Logic Timer ---
function startTimer() {
    clearInterval(timerInterval);
    let timeLeft = TIME_PER_QUESTION;
    const display = document.getElementById('timer-display');
    const bar = document.getElementById('timer-progress-bar');
    
    updateTimerUI(timeLeft);

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

function updateTimerUI(seconds) {
    const display = document.getElementById('timer-display');
    const bar = document.getElementById('timer-progress-bar');
    if (display) display.textContent = `${seconds}s`;
    if (bar) {
        const percentage = (seconds / TIME_PER_QUESTION) * 100;
        bar.style.width = `${percentage}%`;
        if (seconds <= 10) bar.classList.replace('bg-indigo-500', 'bg-rose-500');
        else bar.classList.replace('bg-rose-500', 'bg-indigo-500');
    }
}

function handleTimeout() {
    if (userAnswers[currentIndex] !== null) return;

    const q = currentQuestions[currentIndex];
    userAnswers[currentIndex] = {
        selected: "TIMEOUT",
        isCorrect: false,
        type: q.type === 'multiple_choice' ? 'mcq' : 'short'
    };
    renderQuestion();
}

// --- Hiển thị câu hỏi ---
function renderQuestion() {
    const q = currentQuestions[currentIndex];
    const container = document.getElementById('quiz-content');
    const progress = document.getElementById('quiz-progress');
    const nextBtn = document.getElementById('next-q');
    const answerData = userAnswers[currentIndex];
    const hasAnswered = answerData !== null;

    progress.textContent = `Câu ${currentIndex + 1} / ${currentQuestions.length}`;
    
    // Nếu chưa trả lời thì bắt đầu đếm ngược
    if (!hasAnswered) {
        startTimer();
    } else {
        clearInterval(timerInterval);
    }

    let html = `
        <div class="animate-fadeIn">
            <h3 class="text-lg font-medium mb-6 leading-relaxed">${q.content}</h3>
    `;

    if (q.type === 'multiple_choice') {
        html += `<div class="space-y-3">`;
        const displayKeys = q.displayOrder || ['A', 'B', 'C', 'D'];
        displayKeys.forEach((key, idx) => {
            const label = String.fromCharCode(65 + idx);
            const isSelected = answerData?.selected === key;
            const isCorrect = q.correct === key;
            
            let btnClass = "border-slate-800 bg-slate-800/50 text-slate-300";
            if (hasAnswered) {
                if (isCorrect) btnClass = "border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold";
                else if (isSelected) btnClass = "border-rose-500 bg-rose-500/20 text-rose-400";
                else btnClass = "opacity-40 border-slate-800";
            } else {
                btnClass += " hover:border-indigo-500 hover:bg-slate-800 cursor-pointer";
            }

            html += `
                <button ${hasAnswered ? 'disabled' : ''} onclick="submitMCQ('${key}')" 
                    class="w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${btnClass}">
                    <span class="w-8 h-8 flex-none rounded-full bg-slate-700/50 flex items-center justify-center text-sm font-bold">${label}</span>
                    <span class="flex-1">${q.options[key]}</span>
                </button>
            `;
        });
        html += `</div>`;
    } else {
        html += `
            <div class="space-y-4">
                <textarea id="short-answer-input" 
                    ${hasAnswered ? 'disabled' : ''} 
                    class="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:border-indigo-500 outline-none min-h-[100px] text-slate-200"
                    placeholder="Nhập câu trả lời của bạn...">${hasAnswered && answerData.selected !== "TIMEOUT" ? answerData.selected : ''}</textarea>
                ${!hasAnswered ? `
                    <button onclick="submitShortAnswer()" class="px-6 py-2 bg-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-500">Kiểm tra đáp án</button>
                ` : `
                    <div class="p-4 rounded-xl border ${answerData.isCorrect ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-rose-500 bg-rose-500/10 text-rose-400'}">
                        <div class="text-[10px] font-bold uppercase mb-1">
                            ${answerData.selected === "TIMEOUT" ? '<span class="text-rose-500">HẾT GIỜ!</span> | ' : ''} Đáp án đúng:
                        </div>
                        <div class="text-sm">${q.correct}</div>
                    </div>
                `}
            </div>
        `;
    }

    if (hasAnswered && q.explanation) {
        html += `
            <div class="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 animate-fadeIn">
                <div class="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase mb-2">
                    <i class="fas fa-lightbulb"></i> Giải thích
                </div>
                <p class="text-sm text-slate-400 italic leading-relaxed">${q.explanation}</p>
            </div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;

    document.getElementById('prev-q').disabled = currentIndex === 0;
    nextBtn.disabled = !hasAnswered;
    nextBtn.textContent = currentIndex === currentQuestions.length - 1 ? "Xem kết quả" : "Câu tiếp theo";
    nextBtn.onclick = () => {
        if (currentIndex < currentQuestions.length - 1) {
            currentIndex++;
            renderQuestion();
        } else {
            showResult();
        }
    };
}

// --- Xử lý nộp bài ---
window.submitMCQ = (key) => {
    const q = currentQuestions[currentIndex];
    userAnswers[currentIndex] = {
        selected: key,
        isCorrect: q.correct === key,
        type: 'mcq'
    };
    renderQuestion();
};

window.submitShortAnswer = () => {
    const input = document.getElementById('short-answer-input').value.trim();
    if (!input) return;
    
    const q = currentQuestions[currentIndex];
    const isCorrect = input.toLowerCase() === q.correct.toLowerCase();
    
    userAnswers[currentIndex] = {
        selected: input,
        isCorrect: isCorrect,
        type: 'short'
    };
    renderQuestion();
};

// --- Kết quả ---
function showResult() {
    clearInterval(timerInterval);
    const correctCount = userAnswers.filter(a => a?.isCorrect).length;
    const score = Math.round((correctCount / currentQuestions.length) * 100);
    const content = document.getElementById('quiz-content');
    
    document.getElementById('timer-progress-bar').style.width = "0%";
    
    content.innerHTML = `
        <div class="text-center py-10 animate-bounceIn">
            <div class="text-6xl mb-6">${score >= 80 ? '👑' : score >= 50 ? '⭐' : '📝'}</div>
            <h2 class="text-5xl font-black text-white mb-2">${score}%</h2>
            <p class="text-slate-400 text-lg mb-8">Bạn đúng ${correctCount}/${currentQuestions.length} câu hỏi.</p>
            <button id="restart-quiz-btn" class="w-full max-w-xs py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20">
                <i class="fas fa-redo mr-2"></i> LUYỆN TẬP LẠI
            </button>
        </div>
    `;
    
    document.getElementById('restart-quiz-btn').onclick = restartQuiz;
    document.getElementById('quiz-footer').classList.add('hidden');
    document.getElementById('quiz-progress').textContent = "Hoàn thành";
}

window.restartQuiz = () => {
    // Hiển thị lại màn hình đếm ngược 5 giây trước khi vào lượt mới
    showCountdownOverlay();
};

// --- Khởi tạo ---
const startApp = async () => {
    try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
        initQuizUI();
    } catch (e) { console.error("Auth Error", e); }
};

startApp();

// Styles bổ sung
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bounceIn { 0% { transform: scale(0.9); opacity: 0; } 70% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }
    .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
    .animate-bounceIn { animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    #quiz-wrapper { scroll-margin-top: 100px; }
    #short-answer-input::placeholder { color: #475569; }
    .flex-center { display: flex; align-items: center; justify-content: center; }
`;
document.head.appendChild(style);