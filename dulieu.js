import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Cấu hình kết nối Firebase
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

// State Management
let user = null;
let rawLinks = [];         // Danh sách tài liệu (links)
let allQuestions = [];     // Danh sách câu hỏi (questions)
let filteredQuestions = []; // Câu hỏi sau khi lọc
let currentPage = 1;
const itemsPerPage = 5;
let deletingId = null;
let deleteType = ''; // 'doc' hoặc 'quiz'

// Khởi chạy Authentication
const initAuth = async () => {
    try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
    } catch (e) {
        showToast("Lỗi kết nối Server");
    }
};

onAuthStateChanged(auth, (u) => {
    if (u) {
        user = u;
        const authStatusEl = document.getElementById('auth-status');
        if (authStatusEl) {
            authStatusEl.innerHTML = `<i class="fas fa-circle text-emerald-500 mr-1.5 text-[8px] animate-pulse"></i>UID: ` + u.uid.substring(0, 8);
        }
        loadMetaData();      // Tải và lắng nghe danh sách tài liệu từ Firebase
        listenToQuestions(); // Tải và lắng nghe danh sách câu hỏi từ Firebase
    }
});

initAuth();

// ==========================================
// 1. TÀI LIỆU (LINKS) LOGIC & FIREBASE
// ==========================================

// Tải dữ liệu tài liệu (links) và lắng nghe thay đổi thời gian thực
function loadMetaData() {
    const linksRef = collection(db, 'artifacts', appId, 'public', 'data', 'links');
    onSnapshot(linksRef, (snap) => {
        rawLinks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sắp xếp tài liệu mới nhất lên đầu
        rawLinks.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        updateFormDatalists();
        updateFilters();
        autoCheckAndSyncQuizStatus(); // Tự động đồng bộ trạng thái có trắc nghiệm
        
        // Render danh sách tài liệu lên giao diện nếu đang ở tab tài liệu
        if (typeof renderDocs === 'function') {
            renderDocs();
        } else {
            localRenderDocs();
        }
    }, (err) => console.error("Lỗi đồng bộ tài liệu:", err));
}

// Cập nhật các ô gợi ý (datalist) dựa trên dữ liệu môn học hiện có
function updateFormDatalists() {
    const subjects = [...new Set(rawLinks.map(l => l.subject))].filter(Boolean).sort();
    const subjectListEl = document.getElementById('subjectList');
    if (subjectListEl) {
        subjectListEl.innerHTML = subjects.map(s => `<option value="${s}">`).join('');
    }
    
    // Đồng bộ datalist cho form popup của modal tài liệu
    const modalSubList = document.getElementById('modalSubjectList');
    if (modalSubList) {
        modalSubList.innerHTML = subjects.map(s => `<option value="${s}">`).join('');
    }
}

// Lắng nghe sự kiện thay đổi môn học để lọc nhanh chủ đề/bài học tương ứng
const subjectInput = document.getElementById('subject');
if (subjectInput) {
    subjectInput.addEventListener('input', () => {
        const val = subjectInput.value;
        const filtered = rawLinks.filter(l => l.subject === val);
        const topics = [...new Set(filtered.map(l => l.topic))].filter(Boolean).sort();
        const lessons = [...new Set(filtered.map(l => l.title))].filter(Boolean).sort();
        
        const topicListEl = document.getElementById('topicList');
        const lessonListEl = document.getElementById('lessonList');
        if (topicListEl) topicListEl.innerHTML = topics.map(t => `<option value="${t}">`).join('');
        if (lessonListEl) lessonListEl.innerHTML = lessons.map(l => `<option value="${l}">`).join('');
    });
}

