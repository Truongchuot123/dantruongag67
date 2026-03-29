document.addEventListener('DOMContentLoaded', async () => {

    // ================= CONFIG =================
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

    // ================= DOM =================
    const searchContainer = document.getElementById(config.searchContainerId);
    const searchForm = document.getElementById(config.searchFormId);
    const searchInput = document.getElementById(config.searchInputId);
    const closeSearchBtn = document.getElementById(config.closeSearchBtnId);
    const suggestionsOutput = document.getElementById(config.suggestionsOutputId);

    // ================= UTILS =================

    // Chuẩn hóa text
    const normalizeText = (text) => {
        if (!text) return '';
        const lower = text.trim().toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    };

    // BỎ DẤU TIẾNG VIỆT (QUAN TRỌNG)
    const removeVietnameseTones = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    };

    // ================= DATA =================
    let searchableContent = [
        {
            title: normalizeText('Trang Chủ'),
            description: 'Quay về trang chủ của website.',
            url: '/index.html',
            icon: 'fa-home'
        },
        {
            title: normalizeText('Gop Ý Câu Hỏi'),
            description: 'Tạo câu hỏi ngắn và luyện tập.',
            url: '/luyentap.html',
            icon: 'fa-pen-to-square'
        }
    ];
    // --- Dynamic Content Indexing ---
    const pagesToIndex = [
        // --- Bệnh học ---
                    '/benhhoc/tailieu/benh_alzhemer.html',
                    '/benhhoc/tailieu/Parkinson.html',
                    '/benhhoc/tailieu/HC_duong_ham_co_tay.html',
                    '/benhhoc/tailieu/liet_mat_ngoai_bien.html',
                    '/benhhoc/tailieu/dau_day_than_kinh_tam_thoa.html',
                    '/benhhoc/tailieu/loet_da_day_ta_trang.html', 
                    '/benhhoc/tailieu/HC_trao_nguoc_da_day_thuc_quan.html', 
                    '/benhhoc/tailieu/thung_da_day.html',
                    '/benhhoc/tailieu/HC_tac_ruot.html',
                    '/benhhoc/tailieu/viem_ruot_thua_cap.html',
                    '/benhhoc/tailieu/soi_tui_mat.html',
                    '/benhhoc/tailieu/viem_gan_toi_cap.html',
                    '/benhhoc/tailieu/viem_phoi_cong_dong.html',
                    '/benhhoc/tailieu/viem_VA.html',
                    '/benhhoc/tailieu/tang_huyet_ap.html',
                    '/benhhoc/tailieu/suy_gian_tinh_mach_chi_duoi.html',
                    '/benhhoc/tailieu/benh_than_man.html',
                    '/benhhoc/tailieu/dai_thao_duong.html', 
                    '/benhhoc/tailieu/hoi_chung_cushing.html',
                    '/benhhoc/tailieu/gout.html',
                    '/benhhoc/tailieu/HC_ De_Quuervain.html',
                    '/benhhoc/tailieu/HC_ngon_tay_lo_xo.html',
                    '/benhhoc/tailieu/HC_duong_ham_co_tay.html',
                    '/benhhoc/tailieu/Golfer`s elbow.html', 
                    '/benhhoc/tailieu/Tennis elbow.html',
                    '/benhhoc/tailieu/ton_thuong_day_chang_cheo.html',    
                    '/benhhoc/tailieu/loang_xuong.html',
                    '/benhhoc/tailieu/viem_gan_sieu_vi.html',
                    '/benhhoc/tailieu/lao_phoi.html',
                    '/benhhoc/tailieu/benh_uon_van.html',
                    '/benhhoc/tailieu/nhiem_khuan_ho_hap_cap_tinh_tre_em.html',
                    '/benhhoc/tailieu/lupus_ban_do_he_thong.html',
                    '/benhhoc/tailieu/viem_ket_mac.html',
                    '/benhhoc/tailieu/benh_thalasemia.html',
                    '/benhhoc/tailieu/benh_bach_tang.html',
                    '/benhhoc/tailieu/HC_down.html',
                    '/benhhoc/tailieu/nhiem_doc_thai_nghen.html',



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
                // ---Phục hồi chức năng hô hấp ---
                    "/PHCN/PHCN_ho_hap/phuc_hoi_chuc_nang_ho_hap.html",
                            // ---Các kĩ thuật hô hấp ---
                                "/PHCN/PHCN_ho_hap/Ki_thuat_ho_hap/AFE_chu_dong.html",
                                "/PHCN/PHCN_ho_hap/Ki_thuat_ho_hap/dan_luu_tu_the.html",
                                "/PHCN/PHCN_ho_hap/Ki_thuat_ho_hap/huong_dan_ho.html",
                                "/PHCN/PHCN_ho_hap/Ki_thuat_ho_hap/tho_co_hoanh.html",
                                "/PHCN/PHCN_ho_hap/Ki_thuat_ho_hap/tho_mim_moi.html",
                                "/PHCN/PHCN_ho_hap/Ki_thuat_ho_hap/tho_phoi_hop_van_dong_tay.html",
                                "/PHCN/PHCN_ho_hap/Ki_thuat_ho_hap/tho_ra_manh_FET.html",
                                "/PHCN/PHCN_ho_hap/Ki_thuat_ho_hap/tho_theo_ty_le_phan_so.html",
                                "/PHCN/PHCN_ho_hap/Ki_thuat_ho_hap/tho_tung_thuy.html",
                                "/PHCN/PHCN_ho_hap/Ki_thuat_ho_hap/vo_rung.html",


                // ---Phục hồi chức năng dựa vào cộng đồng ---
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_dua-Vao-cong_dong.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/cham_soc_mom_cut.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/dong_kinh_tre_em.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/giao_tiep_voi_tre_giam_thinh_luc.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_benh_phoi_man_tinh.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_ban_chan_khoeo_bam_sinh.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_nguoi_khuyet_tat_giam_chuc_nang_nhin.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_benh_tam_than.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_noi_lap_ngong_that_ngon.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_sau_bong.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_sau_TBMMN.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_ton_thuong_tuy_song.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_tre_bai_nao.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_tre_cham_phat_trien_tri_tue.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_tre_cong_veo_cot_song.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_tre_trat_khop_hang_bam_sinh.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_viem_khop_dang_thap.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/phong_ngua_thuong_tat_thu_phat.html",
                    "/PHCN/PHCN_dua_vao_cong_dong/PHCN_tre_tu_ky.html",
                // ---Vận động trị liệu ---
                    "/PHCN/Van_dong_tri_lieu/vandongtrilieu.html",
                    // ---Di động khớp ---
                    "/PHCN/Van_dong_tri_lieu/di_dong_khop/di_dong_khop.html",
                    "/PHCN/Van_dong_tri_lieu/di_dong_khop/di_dong_khop_vai.html", 
                    "/PHCN/Van_dong_tri_lieu/di_dong_khop/di_dong_khop_khuyu.html",
                    "/PHCN/Van_dong_tri_lieu/di_dong_khop/di_dong_khop_co_tay.html",
                    "/PHCN/Van_dong_tri_lieu/di_dong_khop/di_dong_khop_ban_ngon_tay.html",
                    "/PHCN/Van_dong_tri_lieu/di_dong_khop/do_dong_khop_goi.html",    
            
                // ---ĐIỆN TRỊ LIỆU ---
                    "/PHCN/Điện trị liệu/dien_tri_lieu.html",
                    '/PHCN/Điện trị liệu/Hongngoai.html',
                    '/PHCN/Điện trị liệu/Parafin.html',
                    '/PHCN/Điện trị liệu/sieu_am.html',
                    '/PHCN/Điện trị liệu/kich_thich_lien_xuong.html',
                    '/PHCN/Điện trị liệu/Song_ngan.html',
                    '/PHCN/Điện trị liệu/laser_cong-suat_thap.html',
                    '/PHCN/Điện trị liệu/laser_noi_mach.html',
                    '/PHCN/Điện trị liệu/laser_cong_suat_cao.html',
                    '/PHCN/Điện trị liệu/dien_xung.html',
                    '/PHCN/Điện trị liệu/may_keo_cot_song.html',
                    '/PHCN/Điện trị liệu/nen_ep.html',
                    '/PHCN/Điện trị liệu/dien_truong_cao_ap.html',
                    '/PHCN/Điện trị liệu/xung_kich.html',
                    '/PHCN/Điện trị liệu/tu_truong.html',
                    '/PHCN/Điện trị liệu/oxy_cao_ap.html',
    ];

        const indexPage = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) return null;

            const htmlText = await response.text();
            const doc = new DOMParser().parseFromString(htmlText, 'text/html');

            // ===== TITLE =====
            let titleText =
                doc.querySelector('h2.anatomy-title')?.textContent ||
                doc.querySelector('h1')?.textContent ||
                doc.querySelector('title')?.textContent ||
                url.split('/').pop().replace('.html', '');

            titleText = normalizeText(titleText.replace(/\(.*?\)/g, '').trim());

            // ===== KEYWORDS =====
            let keywords = '';

            // meta keywords
            const metaKeywords = doc.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
                keywords = metaKeywords.getAttribute('content') || '';
            }

            // id keywords
            const keywordsEl = doc.getElementById('keywords');
            if (!keywords && keywordsEl) {
                keywords = keywordsEl.textContent || '';
            }

            // 🔥 fallback: lấy từ nội dung <p>
            if (!keywords) {
                const paragraphs = doc.querySelectorAll('p');
                let text = '';
                paragraphs.forEach(p => text += p.textContent + ' ');
                keywords = text.slice(0, 300);
            }

            return {
                title: titleText,
                description: `Xem tài liệu: ${titleText}`,
                keywords: keywords.toLowerCase(),
                url: url,
                icon: 'fa-notes-medical'
            };

        } catch (err) {
            console.warn("❌ Lỗi index:", url);
            return null;
        }
    };

    const buildFullSearchIndex = async () => {
        console.log("🔍 Đang load dữ liệu...");

        const results = await Promise.all(pagesToIndex.map(indexPage));
        const valid = results.filter(x => x !== null);

        searchableContent = [...searchableContent, ...valid];

        console.log("✅ Tổng dữ liệu:", searchableContent.length);
    };

    // ================= SEARCH =================
    const performSearch = (query) => {
        if (!query) {
            suggestionsOutput.innerHTML = '';
            return;
        }

        if (!state.isLoggedIn()) {
            suggestionsOutput.innerHTML = config.loginPromptHTML;
            return;
        }

        const q = removeVietnameseTones(query.toLowerCase());

        const results = searchableContent.filter(item => {
            const title = removeVietnameseTones(item.title.toLowerCase());
            const desc = removeVietnameseTones(item.description.toLowerCase());
            const keywords = removeVietnameseTones(item.keywords || '');

            return title.includes(q) || desc.includes(q) || keywords.includes(q);
        });

        renderSuggestions(results);
    };

    // ================= UI =================
    const renderSuggestions = (results) => {
        if (results.length === 0) {
            suggestionsOutput.innerHTML = config.noResultsHTML;
            return;
        }

        suggestionsOutput.innerHTML = '';

        results.slice(0, 10).forEach(item => {
            const div = document.createElement('div');
            div.className = 'suggestion-item_search';

            div.innerHTML = `
                <i class="fas ${item.icon}"></i>
                <div>
                    <h4>${item.title}</h4>
                    <p class="text-xs opacity-70">${item.description}</p>
                </div>
            `;

            div.onclick = () => {
                if (item.url) window.location.href = item.url;
            };

            suggestionsOutput.appendChild(div);
        });
    };

    // ================= EVENT =================
    const openSearch = () => {
        searchContainer.classList.add('active');
        searchInput.focus();
    };

    const closeSearch = () => {
        searchContainer.classList.remove('active');
        searchInput.value = '';
        suggestionsOutput.innerHTML = '';
    };

    if (searchContainer) {
        window.handleSearchClick = openSearch;

        closeSearchBtn.onclick = closeSearch;

        searchInput.addEventListener('input', () => {
            performSearch(searchInput.value.trim());
        });

        await buildFullSearchIndex();
    }
});