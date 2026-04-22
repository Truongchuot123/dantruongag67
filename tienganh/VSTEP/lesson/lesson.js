document.addEventListener('DOMContentLoaded', () => {
    
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykgN9Mf37KxqMZx2XW1mqPJJ3jVunAWVEljUAszFJVwMLxDXJpDHg6cvpdkMHR2v_iKQ/exec';
    const lessonTitleElement = document.getElementById('lesson-title');
    let vocabularyData = [];

    /**
     * TẠO CẤU TRÚC PHẦN TỪ VỰNG VỚI STYLE MỚI
     */
    function createVocabularySection() {
        const mainContent = document.getElementById('main-content');
        const grammarSection = document.getElementById('grammar-section');
        
        if (!mainContent || !grammarSection) return;

        const section = document.createElement('section');
        section.id = 'vocabulary-section';
        section.className = 'lesson-section p-4 sm:p-6 lg:p-10 opacity-0 transition-all duration-1000 transform translate-y-4';

        const headerContainer = document.createElement('div');
        headerContainer.className = 'flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4';

        const h2 = document.createElement('h2');
        h2.className = 'section-title text-2xl md:text-3xl flex items-center m-0';
        
        const titleSpan = document.createElement('span');
        titleSpan.textContent = 'Vocabulary';
        h2.appendChild(titleSpan);

        const actionButtons = document.createElement('div');
        actionButtons.className = 'flex flex-wrap gap-2';

        const practiceBtn = document.createElement('button');
        practiceBtn.id = 'start-practice-btn';
        practiceBtn.className = 'hidden inline-flex items-center justify-center text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-6 rounded-full shadow-lg shadow-orange-100 transition-all active:scale-95';
        practiceBtn.innerHTML = `<i class="fas fa-brain mr-2"></i> Luyện Tập`;
        practiceBtn.onclick = openPracticeModal;

        const buttonLink = document.createElement('a');
        buttonLink.href = '/tienganh/vocab_notebook.html';
        buttonLink.target = '_blank';
        buttonLink.className = 'inline-flex items-center justify-center text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 rounded-full shadow-lg shadow-blue-200 transition-all active:scale-95';
        buttonLink.innerHTML = `<i class="fas fa-rocket mr-2"></i> Học Từ Vựng`;

        actionButtons.appendChild(practiceBtn);
        actionButtons.appendChild(buttonLink);
        headerContainer.appendChild(h2);
        headerContainer.appendChild(actionButtons);
        section.appendChild(headerContainer);

        const tableContainer = document.createElement('div');
        tableContainer.className = 'hidden md:block overflow-hidden rounded-2xl shadow-xl border border-gray-100 bg-white';

        const table = document.createElement('table');
        table.className = 'min-w-full table-auto border-collapse';

        const thead = document.createElement('thead');
        thead.className = 'bg-gray-50 border-b border-gray-100 text-gray-500';
        const headerRow = document.createElement('tr');
        
        const headers = [
            { text: '#', width: 'w-12' },
            { text: 'English / IPA', width: 'w-1/4' },
            { text: 'Type', width: 'w-24' },
            { text: 'Tiếng Việt', width: 'w-1/4' },
            { text: 'Ví dụ minh họa', width: 'w-auto' }
        ];
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.className = `py-4 px-6 text-left font-bold text-xs uppercase tracking-widest ${header.width}`;
            th.textContent = header.text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        const tbody = document.createElement('tbody');
        tbody.id = 'vocab-table-body';
        tbody.className = 'divide-y divide-gray-50';
        
        table.appendChild(thead);
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        section.appendChild(tableContainer);

        const cardContainer = document.createElement('div');
        cardContainer.id = 'vocab-card-container';
        cardContainer.className = 'block md:hidden space-y-5';
        section.appendChild(cardContainer);

        mainContent.insertBefore(section, grammarSection);
        
        createPracticeModal();
    }

    /**
     * TẠO MODAL LUYỆN TẬP CẢI TIẾN (Timer & Counter)
     */
    function createPracticeModal() {
        const modal = document.createElement('div');
        modal.id = 'practice-modal';
        modal.className = 'fixed inset-0 z-[100] hidden flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md transition-opacity duration-300';
        modal.innerHTML = `
            <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 scale-95 opacity-0 relative" id="practice-card-container">
                <!-- Timer Bar -->
                <div id="timer-bar" class="absolute top-0 left-0 h-1.5 bg-blue-500 transition-all duration-100 ease-linear w-full"></div>

                <!-- Header -->
                <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500" id="practice-progress">0/0</span>
                        <span id="timer-text" class="text-xs font-bold text-blue-600 font-mono">30s</span>
                    </div>
                    <button class="text-gray-400 hover:text-red-500 transition-colors p-2" onclick="closePracticeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Card Content -->
                <div class="p-8 text-center min-h-[350px] flex flex-col justify-center items-center">
                    <div id="practice-content" class="w-full">
                        <p class="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">How do you say this in Vietnamese?</p>
                        <h3 id="practice-word" class="text-4xl font-black text-gray-900 mb-2">Word</h3>
                        <p id="practice-ipa" class="text-gray-400 font-mono text-sm mb-10">/ipa/</p>
                        
                        <div id="practice-options" class="grid grid-cols-1 gap-3 w-full">
                            <!-- Options will be injected here -->
                        </div>
                    </div>

                    <!-- Result Screen -->
                    <div id="practice-result" class="hidden w-full text-center py-6">
                        <div id="result-icon" class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-green-100">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <h4 id="result-title" class="text-2xl font-black text-gray-900 mb-2">Hoàn thành!</h4>
                        <div class="bg-gray-50 rounded-2xl p-6 mb-8 inline-block min-w-[200px]">
                            <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Kết quả của bạn</p>
                            <div class="text-4xl font-black text-gray-900" id="final-score-text">0/0</div>
                            <p id="accuracy-text" class="text-sm font-medium text-blue-600 mt-1">Chính xác: 0%</p>
                        </div>
                        <button class="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95" onclick="closePracticeModal()">Quay lại bài học</button>
                    </div>
                </div>

                <!-- Footer Score (Dynamic Colors) -->
                <div class="px-8 py-4 bg-gray-50 flex justify-center gap-10">
                    <div class="flex flex-col items-center">
                        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Đúng</span>
                        <span class="text-lg font-black text-green-600" id="correct-count">0</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sai</span>
                        <span class="text-lg font-black text-red-500" id="incorrect-count">0</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    let currentQuestionIndex = 0;
    let score = { correct: 0, incorrect: 0 };
    let shuffledVocab = [];
    let timerInterval = null;
    const TIME_LIMIT = 30; // 30 seconds

    function openPracticeModal() {
        if (vocabularyData.length < 2) return;
        
        const modal = document.getElementById('practice-modal');
        const card = document.getElementById('practice-card-container');
        
        currentQuestionIndex = 0;
        score = { correct: 0, incorrect: 0 };
        shuffledVocab = [...vocabularyData].sort(() => Math.random() - 0.5);
        
        document.getElementById('correct-count').textContent = '0';
        document.getElementById('incorrect-count').textContent = '0';
        document.getElementById('practice-content').classList.remove('hidden');
        document.getElementById('practice-result').classList.add('hidden');

        modal.classList.remove('hidden');
        setTimeout(() => {
            card.classList.remove('scale-95', 'opacity-0');
            loadQuestion();
        }, 10);
    }

    function closePracticeModal() {
        clearInterval(timerInterval);
        const modal = document.getElementById('practice-modal');
        const card = document.getElementById('practice-card-container');
        card.classList.add('scale-95', 'opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }

    function startTimer() {
        clearInterval(timerInterval);
        let timeLeft = TIME_LIMIT;
        const timerBar = document.getElementById('timer-bar');
        const timerText = document.getElementById('timer-text');
        
        timerBar.style.width = '100%';
        timerBar.classList.remove('bg-red-500');
        timerBar.classList.add('bg-blue-500');
        timerText.textContent = `${timeLeft}s`;

        timerInterval = setInterval(() => {
            timeLeft -= 0.1;
            const percentage = (timeLeft / TIME_LIMIT) * 100;
            timerBar.style.width = `${percentage}%`;
            
            if (timeLeft <= 5) {
                timerBar.classList.replace('bg-blue-500', 'bg-red-500');
                timerText.classList.add('animate-pulse', 'text-red-500');
            } else {
                timerText.classList.remove('animate-pulse', 'text-red-500');
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerText.textContent = '0s';
                handleTimeUp();
            } else {
                timerText.textContent = `${Math.ceil(timeLeft)}s`;
            }
        }, 100);
    }

    function handleTimeUp() {
        // Tự động coi là trả lời sai nếu hết thời gian
        const buttons = document.querySelectorAll('#practice-options button');
        buttons.forEach(btn => btn.disabled = true);
        
        // Tìm và highlight đáp án đúng
        const correctValue = shuffledVocab[currentQuestionIndex].vietnamese;
        buttons.forEach(btn => {
            if (btn.textContent === correctValue) {
                btn.classList.add('border-green-500', 'text-green-700', 'bg-green-50');
            } else {
                btn.classList.add('opacity-50');
            }
        });

        score.incorrect++;
        document.getElementById('incorrect-count').textContent = score.incorrect;

        setTimeout(() => {
            currentQuestionIndex++;
            loadQuestion();
        }, 1500);
    }

    function loadQuestion() {
        if (currentQuestionIndex >= shuffledVocab.length) {
            showResult();
            return;
        }

        const currentWord = shuffledVocab[currentQuestionIndex];
        document.getElementById('practice-progress').textContent = `${currentQuestionIndex + 1}/${shuffledVocab.length}`;
        document.getElementById('practice-word').textContent = currentWord.english;
        document.getElementById('practice-ipa').textContent = currentWord.ipa ? `[${currentWord.ipa}]` : '';

        const otherOptions = vocabularyData
            .filter(v => v.english !== currentWord.english)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(v => v.vietnamese);
        
        const options = [...otherOptions, currentWord.vietnamese].sort(() => Math.random() - 0.5);
        
        const optionsContainer = document.getElementById('practice-options');
        optionsContainer.innerHTML = '';
        
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'w-full py-4 px-6 rounded-2xl border-2 border-gray-100 text-gray-700 font-bold text-left hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 active:scale-[0.98] outline-none';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(opt, currentWord.vietnamese, btn);
            optionsContainer.appendChild(btn);
        });

        startTimer();
    }

    function checkAnswer(selected, correct, element) {
        clearInterval(timerInterval);
        const buttons = document.querySelectorAll('#practice-options button');
        buttons.forEach(btn => btn.disabled = true);

        if (selected === correct) {
            element.classList.replace('border-gray-100', 'border-green-500');
            element.classList.add('bg-green-50', 'text-green-700');
            score.correct++;
            document.getElementById('correct-count').textContent = score.correct;
        } else {
            element.classList.replace('border-gray-100', 'border-red-400');
            element.classList.add('bg-red-50', 'text-red-700');
            
            buttons.forEach(btn => {
                if (btn.textContent === correct) {
                    btn.classList.add('border-green-500', 'text-green-700', 'bg-green-50');
                }
            });
            score.incorrect++;
            document.getElementById('incorrect-count').textContent = score.incorrect;
        }

        setTimeout(() => {
            currentQuestionIndex++;
            loadQuestion();
        }, 1200);
    }

    function showResult() {
        clearInterval(timerInterval);
        document.getElementById('practice-content').classList.add('hidden');
        document.getElementById('practice-result').classList.remove('hidden');
        document.getElementById('practice-progress').textContent = 'DONE';
        document.getElementById('timer-bar').style.width = '0%';
        
        const finalScoreText = document.getElementById('final-score-text');
        const accuracyText = document.getElementById('accuracy-text');
        const total = shuffledVocab.length;
        const accuracy = Math.round((score.correct / total) * 100);

        finalScoreText.textContent = `${score.correct}/${total}`;
        accuracyText.textContent = `Chính xác: ${accuracy}%`;

        // Tùy biến icon theo kết quả
        const resultIcon = document.getElementById('result-icon');
        const resultTitle = document.getElementById('result-title');
        if (accuracy >= 80) {
            resultIcon.className = "w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-green-100 animate-bounce";
            resultTitle.textContent = "Xuất sắc!";
        } else if (accuracy >= 50) {
            resultIcon.className = "w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-blue-100";
            resultTitle.textContent = "Tốt lắm!";
        } else {
            resultIcon.className = "w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-orange-100";
            resultTitle.textContent = "Cố gắng thêm nhé!";
        }
    }

    /**
     * TỰ ĐỘNG ĐÁNH SỐ LA MÃ
     */
    function autoNumberHeadings() {
        const titles = document.querySelectorAll('#main-content > .lesson-section > .section-title');
        const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
        
        titles.forEach((title, index) => {
            if (index < romanNumerals.length && !title.querySelector('.roman-numeral')) {
                const numberEl = document.createElement('div');
                numberEl.textContent = romanNumerals[index];
                numberEl.className = 'roman-numeral flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-600 text-white font-bold text-base sm:text-lg mr-4 shadow-md shadow-blue-100';
                title.insertBefore(numberEl, title.firstChild);
            }
        });
    }
    
    /**
     * ĐỊNH DẠNG VÍ DỤ (English - Vietnamese)
     */
    function formatAndRenderExamples(exampleText) {
        if (!exampleText || exampleText.trim() === '') return '<span class="text-gray-300 italic text-xs">Chưa có ví dụ</span>';

        const lines = exampleText.split('\n').filter(line => line.trim() !== '');
        return lines.map(line => {
            const match = line.match(/(.*?)\s*[\(\[{(](.*?)[\)\]})]/);
            if (match) {
                return `
                    <div class="mb-3 last:mb-0 group">
                        <p class="text-gray-800 leading-relaxed font-medium flex items-start">
                            <span class="text-blue-400 mr-2 mt-1 flex-shrink-0 text-[10px]"><i class="fas fa-circle"></i></span>
                            ${match[1].trim()}
                        </p>
                        <p class="text-gray-500 text-sm mt-1 ml-5 pl-1 border-l-2 border-gray-100 italic font-light">
                            ${match[2].trim()}
                        </p>
                    </div>`;
            }
            return `<div class="text-gray-600 text-sm mb-2 flex items-start"><span class="text-blue-300 mr-2">•</span>${line}</div>`;
        }).join('');
    }

    /**
     * LẤY DỮ LIỆU TỪ API
     */
    async function fetchAndDisplayVocab() {
        const vocabTableBody = document.getElementById('vocab-table-body');
        const vocabCardContainer = document.getElementById('vocab-card-container');
        const practiceBtn = document.getElementById('start-practice-btn');
        const lessonTitle = lessonTitleElement?.textContent.trim();
        
        if (!vocabTableBody || !vocabCardContainer || !lessonTitle) return;

        const skeletonHTML = `
            <div class="animate-pulse flex flex-col items-center py-10 space-y-4">
                <div class="h-10 w-10 bg-blue-100 rounded-full"></div>
                <div class="h-4 w-48 bg-gray-100 rounded"></div>
            </div>`;
        
        vocabTableBody.innerHTML = `<tr><td colspan="5">${skeletonHTML}</td></tr>`;
        vocabCardContainer.innerHTML = skeletonHTML;

        try {
            const response = await fetch(SCRIPT_URL);
            const allData = await response.json();
            
            vocabularyData = Array.isArray(allData) 
                ? allData.filter(row => row.lesson?.trim().toLowerCase() === lessonTitle.toLowerCase())
                : [];

            if (vocabularyData.length === 0) {
                const emptyHTML = `<div class="py-12 text-center text-gray-400 font-medium">Xin lỗi!Bài học này chưa có từ vựng</div>`;
                vocabTableBody.innerHTML = `<tr><td colspan="5">${emptyHTML}</td></tr>`;
                vocabCardContainer.innerHTML = emptyHTML;
                return;
            }

            if (vocabularyData.length >= 2) {
                practiceBtn.classList.remove('hidden');
            }

            vocabTableBody.innerHTML = vocabularyData.map((row, index) => `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="py-5 px-6 text-gray-400 font-mono text-xs">${index + 1}</td>
                    <td class="py-5 px-6">
                        <div class="font-bold text-gray-900">${row.english || ''}</div>
                        <div class="text-blue-500 font-mono text-[11px] mt-1">${row.ipa ? `[${row.ipa}]` : ''}</div>
                    </td>
                    <td class="py-5 px-6">
                        <span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">${row.type || 'N/A'}</span>
                    </td>
                    <td class="py-5 px-6 font-medium text-gray-700">${row.vietnamese || ''}</td>
                    <td class="py-5 px-6 text-sm text-gray-600">${formatAndRenderExamples(row.example)}</td>
                </tr>`).join('');

            vocabCardContainer.innerHTML = vocabularyData.map(row => `
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform">
                    <div class="flex justify-between items-start mb-4">
                        <div class="space-y-1">
                            <h3 class="text-xl font-black text-gray-900 tracking-tight leading-none">${row.english || ''}</h3>
                            <div class="text-blue-500 font-mono text-xs">${row.ipa ? `[${row.ipa}]` : ''}</div>
                        </div>
                        <span class="px-2 py-1 rounded-lg bg-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-widest">${row.type || 'N/A'}</span>
                    </div>
                    
                    <div class="bg-blue-50/50 rounded-xl p-3 mb-5 border border-blue-100/30">
                        <p class="text-blue-900 font-bold text-base leading-snug">${row.vietnamese || ''}</p>
                    </div>

                    <div class="space-y-1">
                        <p class="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Examples</p>
                        <div class="bg-white">${formatAndRenderExamples(row.example)}</div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            const errorHTML = `<div class="p-8 text-center text-red-500 text-sm font-medium">Failed to sync lesson data. Please refresh.</div>`;
            vocabTableBody.innerHTML = `<tr><td colspan="5">${errorHTML}</td></tr>`;
            vocabCardContainer.innerHTML = errorHTML;
        }
    }

    function initializeScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.05 });

        document.querySelectorAll('.lesson-section').forEach(el => observer.observe(el));
    }

    window.closePracticeModal = closePracticeModal;
    window.openPracticeModal = openPracticeModal;

    createVocabularySection();
    autoNumberHeadings();
    fetchAndDisplayVocab();
    initializeScrollAnimations();
});