// --- REUSABLE COMPONENT LOADER ---
function loadComponents() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const searchPlaceholder = document.getElementById('search-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    const headerHTML = `
        <header class="top-header" id="top-header">
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center">
                    <div class="logo">
                        <a href="/index.html">
                           <img src="/hinhanh/logo web.png" alt="Logo">
                        </a>
                    </div>
                    <nav class="hidden md:flex items-center space-x-8">
                        <a href="/index.html" class="desktop-nav-link">TRANG CHỦ</a>
                        <a href="javascript:void(0);" onclick="showContact()" class="desktop-nav-link">LIÊN HỆ</a>
                        <a href="/gopy.html" class="desktop-nav-link">GÓP Ý</a>
                        <div id="desktop-login-btn" class="pl-4">
                            <a href="javascript:void(0);" onclick="showLoginForm()" class="login-button bg-purple-700 text-white px-5 py-2 rounded-full hover:bg-red-500 transition-all duration-300 transform hover:scale-105">
                                <i class="fas fa-user-circle mr-2"></i>ĐĂNG NHẬP
                            </a>
                        </div>
                        <div class="search-icon cursor-pointer text-white text-xl hover:text-yellow-300 transition" onclick="handleSearchClick()">
                            <i class="fas fa-search"></i>
                        </div>
                    </nav>
                    <div class="md:hidden flex items-center">
                        <div class="search-icon cursor-pointer text-white text-xl mr-4" onclick="handleSearchClick()">
                            <i class="fas fa-search"></i>
                        </div>
                        <div class="menu-bar" id="menu-bar">
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        <aside class="side-nav" id="side-nav">
            <div id="close-sidenav-btn" class="absolute top-5 right-6 text-white text-3xl cursor-pointer hover:text-red-500 transition-colors">
                <i class="fas fa-times"></i>
            </div>
            <div id="login-btn" class="w-full mt-8 mb-4 border-b border-gray-700">
                <a href="javascript:void(0);" onclick="showLoginForm()" class="login-button">
                    <i class="fas fa-user-circle"></i> ĐĂNG NHẬP
                </a>
            </div>
            <a href="/index.html"><i class="fas fa-home"></i>TRANG CHỦ</a>
            <a href="javascript:void(0);" onclick="showContact()"><i class="fas fa-phone"></i>LIÊN HỆ</a>
            <a href="/gopy.html"><i class="fas fa-envelope"></i>GÓP Ý</a>
        </aside>
    `;

    const searchHTML = `
        <div id="search-container" class="search-container">
            <div class="search-panel">
                <div class="search-bar-top">
                    <form id="search-form" class="w-full">
                        <input type="search" id="search-input" placeholder="Nhập để tìm kiếm..." autocomplete="off">
                    </form>
                    <i class="fas fa-times close-search-btn" id="close-search-btn"></i>
                </div>
                <div id="search-suggestions-output"></div>
            </div>
        </div>
    `;

    const footerHTML = `
        <footer class="main-footer">
            <div class="footer-content">
                <div class="footer-logo">
                    <a href="/index.html">
                        <img src="/hinhanh/logo web.png" alt="Footer Logo" />
                    </a>
                </div>
                <div class="footer-links">
                    <a href="/index.html">Trang chủ</a>
                    <a href="javascript:void(0);" onclick="showContact()">Liên hệ</a>
                    <a href="/gopy.html">Góp ý</a>
                </div>
                <div class="footer-social">
                    <a href="https://web.facebook.com/dantruongag/" target="_blank"><i class="fab fa-facebook-f"></i></a>
                    <a href="https://www.instagram.com/dantruongag/" target="_blank"><i class="fab fa-instagram"></i></a>
                    <a href="https://www.tiktok.com/@dantruongag" target="_blank"><i class="fab fa-tiktok"></i></a>
                    <a href="https://locket.camera/links/rRNxm56LDxb9BAjJ9" target="_blank"><i class="fas fa-lock"></i></a>
                </div>
            </div>
        </footer>
        <nav class="mobile-bottom-nav">
            <div class="mobile-nav-menu">
                <a href="/index.html" class="mobile-nav-item">
                    <i class="fas fa-home"></i>
                    <p>Trang chủ</p>
                </a>
                <a href="javascript:void(0);" onclick="showContact()" class="mobile-nav-item">
                    <i class="fas fa-phone"></i>
                    <p>Liên hệ</p>
                </a>
                <a href="/gopy.html" class="mobile-nav-item">
                    <i class="fas fa-envelope"></i>
                    <p>Góp ý</p>
                </a>
            </div>
        </nav>
    `;

    if (headerPlaceholder) headerPlaceholder.innerHTML = headerHTML;
    if (searchPlaceholder) searchPlaceholder.innerHTML = searchHTML;
    if (footerPlaceholder) footerPlaceholder.innerHTML = footerHTML;
}

// --- MOCK DATA FOR SEARCH DEMO ---
const mockData = [
    { title: 'Trang Chủ', description: 'Quay về trang chủ của website.', url: 'index.html', icon: 'fa-home' },
    { title: 'Liên Hệ Với Chúng Tôi', description: 'Tìm thông tin liên hệ: Facebook, Instagram...', url: 'javascript:void(0);', action: showContact, icon: 'fa-phone' },
    { title: 'Góp Ý', description: 'Đóng góp ý kiến để chúng tôi cải thiện.', url: 'gopy.html', icon: 'fa-envelope' },
];

document.addEventListener("DOMContentLoaded", function () {
    // Load reusable components first
    loadComponents();

    // --- MENU AND NAVIGATION SETUP ---
    const menuBar = document.getElementById("menu-bar");
    const sideNav = document.getElementById("side-nav");
    const closeSideNavBtn = document.getElementById("close-sidenav-btn");

    function closeSideMenu() {
        menuBar.classList.remove("active");
        sideNav.classList.remove("active");
    }

    if (menuBar && sideNav) {
        menuBar.addEventListener("click", () => {
            menuBar.classList.toggle("active");
            sideNav.classList.toggle("active");
        });
    }
    
    if (closeSideNavBtn) {
        closeSideNavBtn.addEventListener('click', closeSideMenu);
    }

    document.querySelectorAll('.side-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) closeSideMenu();
        });
    });

    window.addEventListener("scroll", () => {
        document.getElementById("top-header")?.classList.toggle("scrolled", window.scrollY > 50);
    });
    
    checkLoginStatus();
    if (window.location.pathname.endsWith("/index.html") || window.location.pathname === "/") {
        setTimeout(showLocketPopup, 5000);
    }
    
    // --- DYNAMIC BANNER LOGIC ---
    function showBannerByDate() {
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1; // JS month is 0-indexed

        const gioToSolarDate = { day: 18, month: 4 };

        const banners = {
            'default': document.querySelector(".banner_trangcon"),
            '18-4': document.querySelector(".ngay_gio_to_hung_vuong"), // Giỗ Tổ Hùng Vương (Approx. date)
            '30-4': document.querySelector(".banner_giai_phong_mien_nam_30-4"),
            '7-5': document.querySelector(".banner_chien_thang_dien_bien_phu"),
            '19-5': document.querySelector(".banner_ngay_sinh_chu_tich_HCM_1905"),
            '18-7': document.querySelector(".banner_ngay_sinh_nhat_1807"),
            '19-8': document.querySelector(".banner_ngay_cach_mang_thang_tam"),
            '2-9': document.querySelector(".banner_ngay_quoc_khanh")
        };

        const todayKey = `${day}-${month}`;
        let bannerToShow = banners[todayKey] || banners['default'];

        Object.values(banners).forEach(b => { if(b) b.style.display = 'none'; });

        if (bannerToShow) {
            bannerToShow.style.display = 'flex';
            if (bannerToShow.classList.contains('banner_giai_phong_mien_nam_30-4')) {
                launchConfetti();
            }
            if (bannerToShow.classList.contains('banner_ngay_sinh_nhat_1807')) {
                initBirthdayBanner();
            }
        }
    }
    showBannerByDate();

    // --- SOCIAL MEDIA SWIPER ---
    new Swiper('.swiper', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        speed: 800,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            type: 'progressbar',
        },
    });
});

// --- BANNER EFFECTS ---
function launchConfetti() {
    const section = document.querySelector(".banner_giai_phong_mien_nam_30-4");
    if (!section || !confetti) return;

    const confettiInterval = setInterval(() => {
        const rect = section.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            clearInterval(confettiInterval);
            return;
        }
        const x = (rect.left + rect.right) / 2 / window.innerWidth;
        const y = (rect.top + rect.bottom) / 2 / window.innerHeight;

        confetti({
            particleCount: 15,
            spread: 180,
            startVelocity: 30,
            origin: { x, y },
            colors: ['#ffcc00', '#ff0000', '#00ff00', '#ff6600', '#00ccff'],
            gravity: 0.8,
            scalar: 1.2
        });
    }, 800);
}

function initBirthdayBanner() {
    const nut_form_gui_loi_chuc = document.getElementById('nut_form_gui_loi_chuc');
    const form = document.getElementById('form_gui_loi_chuc');
    if (!nut_form_gui_loi_chuc || !form) return;

    const textarea = form.querySelector('textarea');
    const submitBtn = document.getElementById('nut_gui_loi_chuc');

    nut_form_gui_loi_chuc.addEventListener('click', () => {
        const isOpen = form.style.maxHeight && form.style.maxHeight !== '0px';
        form.style.maxHeight = isOpen ? '0px' : `${form.scrollHeight}px`;
    });

    submitBtn.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message === '') {
            Swal.fire({ icon: 'warning', title: 'BẠN CHƯA NHẬP LỜI CHÚC' });
            return;
        }

        Swal.fire({
            title: 'Đang gửi lời chúc...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        fetch("https://script.google.com/macros/s/AKfycbxPan-KQDfgVodlpBL06ZjkSrIKUTgS3syVxJCZ67JhJaMktXfjz_99c6WptPuzjzLN_g/exec", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `wish=${encodeURIComponent(message)}`
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire({ icon: "success", title: "Cảm ơn bạn nhiều nhé! Mình rất vui khi nhận được lời chúc từ bạn" });
                textarea.value = '';
                form.style.maxHeight = '0px';
            } else {
                Swal.fire("Oops", data.message || "Đã xảy ra lỗi!", "error");
            }
        })
        .catch(() => {
            Swal.fire("Lỗi", "Không thể gửi lời chúc. Vui lòng thử lại.", "error");
        });
    });
}

// --- PROTECTED CONTENT SCRIPTS ---
let sliderInterval;
function initSlider() {
    const items = document.querySelectorAll('.noidung-noibat-iten');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const sliderContainer = document.querySelector('.noidung-noibat-row');
    
    if (!items.length || !sliderContainer) return;

    let currentIndex = 0;
    let visibleItems = window.innerWidth < 768 ? 1 : (window.innerWidth < 992 ? 2 : 3);
    
    function updateSlider() {
        sliderContainer.style.transform = `translateX(-${currentIndex * (100 / visibleItems)}%)`;
    }

    sliderContainer.style.display = 'flex';
    sliderContainer.style.transition = 'transform 0.5s ease-in-out';

    window.addEventListener('resize', () => {
        visibleItems = window.innerWidth < 768 ? 1 : (window.innerWidth < 992 ? 2 : 3);
        currentIndex = 0;
        updateSlider();
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex + visibleItems < items.length) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateSlider();
        resetAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = items.length - visibleItems;
        }
        updateSlider();
        resetAutoSlide();
    });

    function autoSlide() {
        sliderInterval = setInterval(() => {
            nextBtn.click();
        }, 10000);
    }

    function resetAutoSlide() {
        clearInterval(sliderInterval);
        autoSlide();
    }

    autoSlide();
    updateSlider();
}

// --- LOOKUP SYSTEM FUNCTIONS ---
function switchTab(tabId) {
    const sections = document.querySelectorAll('.search-section');
    const buttons = document.querySelectorAll('.tab-button');
    sections.forEach(section => section.classList.remove('active'));
    buttons.forEach(button => button.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}
window.switchTab = switchTab;

function fetchData(sheetName, inputId) {
    const query = document.getElementById(inputId).value;
    if (!query) return;
    
    Swal.fire({
        title: 'Đang tìm kiếm.',
        text: 'Vui lòng chờ trong giây lát.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    fetch(`https://script.google.com/macros/s/AKfycbzzkQRtZNf_k6lohBbe6kzzl64HLQAl1YGae3Cp0cBzNzBs7DU2f07idB1Thjg4jqSa/exec?sheet=${sheetName}&query=${query}`)
        .then(response => response.json())
        .then(data => {
            Swal.close();
            if (data.length === 0) {
                Swal.fire('Không tìm thấy kết quả', 'Vui lòng thử lại với từ khóa khác!', 'warning');
            }
            renderTable(data, sheetName);
        })
        .catch(error => {
            Swal.close();
            console.error('Lỗi:', error);
            Swal.fire('Lỗi tìm kiếm', 'Có lỗi xảy ra khi tìm kiếm dữ liệu. Vui lòng thử lại!', 'error');
        });
}
window.fetchData = fetchData;

