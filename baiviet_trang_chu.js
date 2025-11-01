// --- DANH SÁCH BÀI VIẾT PHÂN TRANG ---
// Số bài viết mỗi trang
const ARTICLES_PER_PAGE = 5;
let currentPage = 1;

// Danh sách liên kết bài viết
const allExternalLinks = [
    "/đo_huyet_ap.html",
    "/rua_tay.html",
];

// totalPages sẽ lớn hơn 1 khi có TỪ 6 bài viết trở lên
const totalPages = Math.ceil(allExternalLinks.length / ARTICLES_PER_PAGE);

// Khởi tạo Intersection Observer cho hiệu ứng xuất hiện (chỉ giữ lại Fade-in)
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Khi phần tử đi vào viewport
            // CHỈNH SỬA: Chỉ loại bỏ opacity-0, không dùng translate-x
            entry.target.classList.remove('opacity-0'); 
            entry.target.classList.add('opacity-100');
            // Dừng quan sát sau khi đã xuất hiện
            observer.unobserve(entry.target);
        }
    });
}, {
    // rootMargin: '0px 0px -10% 0px', // Bắt đầu load sớm hơn 10%
    threshold: 0.1 // Bắt đầu khi 10% phần tử hiển thị
});


/**
 * Tải và phân tích HTML từ URL đích để lấy tiêu đề + ảnh. (Không đổi)
 */
async function fetchAndParse(url) {
    // Placeholder cho ảnh mặc định
    const defaultImage = "/hinhanh/logo web.png";

    try {
        const fullUrl = url.startsWith('/') ? window.location.origin + url : url;
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const htmlText = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");

        const titleElement =
            doc.querySelector(".header-section .main-title") ||
            doc.querySelector("h1") ||
            doc.querySelector("title");

        const title = titleElement
            ? titleElement.textContent.trim()
            : `Không tìm thấy tiêu đề (${url})`;

        const imgElement = doc.querySelector("img");
        const imageUrl = imgElement ? imgElement.src : defaultImage;

        return { title, imageUrl };
    } catch (error) {
        console.error("Lỗi khi tải HTML:", url, error);
        return {
            title: `[Xin lỗi] Bài viết hiện tại không có:`,
            imageUrl: "/hinhanh/logo web.png",
        };
    }
}

/**
 * Tạo box bài viết.
 */
async function createArticleBox(targetUrl, container, index) {
    // Tạm thời tạo box chứa loading state
    const box = document.createElement("a");
    box.href = targetUrl;
    
    // Thêm các class cho hiệu ứng xuất hiện:
    // CHỈNH SỬA: Chỉ giữ lại opacity-0 cho hiệu ứng fade-in. Đã bỏ transform và translate-x-full.
    box.className =
        `article-box flex items-center p-4 rounded-xl shadow-lg border border-gray-700 bg-white/5 backdrop-blur-sm transition duration-700 ease-out 
         hover:bg-white/10 hover:shadow-2xl hover:shadow-indigo-900/50 group 
         opacity-0`; 
    
    // Thêm delay dựa trên index
    box.style.transitionDelay = `${index * 50}ms`;

    // Loading placeholder (Tùy chọn)
    box.innerHTML = `
        <div class="flex-shrink-0 w-24 h-16 mr-4 bg-gray-700 rounded-lg animate-pulse"></div>
        <div class="flex-grow min-w-0">
            <p class="text-base font-bold text-indigo-300 line-clamp-2 leading-snug bg-gray-700 h-4 w-3/4 rounded"></p>
            <p class="text-xs text-gray-400 mt-2 bg-gray-800 h-3 w-1/2 rounded"></p>
        </div>
    `;
    container.appendChild(box);

    // Kích hoạt Observer cho phần tử này
    observer.observe(box);

    // Fetch dữ liệu thực tế
    const data = await fetchAndParse(targetUrl);
    
    // Cập nhật nội dung box sau khi fetch
    box.title = data.title;
    box.innerHTML = ""; // Xóa loading placeholder

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "flex-shrink-0 w-24 h-16 mr-4 overflow-hidden rounded-lg";

    const img = document.createElement("img");
    img.src = data.imageUrl;
    img.alt = `Ảnh minh họa cho:`;
    img.className = "w-full h-full object-cover transform transition duration-300 group-hover:scale-105";
    img.onerror = () => {
        img.src = "/hinhanh/logo web.png"; 
    };

    imageWrapper.appendChild(img);
    box.appendChild(imageWrapper);

    const content = document.createElement("div");
    content.className = "flex-grow min-w-0";

    const title = document.createElement("p");
    title.className = "text-base font-bold text-indigo-300 line-clamp-2 leading-snug"; 
    title.textContent = data.title;

    const description = document.createElement("p");
    description.className = "text-xs text-gray-400 mt-1";
    description.textContent = data.title.length > 50 ? "Xem " : "";

    content.appendChild(title);
    content.appendChild(description);
    box.appendChild(content);
}

/**
 * Hiển thị các bài viết cho trang hiện tại.
 */
function renderArticles(page) {
    const container = document.getElementById("articles-container");
    const section = document.getElementById("articles-section"); // Lấy section cha
    if (!container || !section) return;

    // Hủy quan sát các phần tử cũ trước khi xóa
    Array.from(container.children).forEach(child => observer.unobserve(child));
    container.innerHTML = ""; // Xóa nội dung cũ

    const startIndex = (page - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    const linksToDisplay = allExternalLinks.slice(startIndex, endIndex);

    // Tạo các box bài viết và truyền index để tạo delay
    linksToDisplay.forEach((link, index) => createArticleBox(link, container, index));

    // --- LOGIC ĐIỀU CHỈNH LỀ DƯỚI CO GIÃN ---
    // Xóa các class padding cũ (ví dụ: pb-20, pb-40)
    section.classList.remove('pb-20', 'pb-40', 'pb-8'); 
    
    // Nếu số lượng bài viết ÍT hơn 5, thêm lề dưới lớn hơn
    if (linksToDisplay.length < ARTICLES_PER_PAGE) {
        section.classList.add('pb-40'); // Ví dụ: Lề lớn
    } else {
        // Nếu đủ 5 bài, sử dụng lề mặc định
        section.classList.add('pb-20'); 
    }
    // ------------------------------------------

    updatePaginationControls();
}

/**
 * Cập nhật nút phân trang. (Logic ẩn/hiện đã giữ lại)
 */
function updatePaginationControls() {
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const pageInfo = document.getElementById("pageInfo");
    const paginationContainer = document.getElementById("pagination-controls");

    if (!prevButton || !nextButton || !pageInfo || !paginationContainer) return;

    if (totalPages > 1) {
        paginationContainer.classList.remove('hidden');
        paginationContainer.style.display = 'flex';
    } else {
        paginationContainer.classList.add('hidden');
        paginationContainer.style.display = 'none';
        return; 
    }

    pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

// --- Khởi tạo ---
document.addEventListener("DOMContentLoaded", () => {
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");

    if (prevButton)
        prevButton.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderArticles(currentPage);
            }
        });

    if (nextButton)
        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderArticles(currentPage);
            }
        });

    renderArticles(currentPage);
});
