// --- SEARCH FUNCTIONALITY ---

document.addEventListener('DOMContentLoaded', async () => {
    // --- Configuration & State Management ---
    const config = {
        searchContainerId: 'search-container',
        searchFormId: 'search-form',
        searchInputId: 'search-input',
        closeSearchBtnId: 'close-search-btn',
        suggestionsOutputId: 'search-suggestions-output',
        loginPromptHTML: `
            <div class="login-prompt-inline">
                <i class="fas fa-lock text-4xl text-yellow-400 mb-3"></i>
                <h4 class="text-xl font-bold text-white mb-2">Yêu Cầu Đăng Nhập</h4>
                <p class="mb-4">Bạn cần đăng nhập để tìm kiếm và xem kết quả.</p>
                <button onclick="showLoginForm()" class="cta-button">Đăng nhập ngay</button>
            </div>`,
        noResultsHTML: `<p class="p-4 text-center text-gray-400">Không tìm thấy kết quả nào.</p>`
    };

    const state = {
        isLoggedIn: () => !!localStorage.getItem('loggedInUser')
    };

    // --- DOM Element Selection ---
    const searchContainer = document.getElementById(config.searchContainerId);
    const searchForm = document.getElementById(config.searchFormId);
    const searchInput = document.getElementById(config.searchInputId);
    const closeSearchBtn = document.getElementById(config.closeSearchBtnId);
    const suggestionsOutput = document.getElementById(config.suggestionsOutputId);

    // --- Searchable Data ---
    let searchableContent = [{
            title: 'Trang Chủ',
            description: 'Quay về trang chủ của website.',
            url: '/index.html',
            icon: 'fa-home'
        },
        {
            title: 'Luyện tập',
            description: 'Tạo câu hỏi ngắn và luyện tập.',
            url: '/luyentap.html',
            icon: 'fa-heartbeat'
        },
        {
            title: 'Luyện tập 2',
            description: 'Tạo câu hỏi ngắn và luyện tập.',
            url: '/luyentap1.html',
            icon: 'fa-heartbeat'
        },
        {
            title: 'Liên Hệ Với Tôi',
            description: 'Tìm thông tin liên hệ: Facebook, Instagram. Gmail...',
            action: () => showContact(),
            icon: 'fa-phone'
        },
        {
            title: 'Giới thiệu bản thân',
            description: 'Trang giới thiệu về Nguyễn Mai Đan Trường.',
            url: '/CV.html',
            icon: 'fa-envelope'
        },
        {
            title: 'Góp Ý',
            description: 'Đóng góp ý kiến để tôi cải thiện hơn.',
            url: '/gopy.html',
            icon: 'fa-envelope'
        },
        {
            title: 'Quy trình rửa tay thường quy của bộ y tế',
            description: 'Đo huyết áp là quá trình kiểm tra lực tác động của máu lên thành mạch máu khi tim co bóp và giãn ra',
            url: '/đo_huyet_ap.html',
            icon: 'fa-heartbeat'
        },
        {
            title: 'Hướng dẫn đo huyết áp đúng cách',
            description: 'Đo huyết áp là quá trình kiểm tra lực tác động của máu lên thành mạch máu khi tim co bóp và giãn ra',
            url: '/đo_huyet_ap.html',
            icon: 'fa-heartbeat'
        },
        {
            title: 'Bảng phiên âm quốc tế IPA',
            description: 'Học và luyện tập tất cả các âm trong bảng ký hiệu ngữ âm quốc tế để cải thiện phát âm tiếng Anh của bạn một cách hiệu quả. ',
            url: '/tienganh/IPA.html',
            icon: 'fa-language'
        },
        {
            title: 'Tạo câu hỏi trả lời ngắn',
            description: 'Form nhập liệu cho cho câu hỏi trả lời ngắn. ',
            url: '/Form_question.html',
            icon: 'fa-language'
        },
        {
            title: 'Giải phẩu cơ',
            description: 'Học giải phẩu cơ qua hình ảnh và vidieo  ',
            url: '/giai_phau/trang_chu_giai_phau.html',
            icon: 'fa-solid fa-person'
        },
        {
            title: 'Điểm danh lâm sàng',
            description: 'Hệ thống điểm danh lâm sàng  ',
            url: '/diem_danh.html',
            icon: 'fa-solid fa-person'
        },
        {
            title: 'Hệ thống tra cứu từ vựng tiếng anh',
            description: 'Hơn 500 từ tiếng anh với các ví dụ, định nghĩa đa dạng. ',
            url: '/tienganh/IPA.html',
            icon: 'fa-language'
        }
    ];

    // --- Dynamic Content Indexing ---
    // ⭐ ĐÃ SỬA LỖI: Chuẩn hóa tất cả đường dẫn thành kiểu tương đối (không có dấu "/" ở đầu) và loại bỏ các mục lặp lại.
    const pagesToIndex = [
        // --- Bệnh học ---
        '/benhhoc/tailieu/benh_alzhemer.html',
        '/benhhoc/tailieu/dong_kinh.html',
        '/benhhoc/tailieu/parkinson.html',
        '/benhhoc/tailieu/dot_quy_nao.html',
        '/benhhoc/tailieu/loet_da_day_ta_trang.html',
        '/benhhoc/tailieu/HC_trao_nguoc_da_day_thuc_quan.html',
        '/benhhoc/tailieu/thung_da_day.html',
        '/benhhoc/tailieu/HC_tac_ruot.html',
        '/benhhoc/tailieu/viem_ruot_thua_cap.html',
        '/benhhoc/tailieu/soi_tui_mat.html',
        '/benhhoc/tailieu/viem_gan_toi_cap.html',
        '/benhhoc/tailieu/Golfer`s elbow.html', 
        '/benhhoc/tailieu/Tennis elbow.html',
        '/benhhoc/tailieu/suy_gian_tinh_mach_chi_duoi.html',  

        // --- Giải phẫu Chi trên ---
        '/giai_phau/chi_tren/co_delta.html',
        '/giai_phau/chi_tren/co_tron_lon.html',
        '/giai_phau/chi_tren/co_tron_be.html',
        '/giai_phau/chi_tren/co_tren_gai.html',
        '/giai_phau/chi_tren/co_duoi_gai.html',
        '/giai_phau/chi_tren/co_duoi_vai.html',
        '/giai_phau/chi_tren/co_nhi_dau_canh_tay.html',
        '/giai_phau/chi_tren/co_tam_dau_canh_tay.html',
        '/giai_phau/chi_tren/co_canh_tay.html',
        '/giai_phau/chi_tren/co_qua_canh_tay.html',
        '/giai_phau/chi_tren/co_khuyu.html',
        '/giai_phau/chi_tren/co_canh_tay_quay.html',
        '/giai_phau/chi_tren/co_sap_tron.html',
        '/giai_phau/chi_tren/co_sap_vuong.html',
        '/giai_phau/chi_tren/co_ngua.html',
        '/giai_phau/chi_tren/co_gap_co_tay_tru.html',
        '/giai_phau/chi_tren/co_gap_co_tay_quay.html',
        '/giai_phau/chi_tren/co_gan_tay_dai.html',
        '/giai_phau/chi_tren/co_gap_cac_ngon_nong.html',
        '/giai_phau/chi_tren/co_gap_cac_ngon_sau.html',
        '/giai_phau/chi_tren/co_gap_ngon-cai_dai.html',
        '/giai_phau/chi_tren/co_gap_ngon_cai_ngan.html',
        '/giai_phau/chi_tren/co_gap_ngon_ut.html',
        '/giai_phau/chi_tren/co_duoi_co_tay_quay_dai.html',
        '/giai_phau/chi_tren/co_duoi_co_tay_quay_ngan.html',
        '/giai_phau/chi_tren/co_duoi_co_tay_tru.html',
        '/giai_phau/chi_tren/co_duoi_chung_cac_ngon.html',
        '/giai_phau/chi_tren/co_duoi_ngon_cai_dai.html',
        '/giai_phau/chi_tren/co_duoi_ngon_cai_ngan.html',
        '/giai_phau/chi_tren/co_duoi_ngon_tro.html',
        '/giai_phau/chi_tren/co_duoi_ngon_ut.html',
        '/giai_phau/chi_tren/co_giun.html',
        '/giai_phau/chi_tren/co_gian_cot_gan_tay.html',
        '/giai_phau/chi_tren/co_gian_cot_mu_tay.html',
        '/giai_phau/chi_tren/co_dang_ngon_cai_dai.html',
        '/giai_phau/chi_tren/co_dang_ngon_cai_ngan.html',
        '/giai_phau/chi_tren/co_dang_ngon_ut.html',
        '/giai_phau/chi_tren/co_doi_ngon_cai.html',
        '/giai_phau/chi_tren/co_doi_ngon_ut.html',

        // --- Giải phẫu Chi dưới ---
        '/giai_phau/chi_duoi/co_that_lung_chau.html',
        '/giai_phau/chi_duoi/co_mong_lon.html',
        '/giai_phau/chi_duoi/co_mong_be.html',
        '/giai_phau/chi_duoi/co_mong_nho.html',
        '/giai_phau/chi_duoi/co_cang_mac_dui.html',
        '/giai_phau/chi_duoi/nhom_co_xoay_ngoai_hong.html',
        '/giai_phau/chi_duoi/nhom_co_khep.html',
        '/giai_phau/chi_duoi/co_may.html',
        '/giai_phau/chi_duoi/co_tu_dau_dui.html',
        '/giai_phau/chi_duoi/co_tam_dau_dui.html',
        '/giai_phau/chi_duoi/co_luoc.html',
        '/giai_phau/chi_duoi/co_thon.html',
        '/giai_phau/chi_duoi/co_chay_truoc.html',
        '/giai_phau/chi_duoi/co_chay_sau.html',
        '/giai_phau/chi_duoi/co_bung_chan.html',
        '/giai_phau/chi_duoi/co_dep.html',
        '/giai_phau/chi_duoi/co_gan_chan_gay.html',
        '/giai_phau/chi_duoi/co_khoeo.html',
        '/giai_phau/chi_duoi/co_mac_dai.html',
        '/giai_phau/chi_duoi/co_mac_ngan.html',
        '/giai_phau/chi_duoi/co_mac_ba.html',
        '/giai_phau/chi_duoi/co_gap_ngon_chan_dai.html',
        '/giai_phau/chi_duoi/co_gap_ngon_chan_ngan.html',
        '/giai_phau/chi_duoi/co_gap_ngon_chan_cai_dai.html',
        '/giai_phau/chi_duoi/co_gap_ngon_chan_cai_ngan.html',
        '/giai_phau/chi_duoi/co_duoi_ngon_chan_dai.html',
        '/giai_phau/chi_duoi/co_duoi_ngon_chan_ngan.html',
        '/giai_phau/chi_duoi/co_duoi_ngon_chan_cai_dai.html',
        '/giai_phau/chi_duoi/co_duoi_ngon_chan_cai_ngan.html',
        '/giai_phau/chi_duoi/co_dang_ngon_chan_cai.html',
        '/giai_phau/chi_duoi/co_khep_ngon_chan_cai.html',
        '/giai_phau/chi_duoi/co_gian-cot_mu_chan.html',
        '/giai_phau/chi_duoi/co_gian_cot_gan_chan.html',
        '/giai_phau/chi_duoi/co_giun.html',
        '/giai_phau/chi_duoi/co_vuong_gan_chan.html',
        '/giai_phau/chi_duoi/co_gap_ngon_chan_ut_ngan.html',
        '/giai_phau/chi_duoi/co_dang_ngon_chan_ut.html',

        // --- Giải phẫu Lưng ---
        '/giai_phau/lung/co_lung_rong.html',
        '/giai_phau/lung/co_tram_lon.html',
        '/giai_phau/lung/co_tram_be.html',
        '/giai_phau/lung/co_nang_vai.html',
        '/giai_phau/lung/co_rang_cua_sau.html',
        '/giai_phau/lung/co_cuc_dai.html',
        '/giai_phau/lung/co_chau_suon.html',
        '/giai_phau/lung/co_gai_song.html',
        '/giai_phau/lung/co_nhieu_chan.html',
        '/giai_phau/lung/co_xoay.html',
        '/giai_phau/lung/co_gian_gai.html',
        '/giai_phau/lung/co_gian_ngang.html',
        '/giai_phau/lung/co_nang_suon.html',

        // --- Giải phẫu Đầu-Mặt-Cổ ---
        '/giai_phau/dau_mat_co/co_tran.html',
        '/giai_phau/dau_mat_co/co_vong_mat.html',
        '/giai_phau/dau_mat_co/co_cau_may.html',
        '/giai_phau/dau_mat_co/co_manh_khanh.html',
        '/giai_phau/dau_mat_co/co_mui.html',
        '/giai_phau/dau_mat_co/co_vong_mieng.html',
        '/giai_phau/dau_mat_co/co_nang_moi_tren.html',
        '/giai_phau/dau_mat_co/co_nang_moi_tren_canh_mui.html',
        '/giai_phau/dau_mat_co/co_go_ma_nho.html',
        '/giai_phau/dau_mat_co/co_go_ma_lon.html',
        '/giai_phau/dau_mat_co/co_mut.html',
        '/giai_phau/dau_mat_co/co_nang_goc_mieng.html',
        '/giai_phau/dau_mat_co/co_cuoi.html',
        '/giai_phau/dau_mat_co/co_ha_moi_duoi.html',
        '/giai_phau/dau_mat_co/co_can.html',
        '/giai_phau/dau_mat_co/co_thai_duong.html',
        '/giai_phau/dau_mat_co/co_chan_buom_trong.html',
        '/giai_phau/dau_mat_co/co_chan_buom_ngoaoi.html',
        '/giai_phau/dau_mat_co/co_bam_da_co.html',
        '/giai_phau/dau_mat_co/co_uc_don_chum.html',
        '/giai_phau/dau_mat_co/co_hai_than.html',
        '/giai_phau/dau_mat_co/co_ham_mong.html',
        '/giai_phau/dau_mat_co/co_tram_mong.html',
        '/giai_phau/dau_mat_co/co_cam_mong.html',
        '/giai_phau/dau_mat_co/co_uc_mong.html',
        '/giai_phau/dau_mat_co/co_giap_mong.html',
        '/giai_phau/dau_mat_co/co_vai_mong.html',
        '/giai_phau/dau_mat_co/co_uc_giap.html',
        '/giai_phau/dau_mat_co/co_thang_dau_truoc.html',
        '/giai_phau/dau_mat_co/co_thang_dau_ben.html',
        '/giai_phau/dau_mat_co/co_dai_dau.html',
        '/giai_phau/dau_mat_co/co_dai_co.html',
        '/giai_phau/dau_mat_co/co_bac__thang.html',
        '/giai_phau/dau_mat_co/co_thang.html',
        '/giai_phau/dau_mat_co/co_goi_dau.html',
        '/giai_phau/dau_mat_co/co_goi_co.html',
        '/giai_phau/dau_mat_co/co_ban_gai_co.html',
        '/giai_phau/dau_mat_co/co_thang_dau_sau_lon.html',
        '/giai_phau/dau_mat_co/co_thang_dau_sau_be.html',
        '/giai_phau/dau_mat_co/co_cheo_dau_tren.html',
        '/giai_phau/dau_mat_co/co_cheo_dau_duoi.html',

         // ---HÓA HỌC ---
         '/hoahoc/can_trong_am_dun_nuoc.html',
        // ---Phục hồi chức năng ---
        '/PHCN/phuc_hoi_chuc_nang.html',
            // ---Các PP VLTL ---
        '/PHCN/Điện trị liệu/dien_tri_lieu.css/Hongngoai.html', 
    ];


    const indexPage = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`❌ Lỗi Fetch: Không thể tải tệp '${url}'. Trạng thái: ${response.status}`);
                return null;
            }
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            let titleElement = null;
            let titleText = '';

            // 1. Tìm tiêu đề từ cấu trúc anatomy-card (h2)
            titleElement = doc.querySelector('article.noidung_anatomy-card h2.anatomy-title');
            if (titleElement) {
                titleText = titleElement.textContent.replace(/\(.*?\)/g, '').trim();
            }

            // 2. Nếu không tìm thấy, tìm tiêu đề từ cấu trúc bài viết (h1)
            if (!titleText) {
                titleElement = doc.querySelector('div.text-center.py-8.md\\:py-12 h1');
                if (titleElement) {
                    titleText = titleElement.textContent.trim();
                }
            }

            if (titleText) {
                console.log(`✅ Lập chỉ mục thành công: "${titleText}" từ tệp '${url}'`);
                return {
                    title: titleText,
                    description: `Xem chi tiết về "${titleText}".`,
                    url: url,
                    icon: 'fa fa-file' 
                };
            } else {
                console.warn(`⚠️ Cảnh báo: Không tìm thấy cấu trúc tiêu đề phù hợp trong tệp '${url}'.`);
                return null;
            }
        } catch (error) {
            console.error(`❌ Lỗi nghiêm trọng khi xử lý tệp '${url}':`, error);
            return null;
        }
    };

    const buildFullSearchIndex = async () => {
        console.log("Bắt đầu xây dựng chỉ mục tìm kiếm động...");
        const uniquePages = [...new Set(pagesToIndex)]; // Lọc các đường dẫn trùng lặp
        const dynamicContentPromises = uniquePages.map(indexPage);
        const dynamicContent = await Promise.all(dynamicContentPromises);
        const finalSearchableContent = [
            ...searchableContent,
            ...dynamicContent.filter(item => item !== null)
        ];
        searchableContent = finalSearchableContent;
        console.log("🚀 Xây dựng chỉ mục tìm kiếm hoàn tất! Tổng số mục:", searchableContent.length);
    };

    const openSearch = () => {
        searchContainer.classList.add('active');
        searchInput.focus();
    };

    const closeSearch = () => {
        searchContainer.classList.remove('active');
        searchInput.value = '';
        suggestionsOutput.innerHTML = '';
    };

    const performSearch = (query) => {
        if (!query) {
            suggestionsOutput.innerHTML = '';
            return;
        }
        if (!state.isLoggedIn()) {
            suggestionsOutput.innerHTML = config.loginPromptHTML;
            return;
        }
        const lowerCaseQuery = query.toLowerCase();
        const results = searchableContent.filter(item =>
            item.title.toLowerCase().includes(lowerCaseQuery) ||
            item.description.toLowerCase().includes(lowerCaseQuery)
        );
        renderSuggestions(results);
    };

    const renderSuggestions = (results) => {
        if (results.length === 0) {
            suggestionsOutput.innerHTML = config.noResultsHTML;
            return;
        }
        suggestionsOutput.innerHTML = '';
        const fragment = document.createDocumentFragment();
        results.forEach(item => {
            const suggestionEl = document.createElement('div');
            suggestionEl.className = 'suggestion-item_search';
            suggestionEl.innerHTML = `
                <i class="fas ${item.icon || 'fa-file-alt'} icon"></i>
                <div>
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>`;
            suggestionEl.addEventListener('click', () => handleSuggestionClick(item));
            fragment.appendChild(suggestionEl);
        });
        suggestionsOutput.appendChild(fragment);
    };

    const handleSuggestionClick = (item) => {
        if (item.action && typeof item.action === 'function') {
            item.action();
        } else if (item.url) {
            window.location.href = item.url;
        }
        closeSearch();
    };

    if (searchContainer && searchForm && searchInput && closeSearchBtn && suggestionsOutput) {
        window.handleSearchClick = openSearch;
        closeSearchBtn.addEventListener('click', closeSearch);
        searchContainer.addEventListener('click', (e) => {
            if (e.target === searchContainer) closeSearch();
        });
        searchForm.addEventListener('submit', (e) => e.preventDefault());
        searchInput.addEventListener('input', () => {
            performSearch(searchInput.value.trim());
        });
        await buildFullSearchIndex();
    } else {
        console.error("Không tìm thấy các thành phần UI tìm kiếm. Vui lòng kiểm tra lại cấu trúc HTML và ID.");
    }
});