function renderTable(data, sheetName) {
    const tableContainer = document.getElementById('resultTable');
    if (data.length === 0) {
        tableContainer.innerHTML = '';
        return;
    }

    let table = '<table><colgroup>';
    if (sheetName === 'HUYET') {
        table += '<col style="width: 11%;"><col style="width: 20%;"><col style="width: 13%;"><col style="width: 25%;"><col style="width: 25%;">';
    } else if (sheetName === 'TAI_LIEU') {
        table += '<col style="width: 11%;"><col style="width: 20%;"><col style="width: 17%;"><col style="width: 37%;"><col style="width: 15%;">';
    }
    table += '</colgroup><tr>';
    
    Object.keys(data[0]).forEach(key => {
        table += `<th>${key}</th>`;
    });
    table += '</tr>';

    data.forEach(row => {
        table += '<tr>';
        Object.values(row).forEach(cell => {
            table += `<td>${cell}</td>`;
        });
        table += '</tr>';
    });

    table += '</table>';
    tableContainer.innerHTML = table;
}
window.renderTable = renderTable;

// --- OTHER FUNCTIONS (Popups, Auth, etc.) ---
function showContact() {
    Swal.fire({
        title: 'LIÊN HỆ',
        html: `
            <style>
                .social-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center; }
                .social-item { display: flex; flex-direction: column; align-items: center; justify-content: center; text-decoration: none; color: #333; }
                .social-item i { font-size: 3rem; margin-bottom: 10px; color: #555; transition: color 0.3s; }
                .social-item p { font-size: 1rem; font-weight: bold; }
                .social-item:hover i { color: var(--button-hover); }
            </style>
            <div class="social-container">
                <a href="https://web.facebook.com/dantruongag/" target="_blank" class="social-item"><i class="fab fa-facebook"></i><p>Facebook</p></a>
                <a href="https://www.instagram.com/dantruongag/" target="_blank" class="social-item"><i class="fab fa-instagram"></i><p>Instagram</p></a>
                <a href="https://www.tiktok.com/@dantruong187" target="_blank" class="social-item"><i class="fab fa-tiktok"></i><p>TikTok</p></a>
                <a href="javascript:void(0);" class="social-item" onclick="copyEmail()"><i class="fas fa-envelope"></i><p>Gmail</p></a>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
    });
}
window.showContact = showContact;

function copyEmail() {
    navigator.clipboard.writeText("dantruong6904@gmail.com").then(() => {
        Swal.fire({ icon: 'success', title: 'Đã sao chép!', timer: 1500, showConfirmButton: false });
    });
}
window.copyEmail = copyEmail;

function showLocketPopup() {
    Swal.fire({
        html: `
            <div class="locket-popup-container">
                <div class="locket-phone">
                    <div class="locket-phone-screen"></div>
                </div>
                <div class="locket-content">
                    <h2>Mình vừa tham gia Locket. Kết bạn với mình nhé!</h2>
                    <a href="https://locket.camera/links/rRNxm56LDxb9BAjJ9" class="locket-button" target="_blank" rel="noopener noreferrer">Thêm ngay</a>
                </div>
            </div>`,
        showCloseButton: true,
        showConfirmButton: false,
        padding: '1rem',
        background: 'linear-gradient(to top right, #fdfbfb, #ebedee)',
        customClass: {
            popup: 'rounded-2xl shadow-xl border border-gray-200'
        },
    });
}
function checkLoginStatus() {
    const savedName = localStorage.getItem('loggedInUser');
    if (savedName) {
        updateLoginUI(savedName);
        showProtectedContent();
    } else {
        resetLoginUI();
        hideProtectedContent();
    }
}
function updateLoginUI(name) {
    const mobileLoginBtn = document.getElementById('login-btn');
    const desktopLoginBtn = document.getElementById('desktop-login-btn');
    const loggedInHTML = `
        <div class="user-info text-white p-2 text-center md:text-left">
            <div class="user-details flex items-center justify-center gap-2">
                <i class="fas fa-user-circle text-xl"></i>
                <span class="username font-semibold">${name}</span>
            </div>
            <a class="logout-btn text-sm text-yellow-300 hover:text-red-500 cursor-pointer" onclick="logout()">Đăng xuất</a>
        </div>`;
    if(mobileLoginBtn) mobileLoginBtn.innerHTML = loggedInHTML;
    if(desktopLoginBtn) desktopLoginBtn.innerHTML = loggedInHTML;
}
function resetLoginUI() {
    const mobileLoginBtn = document.getElementById('login-btn');
    const desktopLoginBtn = document.getElementById('desktop-login-btn');
    const loginHTMLMobile = `<a href="javascript:void(0);" onclick="showLoginForm()" class="login-button"><i class="fas fa-user-circle"></i> ĐĂNG NHẬP</a>`;
    const loginHTMLDesktop = `<a href="javascript:void(0);" onclick="showLoginForm()" class="login-button bg-purple-700 text-white px-5 py-2 rounded-full hover:bg-red-500 transition-all duration-300 transform hover:scale-105"><i class="fas fa-user-circle mr-2"></i>ĐĂNG NHẬP</a>`;
    if(mobileLoginBtn) mobileLoginBtn.innerHTML = loginHTMLMobile;
    if(desktopLoginBtn) desktopLoginBtn.innerHTML = loginHTMLDesktop;
}
function logout() {
    localStorage.removeItem('loggedInUser');
    Swal.fire('Đã đăng xuất!', '', 'success').then(checkLoginStatus);
}
window.logout = logout;

function showProtectedContent() {
    const el = document.getElementById('protected-content');
    const isIndexPage = window.location.pathname.endsWith('/index.html') || window.location.pathname === '/';

    if (el && isIndexPage) { // Only show content if on the index page
        el.style.display = 'block';
        // Load content and initialize scripts for it
        el.innerHTML = `
            <section class="noidung-noibat">
                <div class="tieude-noidung-noibat">
                    <h1>NỘI DUNG NỔI BẬT</h1>
                    <div class="slider-container">
                        <button class="prev-btn">&#10094;</button>
                        <div class="noidung-noibat-row">
                            <div class="noidung-noibat-iten">
                                <div class="noidung-noibat-ing"><img src="hinhanh/Trang chủ/tienganh.png" alt="Tiếng Anh"></div>
                                <div class="noidung-noibat-text">
                                    <h2>TIẾNG ANH</h2>
                                    <a href="/tienganh/tienganh.html"><button>XEM NGAY</button></a>
                                </div>
                            </div>
                            <div class="noidung-noibat-iten">
                                <div class="noidung-noibat-ing"><img src="hinhanh/Trang chủ/GPSL.png" alt="Giải Phẫu"></div>
                                <div class="noidung-noibat-text">
                                    <h2>GIẢI PHẨU</h2>
                                    <a href="/giai_phau/trang_chu_giai_phau.html"><button>XEM NGAY</button></a>
                                </div>
                            </div>
                            <div class="noidung-noibat-iten">
                                <div class="noidung-noibat-ing"><img src="hinhanh/Trang chủ/benhhoc.png" alt="Bệnh Học"></div>
                                <div class="noidung-noibat-text">
                                    <h2>BỆNH HỌC</h2>
                                    <a href="/benhhoc/benhhoc.html"><button>XEM NGAY</button></a>
                                </div>
                            </div>
                            <div class="noidung-noibat-iten">
                                <div class="noidung-noibat-ing"><img src="hinhanh/Trang chủ/sinhlybenh.png" alt="Sinh Lý Bệnh"></div>
                                <div class="noidung-noibat-text">
                                    <h2>SINH LÝ BỆNH</h2>
                                    <a href=""><button>XEM NGAY</button></a>
                                </div>
                            </div>
                            <div class="noidung-noibat-iten">
                                <div class="noidung-noibat-ing"><img src="hinhanh/Trang chủ/hoahoc.png" alt="Hóa Học"></div>
                                <div class="noidung-noibat-text">
                                    <h2>HÓA HỌC</h2>
                                    <a href=""><button>XEM NGAY</button></a>
                                </div>
                            </div>
                            <div class="noidung-noibat-iten">
                                <div class="noidung-noibat-ing"><img src="hinhanh/Trang chủ/chandoanhinhanh.jpg.png" alt="Chẩn Đoán Hình Ảnh"></div>
                                <div class="noidung-noibat-text">
                                    <h2>CHẨN ĐOÁN HÌNH ẢNH</h2>
                                    <button onclick="window.location.href='index.html'">XEM NGAY</button>
                                </div>
                            </div>
                            <div class="noidung-noibat-iten">
                                <div class="noidung-noibat-ing"><img src="hinhanh/Trang chủ/phcn.png" alt="Phục Hồi Chức Năng"></div>
                                <div class="noidung-noibat-text">
                                    <h2>PHỤC HỒI CHỨC NĂNG</h2>
                                    <a href=""><button>XEM NGAY</button></a>
                                </div>
                            </div>
                        </div>
                        <button class="next-btn">&#10095;</button>
                    </div>
                </div>
            </section>
<!-- Danh sách bài viết nổi bật -->
    <section id="articles-section" class="p-4 sm:p-8 min-h-screen">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-extrabold mb-8 text-center border-b-2 border-indigo-500 pb-3">
                <span class="text-indigo-400">Bài VIẾT NỔI BẬT</span>
            </h1>

            <div id="articles-container" class="space-y-5">
                <!-- Nội dung bài viết được chèn bởi JavaScript -->
            </div>

            <div id="pagination-controls" class="flex justify-between items-center mt-8 p-4 bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-2xl shadow-indigo-900/50 border border-gray-700">
                
                <button id="prevButton" class="pagination-button flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition duration-150" disabled>
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Trước
                </button>
                
                <span id="pageInfo" class="text-sm font-semibold text-indigo-400"></span>

                <button id="nextButton" class="pagination-button flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/50 hover:bg-indigo-500 disabled:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition duration-150">
                    Sau
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
            </div>
        </div>
    </section>

        `;
        initSlider();
    } else if (el) {
        // If not on the index page, ensure the content is hidden and cleared.
        el.style.display = 'none';
        el.innerHTML = '';
    }
}
function hideProtectedContent() {
    const el = document.getElementById('protected-content');
    if(el) {
        el.style.display = 'none';
        el.innerHTML = ''; // Clear content on logout
    }
    if (sliderInterval) {
        clearInterval(sliderInterval); // Stop slider on logout
    }
}

function showLoginForm() {
    Swal.fire({
        title: 'Đăng nhập',
        html: `
            <form id="loginForm" class="text-left">
                <input type="text" id="username" placeholder="Tên đăng nhập" required class="swal2-input">
                <div class="relative flex items-center">
                    <input type="password" id="password" placeholder="Mật khẩu" required class="swal2-input w-full">
                    <i id="togglePassword" class="fas fa-eye absolute right-3 cursor-pointer text-gray-500"></i>
                </div>
                <p class="text-sm text-gray-600 mt-4">
                    *Nếu bạn quên mật khẩu hoặc chưa có tài khoản, vui lòng 
                    <span class="text-blue-600 cursor-pointer underline" onclick="showContact()">liên hệ</span>.
                </p>
            </form>`,
        showCancelButton: true, confirmButtonText: 'Đăng nhập', cancelButtonText: 'Thoát',
        preConfirm: () => {
            const u = Swal.getPopup().querySelector('#username').value;
            const p = Swal.getPopup().querySelector('#password').value;
            if (!u || !p) {
                Swal.showValidationMessage(`Vui lòng nhập tên đăng nhập và mật khẩu`);
                return false;
            }
            return { username: u, password: p };
        },
        didOpen: () => {
            const passInput = document.getElementById('password');
            const toggle = document.getElementById('togglePassword');
            toggle.addEventListener('click', () => {
                const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passInput.setAttribute('type', type);
                toggle.classList.toggle('fa-eye-slash');
            });
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.showLoading();
            const { username, password } = result.value;
            const apiUrl = `https://script.google.com/macros/s/AKfycbxPan-KQDfgVodlpBL06ZjkSrIKUTgS3syVxJCZ67JhJaMktXfjz_99c6WptPuzjzLN_g/exec`;
            fetch(`${apiUrl}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('loggedInUser', data.name || username);
                        Swal.fire('Thành công!', 'Đăng nhập thành công!', 'success');
                        checkLoginStatus();
                    } else {
                        Swal.fire('Thất bại!', data.message || 'Tên đăng nhập hoặc mật khẩu không đúng.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Login Error:', error);
                    Swal.fire('Lỗi!', 'Không thể kết nối đến máy chủ.', 'error');
                });
        }
    });
}

        // JS CHO VIDIEO MỘT SỐ HTML
        const videoIframe = document.querySelector('.floating-video iframe');
        const floatingVideoContainer = document.querySelector('.floating-video');

        // Kiểm tra nếu thẻ iframe tồn tại và thuộc tính src rỗng
        if (floatingVideoContainer && videoIframe && !videoIframe.src) {
          // Ẩn toàn bộ div chứa video
          floatingVideoContainer.style.display = 'none';
        }
window.showLoginForm = showLoginForm;