// Xử lý gửi Form Tài Liệu (Thêm/Sửa Link Tài liệu học tập) lên Firebase
const docForm = document.getElementById('docForm');
if (docForm) {
    docForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!user) return showToast("Vui lòng chờ xác thực...");

        const btn = document.getElementById('submitDocBtn');
        const editDocId = document.getElementById('editDocId').value;
        const subject = document.getElementById('docSubject').value.trim();
        const topic = document.getElementById('docTopic').value.trim();
        const title = document.getElementById('docTitle').value.trim();
        const url = document.getElementById('docUrl').value.trim();
        const isQuizDone = document.getElementById('docIsQuizDone') ? document.getElementById('docIsQuizDone').checked : false;

        const docData = {
            subject,
            topic,
            title,
            url, // Đường dẫn bài viết / Google Drive học tập
            isQuizDone,
            authorId: user.uid,
            updatedAt: serverTimestamp()
        };

        btn.disabled = true;
        const originalText = btn.textContent;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i> Đang lưu trữ...`;

        try {
            if (editDocId) {
                // Cập nhật tài liệu đã có
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'links', editDocId), docData);
                showToast("Cập nhật tài liệu thành công! ✏️");
            } else {
                // Thêm mới tài liệu vào Firebase
                docData.createdAt = serverTimestamp();
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'links'), docData);
                showToast("Thêm tài liệu thành công! ✨");
            }
            if (typeof closeDocModal === 'function') {
                closeDocModal();
            }
        } catch (err) {
            console.error(err);
            showToast("Lỗi thao tác dữ liệu tài liệu");
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

// Render danh sách tài liệu nếu file HTML gọi local script này
function localRenderDocs() {
    const tbody = document.getElementById('docTableBody');
    if (!tbody) return;

    if (rawLinks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="py-10 text-center text-slate-500">Chưa có tài liệu nào được soạn.</td></tr>`;
        return;
    }

    tbody.innerHTML = rawLinks.map(item => {
        const hasUrl = item.url && item.url.trim() !== '';
        return `
        <tr class="hover:bg-slate-800/30 transition-colors group">
            <td class="px-4 py-4 align-top">
                <span class="inline-block text-[10px] font-extrabold text-indigo-300 uppercase bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 truncate">
                    ${item.subject}
                </span>
            </td>
            <td class="px-4 py-4 align-top">
                <span class="inline-block text-[10px] font-extrabold text-purple-300 uppercase bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 truncate">
                    ${item.topic}
                </span>
            </td>
            <td class="px-4 py-4 align-top">
                <div class="font-semibold text-slate-200 text-xs sm:text-sm leading-relaxed">
                    ${item.title}
                </div>
                ${hasUrl ? `
                    <div class="text-[10px] text-slate-500 truncate mt-1 max-w-xs">${item.url}</div>
                ` : `
                    <div class="text-[10px] text-rose-400 italic mt-1 font-medium flex items-center gap-1">
                        <i class="fas fa-clock fa-spin"></i> Đang chờ soạn thảo nội dung...
                    </div>
                `}
            </td>
            <td class="px-2 py-4 text-center align-top">
                ${item.isQuizDone ? `
                    <div class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400">
                        <i class="fas fa-check text-xs"></i>
                    </div>
                ` : `
                    <div class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-600">
                        <i class="far fa-circle text-xs"></i>
                    </div>
                `}
            </td>
            <td class="px-2 py-4 text-center align-top">
                ${hasUrl ? `
                    <a href="${item.url}" target="_blank" class="w-8 h-8 inline-flex items-center justify-center bg-slate-800 hover:bg-indigo-600 rounded-lg transition-all border border-slate-700/80">
                        <i class="fas fa-external-link-alt text-[10px]"></i>
                    </a>
                ` : '-'}
            </td>
            <td class="px-4 py-4 text-right align-top">
                <div class="flex justify-end gap-1.5">
                    <button onclick="editDocItem('${item.id}')" class="w-7 h-7 flex items-center justify-center text-blue-400 hover:bg-blue-400/15 rounded-lg transition-colors">
                        <i class="fas fa-edit text-[10px]"></i>
                    </button>
                    <button onclick="openDeleteModalCustom('doc', '${item.id}')" class="w-7 h-7 flex items-center justify-center text-rose-400 hover:bg-rose-400/15 rounded-lg transition-colors">
                        <i class="fas fa-trash text-[10px]"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// Chuẩn bị chỉnh sửa tài liệu
window.editDocItem = function(id) {
    const item = rawLinks.find(l => l.id === id);
    if (!item) return;
    
    const editIdEl = document.getElementById('editDocId');
    const subEl = document.getElementById('docSubject');
    const topEl = document.getElementById('docTopic');
    const titleEl = document.getElementById('docTitle');
    const urlEl = document.getElementById('docUrl');
    const quizDoneEl = document.getElementById('docIsQuizDone');
    const titleModal = document.getElementById('docModalTitle');

    if (editIdEl) editIdEl.value = id;
    if (subEl) subEl.value = item.subject;
    if (topEl) topEl.value = item.topic;
    if (titleEl) titleEl.value = item.title;
    if (urlEl) urlEl.value = item.url || '';
    if (quizDoneEl) quizDoneEl.checked = item.isQuizDone || false;
    if (titleModal) titleModal.textContent = "Cập nhật tài liệu học tập";

    if (typeof openDocModal === 'function') openDocModal();
};

// ==========================================
// 2. NGÂN HÀNG CÂU HỎI (QUESTIONS) LOGIC
// ==========================================

function listenToQuestions() {
    const qRef = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
    onSnapshot(qRef, (snap) => {
        allQuestions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Sắp xếp câu hỏi: Môn học > Chủ đề > Bài học
        allQuestions.sort((a, b) => {
            if (a.subject !== b.subject) return (a.subject || "").localeCompare(b.subject || "");
            if (a.topic !== b.topic) return (a.topic || "").localeCompare(b.topic || "");
            return (a.lesson || "").localeCompare(b.lesson || "");
        });

        const totalCountEl = document.getElementById('total-count');
        const countBadgeEl = document.getElementById('count-badge');
        if (totalCountEl) totalCountEl.textContent = allQuestions.length;
        if (countBadgeEl) countBadgeEl.textContent = allQuestions.length;

        if (allQuestions.length > 0) {
            const sortedByDate = [...allQuestions].sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            const latestSubjectEl = document.getElementById('latest-subject');
            if (latestSubjectEl) latestSubjectEl.textContent = sortedByDate[0].subject || "N/A";
        }
        
        updateFilters();
        applyFilters();
        autoCheckAndSyncQuizStatus();
    }, (err) => console.error("Lỗi đồng bộ câu hỏi:", err));
}

// Tự động kiểm tra chéo: Nếu môn học & chủ đề có câu hỏi, đánh dấu 'isQuizDone' = true cho tài liệu
function autoCheckAndSyncQuizStatus() {
    if (rawLinks.length === 0 || allQuestions.length === 0) return;

    rawLinks.forEach(async (docItem) => {
        const docSubjectNorm = (docItem.subject || '').trim().toLowerCase();
        const docTopicNorm = (docItem.topic || '').trim().toLowerCase();

        const hasMatchingQuiz = allQuestions.some(q => 
            (q.subject || '').trim().toLowerCase() === docSubjectNorm &&
            (q.topic || '').trim().toLowerCase() === docTopicNorm
        );

        if (hasMatchingQuiz && !docItem.isQuizDone) {
            try {
                const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'links', docItem.id);
                await updateDoc(docRef, { isQuizDone: true, updatedAt: serverTimestamp() });
            } catch (e) {
                console.error("Lỗi tự động cập nhật trạng thái trắc nghiệm:", e);
            }
        }
    });
}

// Cập nhật bộ lọc lựa chọn ở thanh tìm kiếm
function updateFilters() {
    const subjects = [...new Set(allQuestions.map(q => q.subject))].filter(Boolean).sort();
    const subFilterEl = document.getElementById('subjectFilter');
    if (subFilterEl) {
        const selectedSub = subFilterEl.value;
        let subHtml = '<option value="">Tất cả môn học</option>';
        subjects.forEach(s => subHtml += `<option value="${s}" ${s === selectedSub ? 'selected' : ''}>${s}</option>`);
        subFilterEl.innerHTML = subHtml;

        const topicFilterEl = document.getElementById('topicFilter');
        if (topicFilterEl) {
            const topics = [...new Set(allQuestions.filter(q => !selectedSub || q.subject === selectedSub).map(q => q.topic))].filter(Boolean).sort();
            const selectedTopic = topicFilterEl.value;
            let topHtml = '<option value="">Tất cả chủ đề</option>';
            topics.forEach(t => topHtml += `<option value="${t}" ${t === selectedTopic ? 'selected' : ''}>${t}</option>`);
            topicFilterEl.innerHTML = topHtml;
        }
    }
}

function applyFilters() {
    const searchFilterEl = document.getElementById('searchFilter');
    const subFilterEl = document.getElementById('subjectFilter');
    const topicFilterEl = document.getElementById('topicFilter');

    const search = searchFilterEl ? searchFilterEl.value.toLowerCase() : '';
    const sub = subFilterEl ? subFilterEl.value : '';
    const top = topicFilterEl ? topicFilterEl.value : '';

    filteredQuestions = allQuestions.filter(q => {
        const matchSearch = q.content ? q.content.toLowerCase().includes(search) : false;
        const matchSub = !sub || q.subject === sub;
        const matchTop = !top || q.topic === top;
        return matchSearch && matchSub && matchTop;
    });

    currentPage = 1;
    renderList();
}

window.renderList = function() {
    const container = document.getElementById('questions-container');
    if (!container) return;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = filteredQuestions.slice(start, end);

    if (paginated.length === 0) {
        container.innerHTML = `<div class="py-20 text-center text-slate-500">Không tìm thấy câu hỏi nào.</div>`;
        const pageInfoEl = document.getElementById('page-info');
        const totalInfoEl = document.getElementById('total-info');
        if (pageInfoEl) pageInfoEl.textContent = "0-0";
        if (totalInfoEl) totalInfoEl.textContent = "0";
        return;
    }

    let html = "";
    paginated.forEach((q) => {
        const isMCQ = q.type === 'multiple_choice';
        html += `
            <div class="glass-card p-5 rounded-2xl border-l-4 ${isMCQ ? 'border-l-indigo-500' : 'border-l-emerald-500'} transition-all hover:translate-x-1">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex flex-wrap gap-2">
                        <span class="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase">${q.subject}</span>
                        <span class="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] font-medium">${q.topic}</span>
                        ${q.lesson ? `<span class="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">${q.lesson}</span>` : ''}
                    </div>
                    <div class="flex gap-2">
                        <button onclick="editQuestion('${q.id}')" class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 hover:bg-amber-400 hover:text-slate-900 transition-colors">
                            <i class="fas fa-edit text-xs"></i>
                        </button>
                        <button onclick="openDeleteModalCustom('quiz', '${q.id}')" class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-colors">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                </div>
                <h4 class="text-sm font-semibold text-slate-100 mb-4 leading-relaxed">${escapeHtml(q.content)}</h4>
                
                ${isMCQ ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        ${['A','B','C','D'].map(o => {
                            const optionText = q.options ? q.options[o] : (q[`opt_${o}`] || '');
                            const isCorrect = q.correct === o || q.correctAnswer === o;
                            return `
                                <div class="p-2 rounded-lg border ${isCorrect ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 font-bold' : 'border-slate-700 text-slate-400'}">
                                    <span class="mr-2 opacity-50">${o}.</span> ${escapeHtml(optionText)}
                                    ${isCorrect ? '<i class="fas fa-check ml-2"></i>' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <div class="text-[10px] text-emerald-500 font-bold uppercase mb-1">Đáp án đúng</div>
                        <div class="text-xs text-slate-200">${escapeHtml(q.correct || q.correctAnswerShort || '')}</div>
                    </div>
                `}

                ${q.explanation ? `
                    <div class="mt-4 pt-3 border-t border-slate-700/50 text-[11px] text-slate-500 italic">
                        <i class="fas fa-info-circle mr-1"></i> ${escapeHtml(q.explanation)}
                    </div>
                ` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
    
    const pageInfoEl = document.getElementById('page-info');
    const totalInfoEl = document.getElementById('total-info');
    if (pageInfoEl) pageInfoEl.textContent = `${start + 1}-${Math.min(end, filteredQuestions.length)}`;
    if (totalInfoEl) totalInfoEl.textContent = filteredQuestions.length;
    
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = end >= filteredQuestions.length;
};

// Điều hướng phân trang câu hỏi
const prevPageBtn = document.getElementById('prevPage');
if (prevPageBtn) prevPageBtn.onclick = () => { if(currentPage > 1) { currentPage--; renderList(); }};

const nextPageBtn = document.getElementById('nextPage');
if (nextPageBtn) nextPageBtn.onclick = () => { if(currentPage * itemsPerPage < filteredQuestions.length) { currentPage++; renderList(); }};

const searchFilterInput = document.getElementById('searchFilter');
if (searchFilterInput) searchFilterInput.oninput = applyFilters;

const subFilterSelect = document.getElementById('subjectFilter');
if (subFilterSelect) subFilterSelect.onchange = () => { updateFilters(); applyFilters(); };

const topicFilterSelect = document.getElementById('topicFilter');
if (topicFilterSelect) topicFilterSelect.onchange = applyFilters;

// Gửi form lưu câu hỏi (Thêm mới/Cập nhật câu hỏi)
const questionForm = document.getElementById('questionForm');
if (questionForm) {
    questionForm.onsubmit = async (e) => {
        e.preventDefault();
        if (!user) return showToast("Vui lòng chờ xác thực...");

        const btn = document.getElementById('submitBtn') || document.getElementById('submitQuizBtn');
        const editId = document.getElementById('editId')?.value || document.getElementById('editQuizId')?.value;
        const type = document.getElementById('type')?.value || document.getElementById('quizType')?.value;

        const formData = {
            type,
            subject: (document.getElementById('subject')?.value || document.getElementById('quizSubject')?.value).trim(),
            topic: (document.getElementById('topic')?.value || document.getElementById('quizTopic')?.value).trim(),
            lesson: (document.getElementById('lesson')?.value || document.getElementById('quizLesson')?.value || "").trim(),
            content: (document.getElementById('content')?.value || document.getElementById('quizContent')?.value).trim(),
            explanation: (document.getElementById('explanation')?.value || document.getElementById('quizExplanation')?.value || "").trim(),
            authorId: user.uid,
            updatedAt: serverTimestamp()
        };

        if (type === 'multiple_choice') {
            formData.options = {
                A: document.getElementById('opt_A').value.trim(),
                B: document.getElementById('opt_B').value.trim(),
                C: document.getElementById('opt_C').value.trim(),
                D: document.getElementById('opt_D').value.trim(),
            };
            // Tương thích với các định dạng trường trong HTML
            formData.opt_A = formData.options.A;
            formData.opt_B = formData.options.B;
            formData.opt_C = formData.options.C;
            formData.opt_D = formData.options.D;

            const radioChecked = document.querySelector('input[name="correct"]:checked') || document.querySelector('input[name="correctAnswer"]:checked');
            formData.correct = radioChecked ? radioChecked.value : 'A';
            formData.correctAnswer = formData.correct;
        } else {
            const shortAnsVal = (document.getElementById('correct_answer_short')?.value || "").trim();
            formData.correct = shortAnsVal;
            formData.correctAnswerShort = shortAnsVal;
        }

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<div class="loader mx-auto"></div>`;
        }

        try {
            if (editId) {
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'questions', editId), formData);
                showToast("Cập nhật câu hỏi thành công! ✏️");
            } else {
                formData.createdAt = serverTimestamp();
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'questions'), formData);
                showToast("Thêm mới câu hỏi thành công! ✨");
            }
            resetForm();
            if (typeof switchQuizSubTab === 'function') switchQuizSubTab('list');
        } catch (err) {
            console.error(err);
            showToast("Lỗi thao tác dữ liệu");
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = "Lưu Câu Hỏi";
            }
        }
    };
}

window.editQuestion = function(id) {
    const q = allQuestions.find(item => item.id === id);
    if (!q) return;

    const editIdEl = document.getElementById('editId') || document.getElementById('editQuizId');
    const typeEl = document.getElementById('type') || document.getElementById('quizType');
    const subEl = document.getElementById('subject') || document.getElementById('quizSubject');
    const topEl = document.getElementById('topic') || document.getElementById('quizTopic');
    const lesEl = document.getElementById('lesson') || document.getElementById('quizLesson');
    const contentEl = document.getElementById('content') || document.getElementById('quizContent');
    const expEl = document.getElementById('explanation') || document.getElementById('quizExplanation');

    if (editIdEl) editIdEl.value = q.id;
    if (typeEl) typeEl.value = q.type;
    if (subEl) subEl.value = q.subject;
    if (topEl) topEl.value = q.topic;
    if (lesEl) lesEl.value = q.lesson || "";
    if (contentEl) contentEl.value = q.content;
    if (expEl) expEl.value = q.explanation || "";

    // Kích hoạt cập nhật dropdown liên quan
    if (subEl) {
        const inputEv = new Event('input');
        subEl.dispatchEvent(inputEv);
    }

    const opt_A = q.options?.A || q.opt_A || "";
    const opt_B = q.options?.B || q.opt_B || "";
    const opt_C = q.options?.C || q.opt_C || "";
    const opt_D = q.options?.D || q.opt_D || "";
    const correctVal = q.correct || q.correctAnswer || "A";

    if (q.type === 'multiple_choice') {
        const mcqEl1 = document.getElementById('mcqOptions');
        const mcqEl2 = document.getElementById('quizMcqOptions');
        if (mcqEl1) mcqEl1.classList.remove('hidden');
        if (mcqEl2) mcqEl2.classList.remove('hidden');

        const shortEl1 = document.getElementById('shortAnswerSection');
        const shortEl2 = document.getElementById('quizShortAnswer');
        if (shortEl1) shortEl1.classList.add('hidden');
        if (shortEl2) shortEl2.classList.add('hidden');

        document.getElementById('opt_A').value = opt_A;
        document.getElementById('opt_B').value = opt_B;
        document.getElementById('opt_C').value = opt_C;
        document.getElementById('opt_D').value = opt_D;

        const radioBtn = document.querySelector(`input[name="correct"][value="${correctVal}"]`) || document.querySelector(`input[name="correctAnswer"][value="${correctVal}"]`);
        if (radioBtn) radioBtn.checked = true;
    } else {
        const mcqEl1 = document.getElementById('mcqOptions');
        const mcqEl2 = document.getElementById('quizMcqOptions');
        if (mcqEl1) mcqEl1.classList.add('hidden');
        if (mcqEl2) mcqEl2.classList.add('hidden');

        const shortEl1 = document.getElementById('shortAnswerSection');
        const shortEl2 = document.getElementById('quizShortAnswer');
        if (shortEl1) shortEl1.classList.remove('hidden');
        if (shortEl2) shortEl2.classList.remove('hidden');

        const answerShortInput = document.getElementById('correct_answer_short');
        if (answerShortInput) answerShortInput.value = q.correct || q.correctAnswerShort || "";
    }

    const editInd1 = document.getElementById('edit-indicator');
    const editInd2 = document.getElementById('edit-quiz-indicator');
    if (editInd1) editInd1.classList.remove('hidden');
    if (editInd2) editInd2.classList.remove('hidden');

    if (typeof switchQuizSubTab === 'function') {
        switchQuizSubTab('form');
    } else if (typeof switchTab === 'function') {
        switchTab('form');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.resetForm = function(isFullReset = false) {
    const qForm = document.getElementById('questionForm');
    if (isFullReset && qForm) {
        qForm.reset();
        const editIdEl = document.getElementById('editId') || document.getElementById('editQuizId');
        if (editIdEl) editIdEl.value = "";
        
        const ind1 = document.getElementById('edit-indicator');
        const ind2 = document.getElementById('edit-quiz-indicator');
        if (ind1) ind1.classList.add('hidden');
        if (ind2) ind2.classList.add('hidden');
    } else {
        const editIdEl = document.getElementById('editId') || document.getElementById('editQuizId');
        if (editIdEl) editIdEl.value = "";
        
        const ind1 = document.getElementById('edit-indicator');
        const ind2 = document.getElementById('edit-quiz-indicator');
        if (ind1) ind1.classList.add('hidden');
        if (ind2) ind2.classList.add('hidden');

        const contentInput = document.getElementById('content') || document.getElementById('quizContent');
        const expInput = document.getElementById('explanation') || document.getElementById('quizExplanation');
        if (contentInput) contentInput.value = "";
        if (expInput) expInput.value = "";
        
        const optA = document.getElementById('opt_A');
        const optB = document.getElementById('opt_B');
        const optC = document.getElementById('opt_C');
        const optD = document.getElementById('opt_D');
        if (optA) optA.value = "";
        if (optB) optB.value = "";
        if (optC) optC.value = "";
        if (optD) optD.value = "";
        
        const shortAnsInput = document.getElementById('correct_answer_short');
        if (shortAnsInput) shortAnsInput.value = "";
    }

    const typeEl = document.getElementById('type') || document.getElementById('quizType');
    if (typeEl) {
        const val = typeEl.value;
        const mcqEl1 = document.getElementById('mcqOptions');
        const mcqEl2 = document.getElementById('quizMcqOptions');
        const shortEl1 = document.getElementById('shortAnswerSection');
        const shortEl2 = document.getElementById('quizShortAnswer');

        if (val === 'multiple_choice') {
            if (mcqEl1) mcqEl1.classList.remove('hidden');
            if (mcqEl2) mcqEl2.classList.remove('hidden');
            if (shortEl1) shortEl1.classList.add('hidden');
            if (shortEl2) shortEl2.classList.add('hidden');
        } else {
            if (mcqEl1) mcqEl1.classList.add('hidden');
            if (mcqEl2) mcqEl2.classList.add('hidden');
            if (shortEl1) shortEl1.classList.remove('hidden');
            if (shortEl2) shortEl2.classList.remove('hidden');
        }
    }
};

// ==========================================
// 3. LOGIC XÓA DỮ LIỆU ĐỒNG BỘ
// ==========================================

window.openDeleteModalCustom = function(type, id) {
    deleteType = type;
    deletingId = id;
    const delModal = document.getElementById('deleteModal');
    if (delModal) {
        delModal.classList.remove('hidden');
        delModal.classList.add('flex');
    }
};

window.openDeleteModal = function(id) {
    window.openDeleteModalCustom('quiz', id);
};

window.closeDeleteModal = function() {
    deletingId = null;
    deleteType = '';
    const delModal = document.getElementById('deleteModal');
    if (delModal) {
        delModal.classList.add('hidden');
        delModal.classList.remove('flex');
    }
};

const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
if (confirmDeleteBtn) {
    confirmDeleteBtn.onclick = async () => {
        if (!deletingId) return;
        
        confirmDeleteBtn.disabled = true;
        const originalText = confirmDeleteBtn.textContent;
        confirmDeleteBtn.textContent = "Đang xóa...";

        try {
            if (deleteType === 'doc') {
                // Xóa tài liệu khỏi Firestore
                await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'links', deletingId));
                showToast("Đã xóa tài liệu thành công 🗑️");
            } else {
                // Mặc định hoặc 'quiz' thì xóa câu hỏi
                await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'questions', deletingId));
                showToast("Đã xóa câu hỏi khỏi ngân hàng 🗑️");
            }
            closeDeleteModal();
        } catch (err) {
            console.error(err);
            showToast("Lỗi khi xóa dữ liệu đám mây");
        } finally {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.textContent = originalText;
        }
    };
}

// ==========================================
// 4. TIỆN ÍCH KHÁC (UI / TOAST / ESCAPE)
// ==========================================

window.switchTab = function(tab) {
    const formSec = document.getElementById('section-form') || document.getElementById('quiz-section-form');
    const listSec = document.getElementById('section-list') || document.getElementById('quiz-section-list');
    const btnForm = document.getElementById('tab-form') || document.getElementById('quiz-subtab-form');
    const btnList = document.getElementById('tab-list') || document.getElementById('quiz-subtab-list');

    if (tab === 'form') {
        if (formSec) formSec.classList.remove('hidden');
        if (listSec) listSec.classList.add('hidden');
        if (btnForm) btnForm.classList.add('active');
        if (btnList) btnList.classList.remove('active');
    } else {
        if (formSec) formSec.classList.add('hidden');
        if (listSec) listSec.classList.remove('hidden');
        if (btnForm) btnForm.classList.remove('active');
        if (btnList) btnList.classList.add('active');
        renderList();
    }
};

function showToast(msg) {
    const t = document.getElementById('toast');
    const tMsg = document.getElementById('toastMsg');
    if (t && tMsg) {
        tMsg.textContent = msg;
        t.classList.remove('opacity-0', 'translate-y-10');
        t.classList.add('opacity-100', 'translate-y-0');
        setTimeout(() => {
            t.classList.add('opacity-0', 'translate-y-10');
            t.classList.remove('opacity-100', 'translate-y-0');
        }, 3000);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const typeSelect = document.getElementById('type') || document.getElementById('quizType');
if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
        const mcqEl1 = document.getElementById('mcqOptions');
        const mcqEl2 = document.getElementById('quizMcqOptions');
        const shortEl1 = document.getElementById('shortAnswerSection');
        const shortEl2 = document.getElementById('quizShortAnswer');

        if (e.target.value === 'multiple_choice') {
            if (mcqEl1) mcqEl1.classList.remove('hidden');
            if (mcqEl2) mcqEl2.classList.remove('hidden');
            if (shortEl1) shortEl1.classList.add('hidden');
            if (shortEl2) shortEl2.classList.add('hidden');
        } else {
            if (mcqEl1) mcqEl1.classList.add('hidden');
            if (mcqEl2) mcqEl2.classList.add('hidden');
            if (shortEl1) shortEl1.classList.remove('hidden');
            if (shortEl2) shortEl2.classList.remove('hidden');
        }
    });
}