/**
 * Script quản lý bài học tiếng Anh:
 * 1. Tự động tạo phần Từ vựng (Vocabulary).
 * 2. Tự động đánh số La Mã cho các đề mục lớn.
 * 3. Lấy dữ liệu từ Google Sheets (thông qua Google Apps Script).
 * 4. Hiệu ứng hiển thị khi cuộn chuột (Scroll Animation).
 */

document.addEventListener('DOMContentLoaded', () => {
    
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykgN9Mf37KxqMZx2XW1mqPJJ3jVunAWVEljUAszFJVwMLxDXJpDHg6cvpdkMHR2v_iKQ/exec';
    const lessonTitleElement = document.getElementById('lesson-title');

    /**
     * TẠO CẤU TRÚC PHẦN TỪ VỰNG
     */
    function createVocabularySection() {
        const mainContent = document.getElementById('main-content');
        const grammarSection = document.getElementById('grammar-section');
        
        // Kiểm tra sự tồn tại của các container chính
        if (!mainContent || !grammarSection) return;

        const section = document.createElement('section');
        section.id = 'vocabulary-section';
        section.className = 'lesson-section p-4 sm:p-6 lg:p-8 opacity-0 transition-opacity duration-700';

        const h2 = document.createElement('h2');
        h2.className = 'section-title text-2xl md:text-3xl flex items-center mb-6';
        
        const titleSpan = document.createElement('span');
        titleSpan.textContent = 'Vocabulary';
        h2.appendChild(titleSpan);

        // Nút Link "Học Từ Vựng"
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'ml-auto';
        
        const buttonLink = document.createElement('a');
        buttonLink.href = '/tienganh/vocabulary.html';
        buttonLink.target = '_blank';
        buttonLink.className = 'text-sm font-semibold bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-2 px-4 sm:px-5 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center';

        const icon = document.createElement('i');
        icon.className = 'fas fa-rocket mr-2';

        buttonLink.appendChild(icon);
        buttonLink.append('Học Từ Vựng');
        buttonContainer.appendChild(buttonLink);
        h2.appendChild(buttonContainer);
        section.appendChild(h2);

        // Desktop Table Container
        const tableContainer = document.createElement('div');
        tableContainer.className = 'hidden md:block overflow-x-auto rounded-xl shadow-sm border border-gray-100';

        const table = document.createElement('table');
        table.className = 'min-w-full bg-white table-auto';

        const thead = document.createElement('thead');
        thead.className = 'bg-blue-600 text-white';
        const headerRow = document.createElement('tr');
        
        const headers = [
            { text: 'STT',       widthClass: 'w-12' },
            { text: 'English',   widthClass: 'w-1/5' },
            { text: 'Loại từ',   widthClass: 'w-24' },
            { text: 'Tiếng Việt',widthClass: 'w-1/5' },
            { text: 'Ví dụ',     widthClass: 'w-2/5' }
        ];
        
        headers.forEach((header, index) => {
            const th = document.createElement('th');
            const borderClass = index < headers.length - 1 ? 'border-r border-blue-500' : '';
            th.className = `text-center py-4 px-4 font-semibold text-sm uppercase tracking-wider ${header.widthClass} ${borderClass}`;
            th.textContent = header.text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        const tbody = document.createElement('tbody');
        tbody.id = 'vocab-table-body';
        tbody.className = 'text-gray-700 divide-y divide-gray-100';
        tbody.innerHTML = `<tr><td colspan="5" class="text-center p-12 text-gray-400 italic">Đang tải dữ liệu bài học...</td></tr>`;
        
        table.appendChild(thead);
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        section.appendChild(tableContainer);

        // Mobile Card Container
        const cardContainer = document.createElement('div');
        cardContainer.id = 'vocab-card-container';
        cardContainer.className = 'block md:hidden space-y-4';
        cardContainer.innerHTML = `<div class="text-center p-8 text-gray-400 italic">Đang chuẩn bị danh sách...</div>`;
        section.appendChild(cardContainer);

        // Chèn phần từ vựng vào trước phần ngữ pháp
        mainContent.insertBefore(section, grammarSection);
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
                numberEl.className = 'roman-numeral flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg sm:text-xl mr-3 sm:mr-5 shadow-lg';
                title.insertBefore(numberEl, title.firstChild);
            }
        });
    }
    
    /**
     * ĐỊNH DẠNG VÍ DỤ (English - Vietnamese)
     */
    function formatAndRenderExamples(exampleText) {
        if (!exampleText || exampleText.trim() === '') return '<span class="text-gray-300">N/A</span>';

        const lines = exampleText.split('\n').filter(line => line.trim() !== '');
        const html = lines.map(line => {
            const match = line.match(/(.*?)\s*[\(\[{(](.*?)[\)\]})]/);
            if (match && match[1] && match[2]) {
                const english = match[1].trim();
                const vietnamese = match[2].trim();
                return `<div class="example-pair mb-2 last:mb-0">
                            <p class="font-medium text-gray-800 leading-snug">● ${english}</p>
                            <p class="text-gray-500 text-xs sm:text-sm mt-0.5 ml-4 italic">(${vietnamese})</p>
                        </div>`;
            }
            return `<div class="example-pair mb-1 text-gray-600 leading-snug">● ${line}</div>`;
        }).join('');
        return `<div class="example-wrapper">${html}</div>`;
    }

    /**
     * LẤY DỮ LIỆU TỪ API
     */
    async function fetchAndDisplayVocab() {
        const vocabTableBody = document.getElementById('vocab-table-body');
        const vocabCardContainer = document.getElementById('vocab-card-container');
        
        if (!vocabTableBody || !vocabCardContainer || !lessonTitleElement) return;

        const currentLessonTitle = lessonTitleElement.textContent.trim();
        const loadingHTML = `
            <div class="flex flex-col justify-center items-center py-12 space-y-3">
                <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-gray-500 font-medium">Đang đồng bộ dữ liệu bài học...</span>
            </div>`;
        
        vocabTableBody.innerHTML = `<tr><td colspan="5">${loadingHTML}</td></tr>`;
        vocabCardContainer.innerHTML = loadingHTML;

        try {
            const response = await fetch(SCRIPT_URL);
            if (!response.ok) throw new Error(`Network response was not ok`);
            
            const allData = await response.json();
            
            // Lọc dữ liệu theo tên bài học hiện tại
            const filteredData = Array.isArray(allData) 
                ? allData.filter(row => row.lesson && row.lesson.trim().toLowerCase() === currentLessonTitle.toLowerCase())
                : [];

            if (filteredData.length === 0) {
                const noDataHTML = `<div class="text-center p-12 text-gray-400">Không có dữ liệu từ vựng cho "${currentLessonTitle}".</div>`;
                vocabTableBody.innerHTML = `<tr><td colspan="5">${noDataHTML}</td></tr>`;
                vocabCardContainer.innerHTML = noDataHTML;
                return;
            }

            // Render Table (Desktop)
            const tableRowsHTML = filteredData.map((row, index) => `
                <tr class="hover:bg-blue-50/50 transition-colors duration-150 align-top">
                    <td class="text-center py-4 px-4 font-mono text-xs text-gray-400 border-r border-gray-50">${index + 1}</td>
                    <td class="py-4 px-4 border-r border-gray-50">
                        <div class="font-bold text-blue-800 text-base">${row.english || ''}</div>
                        ${row.ipa ? `<div class="text-xs font-normal text-gray-400 mt-0.5">/${row.ipa}/</div>` : ''}
                    </td>
                    <td class="py-4 px-4 text-center border-r border-gray-50">
                        <span class="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] uppercase font-bold italic">${row.type || 'n/a'}</span>
                    </td>
                    <td class="py-4 px-4 border-r border-gray-50 font-medium text-gray-700">${row.vietnamese || ''}</td>
                    <td class="py-4 px-4 text-sm">${formatAndRenderExamples(row.example || '')}</td>
                </tr>
            `).join('');

            // Render Cards (Mobile)
            const cardsHTML = filteredData.map(row => `
                <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="font-bold text-xl text-blue-700">${row.english || ''}</span>
                            ${row.ipa ? `<span class="text-sm text-gray-400 ml-2 italic">/${row.ipa}/</span>` : ''}
                        </div>
                        <span class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase italic">${row.type || ''}</span>
                    </div>
                    <div class="mt-2 text-gray-800 font-semibold border-b border-gray-50 pb-2">
                        ${row.vietnamese || ''}
                    </div>
                    <div class="mt-3 pt-1">
                        ${formatAndRenderExamples(row.example)}
                    </div>
                </div>
            `).join('');

            vocabTableBody.innerHTML = tableRowsHTML;
            vocabCardContainer.innerHTML = cardsHTML;

        } catch (error) {
            console.error('Fetch Error:', error);
            const errorHTML = `<div class="text-center p-8 text-red-500">
                <i class="fas fa-exclamation-triangle mb-2 text-2xl"></i>
                <p class="font-semibold">Lỗi tải dữ liệu!</p>
                <p class="text-xs opacity-75">${error.message}</p>
            </div>`;
            vocabTableBody.innerHTML = `<tr><td colspan="5">${errorHTML}</td></tr>`;
            vocabCardContainer.innerHTML = errorHTML;
        }
    }

    /**
     * HIỆU ỨNG CUỘN CHUỘT (Intersection Observer)
     */
    function initializeScrollAnimations() {
        const sections = document.querySelectorAll('.lesson-section');
        if (!sections.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    entry.target.style.opacity = '1';
                    observer.unobserve(entry.target); 
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    // --- KHỞI CHẠY ---
    createVocabularySection();
    autoNumberHeadings();
    fetchAndDisplayVocab();
    initializeScrollAnimations();
});