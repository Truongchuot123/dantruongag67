 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
        let rawLinks = [];
        let allQuestions = [];
        let filteredQuestions = [];
        let currentPage = 1;
        const itemsPerPage = 5;
        let deletingId = null;

        // Initialize Auth
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
                document.getElementById('auth-status').textContent = "UID: " + u.uid.substring(0,8);
                loadMetaData();
                listenToQuestions();
            }
        });

        initAuth();

        // 1. Load Links for Dropdowns
        function loadMetaData() {
            const linksRef = collection(db, 'artifacts', appId, 'public', 'data', 'links');
            onSnapshot(linksRef, (snap) => {
                rawLinks = snap.docs.map(doc => doc.data());
                updateFormDatalists();
                updateFilters();
            }, (err) => console.error(err));
        }

        function updateFormDatalists() {
            const subjects = [...new Set(rawLinks.map(l => l.subject))].filter(Boolean).sort();
            document.getElementById('subjectList').innerHTML = subjects.map(s => `<option value="${s}">`).join('');
        }

        // Dependent dropdowns in form
        document.getElementById('subject').addEventListener('input', () => {
            const val = document.getElementById('subject').value;
            const filtered = rawLinks.filter(l => l.subject === val);
            const topics = [...new Set(filtered.map(l => l.topic))].filter(Boolean).sort();
            const lessons = [...new Set(filtered.map(l => l.title))].filter(Boolean).sort();
            document.getElementById('topicList').innerHTML = topics.map(t => `<option value="${t}">`).join('');
            document.getElementById('lessonList').innerHTML = lessons.map(l => `<option value="${l}">`).join('');
        });

        // 2. Questions Logic
        function listenToQuestions() {
            const qRef = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
            onSnapshot(qRef, (snap) => {
                allQuestions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                
                // Grouping Logic: Sort by Subject > Topic > Lesson
                allQuestions.sort((a, b) => {
                    if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
                    if (a.topic !== b.topic) return a.topic.localeCompare(b.topic);
                    return (a.lesson || "").localeCompare(b.lesson || "");
                });

                document.getElementById('total-count').textContent = allQuestions.length;
                document.getElementById('count-badge').textContent = allQuestions.length;
                if (allQuestions.length > 0) {
                    const sortedByDate = [...allQuestions].sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                    document.getElementById('latest-subject').textContent = sortedByDate[0].subject || "N/A";
                }
                
                updateFilters();
                applyFilters();
            }, (err) => console.error(err));
        }

        // 3. Filters & Pagination
        function updateFilters() {
            const subjects = [...new Set(allQuestions.map(q => q.subject))].filter(Boolean).sort();
            const selectedSub = document.getElementById('subjectFilter').value;
            
            let subHtml = '<option value="">Tất cả môn học</option>';
            subjects.forEach(s => subHtml += `<option value="${s}" ${s === selectedSub ? 'selected' : ''}>${s}</option>`);
            document.getElementById('subjectFilter').innerHTML = subHtml;

            // Update topic filter based on subject
            const topics = [...new Set(allQuestions.filter(q => !selectedSub || q.subject === selectedSub).map(q => q.topic))].filter(Boolean).sort();
            const selectedTopic = document.getElementById('topicFilter').value;
            let topHtml = '<option value="">Tất cả chủ đề</option>';
            topics.forEach(t => topHtml += `<option value="${t}" ${t === selectedTopic ? 'selected' : ''}>${t}</option>`);
            document.getElementById('topicFilter').innerHTML = topHtml;
        }

        function applyFilters() {
            const search = document.getElementById('searchFilter').value.toLowerCase();
            const sub = document.getElementById('subjectFilter').value;
            const top = document.getElementById('topicFilter').value;

            filteredQuestions = allQuestions.filter(q => {
                const matchSearch = q.content.toLowerCase().includes(search);
                const matchSub = !sub || q.subject === sub;
                const matchTop = !top || q.topic === top;
                return matchSearch && matchSub && matchTop;
            });

            currentPage = 1;
            renderList();
        }

        window.renderList = function() {
            const container = document.getElementById('questions-container');
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginated = filteredQuestions.slice(start, end);

            if (paginated.length === 0) {
                container.innerHTML = `<div class="py-20 text-center text-slate-500">Không tìm thấy câu hỏi nào.</div>`;
                document.getElementById('page-info').textContent = "0-0";
                document.getElementById('total-info').textContent = "0";
                return;
            }

            let html = "";
            paginated.forEach((q, idx) => {
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
                                <button onclick="openDeleteModal('${q.id}')" class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-colors">
                                    <i class="fas fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <h4 class="text-sm font-semibold text-slate-100 mb-4 leading-relaxed">${q.content}</h4>
                        
                        ${isMCQ ? `
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                ${['A','B','C','D'].map(o => `
                                    <div class="p-2 rounded-lg border ${q.correct === o ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 font-bold' : 'border-slate-700 text-slate-400'}">
                                        <span class="mr-2 opacity-50">${o}.</span> ${q.options[o]}
                                        ${q.correct === o ? '<i class="fas fa-check ml-2"></i>' : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                <div class="text-[10px] text-emerald-500 font-bold uppercase mb-1">Đáp án đúng</div>
                                <div class="text-xs text-slate-200">${q.correct}</div>
                            </div>
                        `}

                        ${q.explanation ? `
                            <div class="mt-4 pt-3 border-t border-slate-700/50 text-[11px] text-slate-500 italic">
                                <i class="fas fa-info-circle mr-1"></i> ${q.explanation}
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            container.innerHTML = html;
            document.getElementById('page-info').textContent = `${start + 1}-${Math.min(end, filteredQuestions.length)}`;
            document.getElementById('total-info').textContent = filteredQuestions.length;
            
            document.getElementById('prevPage').disabled = currentPage === 1;
            document.getElementById('nextPage').disabled = end >= filteredQuestions.length;
        };

        // Actions
        document.getElementById('prevPage').onclick = () => { if(currentPage > 1) { currentPage--; renderList(); }};
        document.getElementById('nextPage').onclick = () => { if(currentPage * itemsPerPage < filteredQuestions.length) { currentPage++; renderList(); }};
        document.getElementById('searchFilter').oninput = applyFilters;
        document.getElementById('subjectFilter').onchange = () => { updateFilters(); applyFilters(); };
        document.getElementById('topicFilter').onchange = applyFilters;

        // 4. Form Submission (Add/Edit)
        document.getElementById('questionForm').onsubmit = async (e) => {
            e.preventDefault();
            if (!user) return showToast("Vui lòng chờ xác thực...");

            const btn = document.getElementById('submitBtn');
            const editId = document.getElementById('editId').value;
            const type = document.getElementById('type').value;

            const formData = {
                type,
                subject: document.getElementById('subject').value.trim(),
                topic: document.getElementById('topic').value.trim(),
                lesson: document.getElementById('lesson').value.trim(),
                content: document.getElementById('content').value.trim(),
                explanation: document.getElementById('explanation').value.trim(),
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
                formData.correct = document.querySelector('input[name="correct"]:checked').value;
            } else {
                formData.correct = document.getElementById('correct_answer_short').value.trim();
            }

            btn.disabled = true;
            btn.innerHTML = `<div class="loader mx-auto"></div>`;

            try {
                if (editId) {
                    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'questions', editId), formData);
                    showToast("Cập nhật thành công! ✏️");
                } else {
                    formData.createdAt = serverTimestamp();
                    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'questions'), formData);
                    showToast("Thêm mới thành công! ✨");
                }
                resetForm();
            } catch (err) {
                showToast("Lỗi thao tác dữ liệu");
            } finally {
                btn.disabled = false;
                btn.textContent = "Lưu Câu Hỏi";
            }
        };

        window.editQuestion = function(id) {
            const q = allQuestions.find(item => item.id === id);
            if (!q) return;

            document.getElementById('editId').value = q.id;
            document.getElementById('type').value = q.type;
            document.getElementById('subject').value = q.subject;
            document.getElementById('topic').value = q.topic;
            document.getElementById('lesson').value = q.lesson || "";
            document.getElementById('content').value = q.content;
            document.getElementById('explanation').value = q.explanation || "";

            // Trigger dependent list update
            const inputEv = new Event('input');
            document.getElementById('subject').dispatchEvent(inputEv);

            if (q.type === 'multiple_choice') {
                document.getElementById('mcqOptions').classList.remove('hidden');
                document.getElementById('shortAnswerSection').classList.add('hidden');
                document.getElementById('opt_A').value = q.options.A;
                document.getElementById('opt_B').value = q.options.B;
                document.getElementById('opt_C').value = q.options.C;
                document.getElementById('opt_D').value = q.options.D;
                document.querySelector(`input[name="correct"][value="${q.correct}"]`).checked = true;
            } else {
                document.getElementById('mcqOptions').classList.add('hidden');
                document.getElementById('shortAnswerSection').classList.remove('hidden');
                document.getElementById('correct_answer_short').value = q.correct;
            }

            document.getElementById('edit-indicator').classList.remove('hidden');
            switchTab('form');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.resetForm = function() {
            document.getElementById('questionForm').reset();
            document.getElementById('editId').value = "";
            document.getElementById('edit-indicator').classList.add('hidden');
            document.getElementById('mcqOptions').classList.remove('hidden');
            document.getElementById('shortAnswerSection').classList.add('hidden');
        };

        // 5. Delete Logic
        window.openDeleteModal = function(id) {
            deletingId = id;
            document.getElementById('deleteModal').classList.remove('hidden');
        };

        window.closeDeleteModal = function() {
            deletingId = null;
            document.getElementById('deleteModal').classList.add('hidden');
        };

        document.getElementById('confirmDeleteBtn').onclick = async () => {
            if (!deletingId) return;
            try {
                await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'questions', deletingId));
                showToast("Đã xóa câu hỏi");
                closeDeleteModal();
            } catch (err) {
                showToast("Lỗi khi xóa");
            }
        };

        // Global Helpers
        window.switchTab = function(tab) {
            const formSec = document.getElementById('section-form');
            const listSec = document.getElementById('section-list');
            const btnForm = document.getElementById('tab-form');
            const btnList = document.getElementById('tab-list');

            if (tab === 'form') {
                formSec.classList.remove('hidden');
                listSec.classList.add('hidden');
                btnForm.classList.add('active');
                btnList.classList.remove('active');
            } else {
                formSec.classList.add('hidden');
                listSec.classList.remove('hidden');
                btnForm.classList.remove('active');
                btnList.classList.add('active');
                renderList();
            }
        };

        function showToast(msg) {
            const t = document.getElementById('toast');
            document.getElementById('toastMsg').textContent = msg;
            t.classList.remove('opacity-0', 'translate-y-10');
            setTimeout(() => t.classList.add('opacity-0', 'translate-y-10'), 3000);
        }

        // Toggle Type Section on Change
        document.getElementById('type').addEventListener('change', (e) => {
            if (e.target.value === 'multiple_choice') {
                document.getElementById('mcqOptions').classList.remove('hidden');
                document.getElementById('shortAnswerSection').classList.add('hidden');
            } else {
                document.getElementById('mcqOptions').classList.add('hidden');
                document.getElementById('shortAnswerSection').classList.remove('hidden');
            }
        });
