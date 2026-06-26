 // Cấu hình các thẻ chuyên khoa, bộ Icon và danh sách đường dẫn trực tiếp
        const cardConfigurations = [
            {
                title: 'Thần Kinh',
                iconClass: 'fas fa-brain text-purple-400',
                glowColor: 'rgba(168, 85, 247, 0.4)',
                links: [
                    '/benhhoc/tailieu/benh_alzhemer.html',
                    '/benhhoc/tailieu/Parkinson.html',
                    '/benhhoc/tailieu/HC_duong_ham_co_tay.html',
                    '/benhhoc/tailieu/liet_mat_ngoai_bien.html',
                    '/benhhoc/tailieu/dau_day_than_kinh_tam_thoa.html'
                ],
                countUnit: 'tài liệu'
            },
            {
                title: 'Tiêu Hóa',
                iconClass: 'fas fa-virus text-emerald-400',
                glowColor: 'rgba(16, 185, 129, 0.4)',
                links: [
                    '/benhhoc/tailieu/loet_da_day_ta_trang.html', 
                    '/benhhoc/tailieu/HC_trao_nguoc_da_day_thuc_quan.html', 
                    '/benhhoc/tailieu/thung_da_day.html',
                    '/benhhoc/tailieu/HC_tac_ruot.html',
                    '/benhhoc/tailieu/viem_ruot_thua_cap.html',
                    '/benhhoc/tailieu/soi_tui_mat.html',
                    '/benhhoc/tailieu/viem_gan_toi_cap.html'
                ],
                countUnit: 'tài liệu'
            },
            {
                title: 'Hô Hấp',
                iconClass: 'fas fa-lungs text-sky-400',
                glowColor: 'rgba(56, 189, 248, 0.4)',
                links: [
                    '/benhhoc/tailieu/hen_phe_quan.html',
                    '/benhhoc/tailieu/viem_phoi_cong_dong.html'
                ],
                countUnit: 'tài liệu'
            },
            {
                title: 'Tai - Mũi - Họng',
                iconClass: 'fas fa-headset text-pink-400',
                glowColor: 'rgba(244, 63, 94, 0.4)',
                links: [
                    '/benhhoc/tailieu/viem_VA.html'
                ],
                countUnit: 'tài liệu'
            },
            {
                title: 'Tim Mạch',
                iconClass: 'fas fa-heartbeat text-rose-400',
                glowColor: 'rgba(244, 63, 94, 0.4)',
                links: [
                    '/benhhoc/tailieu/tang_huyet_ap.html',
                    '/benhhoc/tailieu/suy_gian_tinh_mach_chi_duoi.html'
                ],
                countUnit: 'tài liệu'
            },
            {
                title: 'Tiết Niệu',
                iconClass: 'fas fa-droplet text-amber-500',
                glowColor: 'rgba(245, 158, 11, 0.4)',
                links: [
                    '/benhhoc/tailieu/benh_than_man.html'
                ],
                countUnit: 'tài liệu'
            },
            {
                title: 'Nội Tiết',
                iconClass: 'fas fa-vial-capsule text-yellow-400',
                glowColor: 'rgba(234, 179, 8, 0.4)',
                links: [
                    '/benhhoc/tailieu/dai_thao_duong.html', 
                    '/benhhoc/tailieu/hoi_chung_cushing.html'
                ],
                countUnit: 'tài liệu'
            },
            {
                title: 'Cơ Xương Khớp',
                iconClass: 'fas fa-bone text-indigo-400',
                glowColor: 'rgba(99, 102, 241, 0.4)',
                links: [
                    '/benhhoc/tailieu/viem_khop_dang_thap.html', 
                    '/benhhoc/tailieu/gout.html',
                    '/benhhoc/tailieu/HC_ De_Quuervain.html',
                    '/benhhoc/tailieu/HC_ngon_tay_lo_xo.html',
                    '/benhhoc/tailieu/HC_duong_ham_co_tay.html',
                    '/benhhoc/tailieu/Golfer`s elbow.html', 
                    '/benhhoc/tailieu/Tennis elbow.html',
                    '/benhhoc/tailieu/ton_thuong_day_chang_cheo.html',    
                    '/benhhoc/tailieu/loang_xuong.html'
                ],
                countUnit: 'tài liệu'
            },
            {
                title: 'Truyền Nhiễm',
                iconClass: 'fa-solid fa-shield-virus text-teal-400',
                glowColor: 'rgba(20, 184, 166, 0.4)',
                links: [
                    '/benhhoc/tailieu/viem_gan_sieu_vi.html',
                    '/benhhoc/tailieu/lao_phoi.html',
                    '/benhhoc/tailieu/benh_uon_van.html',
                    '/benhhoc/tailieu/nhiem_khuan_ho_hap_cap_tinh_tre_em.html'
                ],
                countUnit: 'tài liệu'
            },
            {
                title: 'Dị Ứng',
                iconClass: 'fas fa-hand-holding-medical text-orange-400',
                glowColor: 'rgba(249, 115, 22, 0.4)',
                links: [
                    '/benhhoc/tailieu/lupus_ban_do_he_thong.html'
                ],
                countUnit: 'tài liệu'
            },
            {
                title: 'Mắt',
                iconClass: 'fa-solid fa-eye text-cyan-400',
                glowColor: 'rgba(6, 182, 212, 0.4)',
                links: [
                    '/benhhoc/tailieu/viem_ket_mac.html'
                ],
                countUnit: 'tài liệu'
            },
            {
                title: 'Máu và Di Truyền',
                iconClass: 'fa-solid fa-dna text-red-400',
                glowColor: 'rgba(239, 68, 68, 0.4)',
                links: [
                    '/benhhoc/tailieu/benh_thalasemia.html',
                    '/benhhoc/tailieu/benh_bach_tang.html',
                    '/benhhoc/tailieu/HC_down.html',
                ],
                countUnit: 'tài liệu'
            },
            {
                title: 'Sức Khỏe Giới Tính',
                iconClass: 'fas fa-venus-mars text-fuchsia-400',
                glowColor: 'rgba(217, 70, 239, 0.4)',
                links: [
                    '/benhhoc/tailieu/nhiem_doc_thai_nghen.html'
                ],
                countUnit: 'tài liệu'
            }
        ];

        // Khởi tạo Card HTML động
        function createCardElement(config) {
            const card = document.createElement('div');
            card.className = 'glass-card rounded-3xl p-6 flex flex-col justify-between h-[390px] relative overflow-hidden group';
            
            // Background glow hover effect riêng biệt cho mỗi chuyên khoa
            card.style.setProperty('--glow-color', config.glowColor);
            
            card.innerHTML = `
                <!-- Phần Đầu Thẻ: Tên Chuyên Khoa & Icon -->
                <div>
                    <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-800/60">
                        <div class="flex items-center space-x-3.5">
                            <div class="icon-container w-12 h-12 rounded-2xl bg-gray-900/80 border border-gray-800 flex items-center justify-center text-xl shadow-inner">
                                <i class="${config.iconClass}"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-lg text-white/95 group-hover:text-indigo-300 transition-colors duration-300">${config.title}</h3>
                                <span class="text-xs text-gray-500 font-medium js-count">0 ${config.countUnit}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Phần Thân: Danh sách các đường dẫn -->
                    <ul class="space-y-2 js-list min-h-[200px]">
                        <!-- JS sẽ chèn các liên kết (hoặc xương tải - skeleton loader) vào đây -->
                    </ul>
                </div>

                <!-- Thanh Điều khiển Phân trang dưới cùng -->
                <div class="js-nav-controls flex items-center justify-between pt-3 border-t border-gray-800/60 mt-2 hidden">
                    <span class="text-xs text-gray-500 font-semibold uppercase tracking-wider js-page-indicator">Trang 1/1</span>
                    <div class="flex space-x-1.5">
                        <button class="prev-btn pagination-btn w-8 h-8 rounded-lg flex items-center justify-center text-xs text-gray-300" title="Trang trước">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <button class="next-btn pagination-btn w-8 h-8 rounded-lg flex items-center justify-center text-xs text-gray-300" title="Trang sau">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            `;
            return card;
        }

        // Tự động tải tên tài liệu từ HTML thật hoặc fallback thân thiện
        async function fetchAndPopulateList(links, listElement, onCompleteCallback) {
            if (!listElement) return;
            listElement.innerHTML = ''; 

            // Tạo hiệu ứng Xương tải (Skeleton Screen) tuyệt đẹp
            const skeletonCount = Math.min(links.length, 5);
            for (let i = 0; i < skeletonCount; i++) {
                const li = document.createElement('li');
                li.className = 'w-full h-[38px] bg-gray-800/40 border border-gray-800/20 rounded-xl animate-pulse flex items-center px-4';
                li.innerHTML = `<div class="h-2 w-3/4 bg-gray-700/60 rounded"></div>`;
                listElement.appendChild(li);
            }

            const fetchPromises = links.map(async (url) => {
                try {
                    // Thêm độ trễ giả lập cực kỳ mượt mà giúp người dùng cảm nhận tải trang
                    await new Promise(res => setTimeout(res, 50 + Math.random() * 100)); 
                    
                    const res = await fetch(url);
                    if (!res.ok) throw new Error();
                    const html = await res.text();
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    
                    // Tìm kiếm tiêu đề của file HTML
                    const titleElement = 
                        doc.querySelector('h1.text-gradient') || 
                        doc.querySelector('h1') || 
                        doc.querySelector('title');
                        
                    const rawTitle = titleElement ? titleElement.textContent.trim() : (doc.title || url);
                    return { title: formatTitle(rawTitle), url, success: true };
                } catch (err) {
                    // Khi lỗi liên kết (Chưa tạo trang), hiển thị tên bệnh được đoán từ URL rất thông minh
                    const cleanName = url.split('/').pop().replace('.html', '').replace(/[-_]/g, ' ');
                    return { title: formatTitle(cleanName), url, success: true }; 
                }
            });

            const items = await Promise.all(fetchPromises);
            listElement.innerHTML = ''; // Xóa các phần skeleton loading

            items.forEach(({ title, url }, index) => {
                const li = document.createElement('li');
                li.className = 'animate-fade-in opacity-0';
                li.style.animationDelay = `${(index % 5) * 50}ms`;

                const a = document.createElement('a');
                a.href = url;
                a.className = 'doc-link flex items-center justify-between p-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white';
                
                a.innerHTML = `
                    <span class="truncate max-w-[80%]">${title}</span>
                    <i class="fa-solid fa-arrow-right-long text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-indigo-400"></i>
                `;
                
                li.appendChild(a);
                listElement.appendChild(li);
            });

            if (onCompleteCallback) onCompleteCallback();
        }

        // Thiết lập bộ quản lý phân trang riêng cho mỗi thẻ
        function setupCardPaginator(cardElement, config) {
            const listElement = cardElement.querySelector('.js-list');
            const countElement = cardElement.querySelector('.js-count');
            const navControls = cardElement.querySelector('.js-nav-controls');
            const prevBtn = navControls.querySelector('.prev-btn');
            const nextBtn = navControls.querySelector('.next-btn');
            const pageIndicator = navControls.querySelector('.js-page-indicator');

            let currentPage = 1;
            const itemsPerPage = 5; 

            const updateView = () => {
                const items = listElement.querySelectorAll('li');
                const totalItems = items.length;
                const totalPages = Math.ceil(totalItems / itemsPerPage);

                items.forEach((li, index) => {
                    const itemPage = Math.floor(index / itemsPerPage) + 1;
                    if (itemPage === currentPage) {
                        li.style.display = 'block';
                        li.classList.add('animate-fade-in');
                    } else {
                        li.style.display = 'none';
                        li.classList.remove('animate-fade-in');
                    }
                });

                if (totalPages > 1) {
                    navControls.classList.remove('hidden');
                    pageIndicator.textContent = `${currentPage} / ${totalPages}`;
                } else {
                    navControls.classList.add('hidden');
                }

                prevBtn.disabled = currentPage === 1;
                nextBtn.disabled = currentPage === totalPages || totalPages === 0;

                if (countElement) {
                    countElement.textContent = `${totalItems} ${config.countUnit}`;
                }
            };

            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage > 1) {
                    currentPage--;
                    updateView();
                }
            });
            
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const totalItems = listElement.querySelectorAll('li').length;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    updateView();
                }
            });

            fetchAndPopulateList(config.links, listElement, updateView);
        }

        // Định dạng văn bản: viết hoa đầu câu, lọc các hậu tố kỹ thuật thừa
        function formatTitle(str) {
            if (!str) return '';
            let formatted = str.trim()
                .replace(/^(hội chứng|bệnh|hc)\s+/gi, '') // Bỏ bớt chữ rườm rà ở đầu
                .replace(/\.html$/i, '')
                .toLowerCase();
            
            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        }

        // Kích hoạt tất cả sau khi DOM sẵn sàng
        document.addEventListener('DOMContentLoaded', () => {
            const container = document.getElementById('card-container');
            if (container) {
                cardConfigurations.forEach(config => {
                    const cardElement = createCardElement(config);
                    container.appendChild(cardElement);
                    setupCardPaginator(cardElement, config);
                });
            }
        });