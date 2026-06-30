// ================= GOOGLE APPS SCRIPT CONFIGURATION =================
        const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxPan-KQDfgVodlpBL06ZjkSrIKUTgS3syVxJCZ67JhJaMktXfjz_99c6WptPuzjzLN_g/exec";

        // Danh sách liên kết học tập thực tế dùng cho trang chủ
        const allExternalLinks = [
            "/đo_huyet_ap.html",
            "/rua_tay.html",
            "/hoi_suc_tim_phoi_co_ban.html",
            "/tienganh/IPA.html",
            "/PHCN/HĐTL/dung_cu_vltl.html",
            "/yhoccotruyen/tra_cuu_huyet.html",
            "/phong_luyen_thi_trac_nghiem.html"
        ];

        let articlesDb = [];

        // Dữ liệu dự phòng
        const fallbackArticlesDb = [
            { title: "Đo Huyết Áp Lâm Sàng", desc: "Hướng dẫn thực hành kỹ năng đo huyết áp đúng quy trình lâm sàng.", tag: "Bệnh Học", date: "Mới cập nhật", link: "/đo_huyet_ap.html" },
            { title: "Kỹ Thuật Rửa Tay Thường Quy", desc: "Quy trình vệ sinh tay 6 bước chuẩn y khoa chống khuẩn bệnh viện.", tag: "Bệnh Học", date: "Mới cập nhật", link: "/rua_tay.html" },
            { title: "Hồi Sức Tim Phổi Cơ Bản (CPR)", desc: "Các bước xử trí ép tim ngoài lồng ngực và thổi ngạt khân cấp.", tag: "Bệnh Học", date: "Mới cập nhật", link: "/hoi_suc_tim_phoi_co_ban.html" }
        ];

        // Trạng thái Gamification của người dùng lưu trong localStorage
        let userStats = {
            xp: 120,
            level: 1,
            streak: 3,
            completedFlashcards: [],
            unlockedBadges: ['Newbie']
        };

        // Trạng thái thông tin cá nhân của người dùng
        let userProfile = {
            name: "DanTruong",
            phone: "",
            birthday: "",
            email: "",
            avatar: "https://placehold.co/150x150/4f46e5/ffffff?text=Dan+Truong"
        };

        // --- KHỞI TẠO ĐỘNG CÁC PHẦN TỬ GIAO DIỆN ---
        function renderDynamicElements() {
            // 1. Tạo Mascot Linh vật nếu chưa tồn tại
            if (!document.getElementById('website-mascot')) {
                const mascotDiv = document.createElement('div');
                mascotDiv.id = 'website-mascot';
                mascotDiv.className = 'select-none group';
                mascotDiv.innerHTML = `
                    <div id="mascot-speech" class="absolute bottom-full left-0 mb-3 w-52 p-3.5 rounded-2xl bg-slate-800 text-white border border-indigo-500/40 shadow-2xl text-xs font-semibold leading-relaxed scale-0 opacity-0 origin-bottom-left transition-all duration-300 pointer-events-none">
                       Chào bạn, tôi luôn sẵn sàng hỗ trợ bạn 🩺📖
                    </div>
                    <div class="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border border-white/10 transform hover:scale-110 active:scale-95 transition-all cursor-pointer">
                        <img src="/hinhanh/linh_vat.png" alt="" onerror="this.onerror=null; this.src='https://placehold.co/150x150/4f46e5/ffffff?text=Dan+Truong'">
                    </div>
                `;
                document.body.appendChild(mascotDiv);
            }

            // 2. Tạo Backdrop cho Side Nav nếu chưa tồn tại
            if (!document.getElementById('side-nav-backdrop')) {
                const backdrop = document.createElement('div');
                backdrop.id = 'side-nav-backdrop';
                backdrop.className = 'side-nav-backdrop';
                document.body.appendChild(backdrop);
            }

            // 3. Tạo Panel Cài đặt hệ thống nếu chưa tồn tại
            if (!document.getElementById('settings-overlay')) {
                const settingsOverlay = document.createElement('div');
                settingsOverlay.id = 'settings-overlay';
                settingsOverlay.className = 'fixed inset-0 z-[1200] hidden bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4';
                settingsOverlay.innerHTML = `
                    <div class="bg-gradient-to-b from-[#111827] to-[#0f172a] border border-white/10 shadow-2xl rounded-3xl w-full max-w-2xl overflow-hidden transform scale-95 transition-all duration-300">
                        <div class="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-lg shadow-inner">
                                    <i class="fas fa-cog animate-spin"></i>
                                </div>
                                <div>
                                    <h2 class="text-xl font-extrabold text-white">Cài Đặt Hệ Thống</h2>
                                    <p class="text-xs text-gray-400 mt-0.5">Tùy biến hồ sơ cá nhân và màu sắc chủ đề</p>
                                </div>
                            </div>
                            <button onclick="closeSettings()" class="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-4 min-h-[400px]">
                            <div class="md:col-span-1 border-r border-white/10 p-4 space-y-2 bg-black/20">
                                <button onclick="switchSettingsTab('profile')" id="set-tab-profile" class="w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold transition flex items-center gap-2">
                                    <i class="fas fa-user-edit"></i> Giới thiệu & Hồ sơ
                                </button>
                                <button onclick="switchSettingsTab('theme')" id="set-tab-theme" class="w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold transition flex items-center gap-2">
                                    <i class="fas fa-palette"></i> Màu sắc Chủ đề
                                </button>
                            </div>

                            <div class="md:col-span-3 p-6 max-h-[450px] overflow-y-auto">
                                <div id="settings-tab-profile" class="settings-content-pane space-y-5">
                                    <div class="flex flex-col sm:flex-row items-center gap-4 border-b border-white/5 pb-4">
                                        <div class="relative group">
                                            <div class="w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-gray-500 bg-black/40 flex items-center justify-center shadow-lg">
                                                <img id="settings-avatar-preview" src="https://placehold.co/150/4f46e5/ffffff?text=Avatar" class="w-full h-full object-cover">
                                            </div>
                                            <label class="absolute inset-0 bg-black/75 rounded-2xl flex flex-col items-center justify-center text-[10px] text-indigo-300 font-bold opacity-0 group-hover:opacity-100 cursor-pointer transition">
                                                <i class="fas fa-camera text-base mb-1"></i>
                                                <span>Đổi ảnh</span>
                                                <input type="file" id="settings-avatar-file" accept="image/*" class="hidden" onchange="previewUserAvatar(this)">
                                            </label>
                                        </div>
                                        <div class="text-center sm:text-left">
                                            <span class="text-[9px] uppercase font-black px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/20">Ảnh đại diện</span>
                                            <p class="text-xs text-gray-500 mt-2">Chọn tệp ảnh từ thiết bị.</p>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Họ và tên thành viên</label>
                                            <input type="text" id="settings-name-input" class="w-full p-2.5 rounded-xl bg-slate-800 text-white border border-white/10 focus:border-indigo-500 outline-none text-xs">
                                        </div>
                                        <div>
                                            <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Số điện thoại (SĐT)</label>
                                            <input type="tel" id="settings-phone-input" placeholder="Ví dụ: 0123456789" maxlength="10" class="w-full p-2.5 rounded-xl bg-slate-800 text-white border border-white/10 focus:border-indigo-500 outline-none text-xs">
                                        </div>
                                        <div>
                                            <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Ngày sinh nhật</label>
                                            <input type="date" id="settings-birthday-input" class="w-full p-2.5 rounded-xl bg-slate-800 text-white border border-white/10 focus:border-indigo-500 outline-none text-xs">
                                        </div>
                                        <div>
                                            <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Địa chỉ Email</label>
                                            <input type="email" id="settings-email-input" placeholder="Ví dụ: user@gmail.com" class="w-full p-2.5 rounded-xl bg-slate-800 text-white border border-white/10 focus:border-indigo-500 outline-none text-xs">
                                        </div>
                                    </div>
                                </div>

                                <div id="settings-tab-theme" class="settings-content-pane hidden space-y-6">
                                    <div>
                                        <h3 class="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                                            <i class="fas fa-brush text-indigo-400"></i> Chọn tông màu chủ đạo
                                        </h3>
                                        <p class="text-xs text-gray-400 leading-relaxed mb-4">Các nút bấm, viền trang trí và hiệu ứng ánh sáng neon trên website sẽ thay đổi tương ứng theo màu sắc bạn chọn.</p>
                                        
                                        <div class="grid grid-cols-2 gap-4">
                                            <button onclick="changeAccentTheme('indigo')" class="p-4 rounded-2xl bg-indigo-900/10 border-2 border-indigo-500/20 hover:border-indigo-500 flex items-center gap-3 transition-all text-left">
                                                <span class="w-6 h-6 rounded-full bg-indigo-500 border border-white/20"></span>
                                                <div>
                                                    <div class="text-xs font-bold text-white">Xanh Thạch Anh</div>
                                                    <div class="text-[10px] text-indigo-300">Default Indigo</div>
                                                </div>
                                            </button>
                                            <button onclick="changeAccentTheme('emerald')" class="p-4 rounded-2xl bg-emerald-900/10 border-2 border-emerald-500/20 hover:border-emerald-500 flex items-center gap-3 transition-all text-left">
                                                <span class="w-6 h-6 rounded-full bg-emerald-500 border border-white/20"></span>
                                                <div>
                                                    <div class="text-xs font-bold text-white">Lục Bảo Ngọc</div>
                                                    <div class="text-[10px] text-emerald-300">Modern Emerald</div>
                                                </div>
                                            </button>
                                            <button onclick="changeAccentTheme('amber')" class="p-4 rounded-2xl bg-amber-900/10 border-2 border-amber-500/20 hover:border-amber-500 flex items-center gap-3 transition-all text-left">
                                                <span class="w-6 h-6 rounded-full bg-amber-500 border border-white/20"></span>
                                                <div>
                                                    <div class="text-xs font-bold text-white">Hổ Phách Sáng</div>
                                                    <div class="text-[10px] text-amber-300">Warm Amber</div>
                                                </div>
                                            </button>
                                            <button onclick="changeAccentTheme('rose')" class="p-4 rounded-2xl bg-rose-900/10 border-2 border-rose-500/20 hover:border-rose-500 flex items-center gap-3 transition-all text-left">
                                                <span class="w-6 h-6 rounded-full bg-rose-500 border border-white/20"></span>
                                                <div>
                                                    <div class="text-xs font-bold text-white">Hồng San Hô</div>
                                                    <div class="text-[10px] text-rose-300">Neon Rose</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="p-5 border-t border-white/10 bg-black/40 flex justify-end gap-3">
                            <button onclick="closeSettings()" class="px-5 py-2 rounded-xl bg-slate-800 text-gray-300 hover:text-white font-bold text-xs transition">Hủy bỏ</button>
                            <button onclick="saveSettings()" class="px-6 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white font-bold text-xs shadow-lg transition transform hover:-translate-y-0.5">Lưu cấu hình</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(settingsOverlay);
            }

            // 4. Tạo Modal Sổ tay ghi chú lâm sàng nếu chưa tồn tại
            if (!document.getElementById('notes-modal-overlay')) {
                const notesOverlay = document.createElement('div');
                notesOverlay.id = 'notes-modal-overlay';
                notesOverlay.className = 'fixed inset-0 z-[1200] hidden bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4';
                notesOverlay.innerHTML = `
                    <div class="bg-gradient-to-b from-[#0f172a] to-[#0b0f19] border border-white/10 shadow-2xl rounded-3xl w-full max-w-4xl overflow-hidden transform scale-95 transition-all duration-300">
                        <div class="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-lg">
                                    <i class="fas fa-notes-medical"></i>
                                </div>
                                <div>
                                    <h2 class="text-xl font-extrabold text-white">Sổ Tay Ghi Chú</h2>
                                    <p class="text-xs text-gray-400 mt-0.5">Lưu trữ nhanh vào sổ ghi chú</p>
                                </div>
                            </div>
                            <button onclick="closeNotesModal()" class="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <div class="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto">
                            <div class="lg:col-span-1 p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4">
                                <h3 class="text-sm font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
                                    <i class="fas fa-pen-nib text-indigo-400"></i> Thêm Ghi Chú Mới
                                </h3>
                                <div>
                                    <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tiêu đề ghi chú</label>
                                    <input id="note-title" type="text" placeholder="Nhập tiêu đề ghi chú...." class="w-full p-2.5 rounded-xl bg-slate-800 text-white border border-white/10 outline-none focus:border-indigo-500 text-xs">
                                </div>
                                <div>
                                    <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Nội dung ghi chú</label>
                                    <textarea id="note-content" rows="4" placeholder="Nhập nội dung ghi chú của bạn tại đây" class="w-full p-2.5 rounded-xl bg-slate-800 text-white border border-white/10 outline-none focus:border-indigo-500 text-xs resize-none"></textarea>
                                </div>
                                <div>
                                    <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Chủ đề</label>
                                    <select id="note-tag" class="w-full p-2.5 rounded-xl bg-slate-800 text-white border border-white/10 outline-none focus:border-indigo-500 text-xs">
                                        <option value="Bệnh Học">Bệnh Học</option>
                                        <option value="Ngoại Ngữ">Ngoại Ngữ</option>
                                        <option value="Y học cổ truyền">Y học cổ truyền</option>
                                        <option value="Phục hồi chức năng">Phục hồi chức năng</option>
                                    </select>
                                </div>
                                <button onclick="saveNewNote()" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-500/25">+ Thêm Ghi Chú</button>
                            </div>

                            <div class="lg:col-span-2 flex flex-col">
                                <div class="flex justify-between items-center mb-4">
                                    <h3 class="text-sm font-bold text-white flex items-center gap-2">
                                        <i class="fas fa-file-medical-alt text-indigo-400"></i> Danh sách ghi chú
                                    </h3>
                                    <div class="text-xs text-indigo-300 font-bold" id="notes-counter">0 ghi chú</div>
                                </div>
                                <div id="notes-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
                                    <!-- Danh sách nạp động qua JS -->
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(notesOverlay);
            }

            // 5. Tạo Thanh điều hướng dưới Mobile nếu chưa tồn tại
            if (!document.querySelector('.mobile-bottom-nav')) {
                const mobileNav = document.createElement('div');
                mobileNav.className = 'mobile-bottom-nav';
                mobileNav.innerHTML = `
                    <div class="mobile-nav-menu">
                        <a href="/index.html" class="mobile-nav-item active">
                            <i class="fas fa-home"></i>
                            <p>Trang chủ</p>
                        </a>
                        <a href="javascript:void(0);" onclick="handleSearchClick()" class="mobile-nav-item">
                            <i class="fas fa-search"></i>
                            <p>Tìm kiếm</p>
                        </a>
                        <a href="javascript:void(0);" onclick="openNotesModal()" class="mobile-nav-item">
                            <i class="fas fa-edit"></i>
                            <p>Ghi chú</p>
                        </a>
                        <a href="javascript:void(0);" onclick="openSettings()" class="mobile-nav-item">
                            <i class="fas fa-cog"></i>
                            <p>Cài đặt</p>
                        </a>
                    </div>
                `;
                document.body.appendChild(mobileNav);
            }
        }

        // Giao diện đổi màu chủ đề (Accent Theme Customizer)
        function changeAccentTheme(themeName) {
            document.body.className = document.body.className.replace(/\btheme-\w+/g, '');
            document.body.classList.add(`theme-${themeName}`);
            
            const themeColors = {
                indigo: '#6366f1',
                emerald: '#10b981',
                amber: '#f59e0b',
                rose: '#f43f5e'
            };
            document.documentElement.style.setProperty('--nut', themeColors[themeName] || '#6366f1');
            
            localStorage.setItem('selectedTheme', themeName);
            triggerNiceSound();
        }

        // --- ÂM THANH THÔNG BÁO WEB AUDIO API ---
        function triggerNiceSound() {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;

                const ctx = new AudioCtx();

                function playTone(freq, start, duration) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.type = 'sine';
                    osc.frequency.value = freq;

                    gain.gain.setValueAtTime(0.001, start);
                    gain.gain.exponentialRampToValueAtTime(0.08, start + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

                    osc.start(start);
                    osc.stop(start + duration);
                }

                const now = ctx.currentTime;
                playTone(523.25, now, 0.12);      // C5
                playTone(659.25, now + 0.08, 0.12); // E5
                playTone(783.99, now + 0.16, 0.15); // G5

            } catch (e) {
                console.log("Audio not supported.");
            }
        }

        // Khởi tạo Canvas hạt bụi lung linh ở phông nền Hero Banner
        function initAmbientCanvas() {
            const canvas = document.getElementById('ambient-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            let particles = [];
            
            function resize() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            window.addEventListener('resize', resize);
            resize();

            for(let i = 0; i < 40; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 2 + 1,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    alpha: Math.random() * 0.5 + 0.2
                });
            }

            let mouseX = 0, mouseY = 0;
            window.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;

                    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                    const dx = mouseX - p.x;
                    const dy = mouseY - p.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 150) {
                        p.x -= dx * 0.002;
                        p.y -= dy * 0.002;
                    }

                    ctx.fillStyle = `rgba(129, 140, 248, ${p.alpha})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                });
                requestAnimationFrame(animate);
            }
            animate();
        }

        // --- HÀM GÓP Ý YÊU CẦU ---
        function showFeedback() {
            let container = document.getElementById('feedback-modal-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'feedback-modal-container';
                document.body.appendChild(container);
            }
            
            container.innerHTML = `
                <div id="fb-modal-overlay">
                    <div class="fb-wrapper">
                        <span class="fb-close-btn" onclick="closeFeedback()">&times;</span>
                        <div class="fb-header">
                            <h2>ĐÓNG GÓP Ý KIẾN</h2>
                            <p>Ý kiến của bạn giúp website ngày càng hoàn thiện hơn!</p>
                        </div>
                        
                        <form id="fb-main-form" class="fb-form">
                            <div>
                                <input type="text" name="name" placeholder="Họ và tên" required autocomplete="name">
                            </div>
                            
                            <div>
                                <input type="email" name="email" placeholder="Địa chỉ email" required autocomplete="email">
                            </div>
                            
                            <div>
                                <textarea name="feedback" rows="4" placeholder="Nhập nội dung góp ý tại đây..." required></textarea>
                            </div>
                            
                            <button type="submit" id="fb-submit" class="fb-btn">
                                <span id="fb-btn-text">Gửi Đóng Góp Ngay <i class="fas fa-paper-plane ml-1"></i></span>
                                <div class="fb-spinner" id="fb-loader"></div>
                            </button>
                        </form>
                    </div>
                </div>
            `;

            const overlay = document.getElementById('fb-modal-overlay');

            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });

            overlay.onclick = function(e) {
                if (e.target === overlay) closeFeedback();
            };

            const form = document.getElementById('fb-main-form');
            form.onsubmit = function(e) {
                e.preventDefault();
                const btn = document.getElementById('fb-submit');
                const loader = document.getElementById('fb-loader');
                const btnText = document.getElementById('fb-btn-text');

                const nameVal = form.querySelector('input[name="name"]').value.trim();
                const emailVal = form.querySelector('input[name="email"]').value.trim();
                const feedbackVal = form.querySelector('textarea[name="feedback"]').value.trim();

                btn.disabled = true;
                btnText.style.display = "none";
                loader.style.display = "inline-block";

                const fullFeedbackMsg = `[GÓP Ý - LIÊN HỆ] Người gửi: ${nameVal} (${emailVal}) | Nội dung: ${feedbackVal}`;
                const formData = new URLSearchParams();
                formData.append('wish', fullFeedbackMsg);

                fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData
                })
                .then(response => {
                    return response.json().catch(() => ({ success: true, message: "Đã gửi lời chúc!" }));
                })
                .then(data => {
                    closeFeedback();
                    Swal.fire({
                        title: "Thành công",
                        text: "Góp ý đã được gửi thành công! Cảm ơn bạn đã đóng góp ý kiến.",
                        icon: "success",
                        background: "#0f172a",
                        color: "#fff",
                        confirmButtonColor: "var(--nut, #6366f1)",
                        customClass: { popup: 'rounded-3xl border border-white/10' }
                    });
                })
                .catch(err => {
                    closeFeedback();
                    Swal.fire({
                        title: "Thành công",
                        text: "Góp ý đã được gửi thành công! Cảm ơn bạn đã đóng góp ý kiến.",
                        icon: "success",
                        background: "#0f172a",
                        color: "#fff",
                        confirmButtonColor: "var(--nut, #6366f1)",
                        customClass: { popup: 'rounded-3xl border border-white/10' }
                    });
                });
            };
        }
        window.showFeedback = showFeedback;

        function closeFeedback() {
            const overlay = document.getElementById('fb-modal-overlay');
            if (overlay) {
                overlay.classList.remove('active');
                setTimeout(() => { overlay.remove(); }, 400);
            }
        }
        window.closeFeedback = closeFeedback;

        // --- SỬA LỖI & TỐI ƯU MODAL LIÊN HỆ ---
        function showContact() {
            Swal.fire({
                title: 'KẾT NỐI VỚI ĐAN TRƯỜNG',
                html: `
                    <style>
                        .contact-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 16px;
                            margin-top: 20px;
                        }
                        .contact-card {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            padding: 20px 15px;
                            border-radius: 16px;
                            background: rgba(255, 255, 255, 0.03);
                            border: 1px solid rgba(255, 255, 255, 0.06);
                            color: #cbd5e1;
                            text-decoration: none;
                            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                        }
                        .contact-card i {
                            font-size: 2.25rem;
                            margin-bottom: 12px;
                            transition: transform 0.3s;
                        }
                        .contact-card span { font-size: 0.9rem; font-weight: 700; }
                        .contact-card:hover {
                            background: rgba(99, 102, 241, 0.1);
                            border-color: var(--nut, #6366f1);
                            color: #fff;
                            transform: translateY(-5px);
                        }
                        .c-fb i { color: #1877f2; }
                        .c-ins i { color: #e1306c; }
                        .c-tt i { color: #fff; }
                        .c-gm i { color: #ea4335; }
                    </style>
                    <div class="contact-grid">
                        <a href="https://web.facebook.com/dantruongag/" target="_blank" class="contact-card c-fb">
                            <i class="fab fa-facebook-f"></i>
                            <span>Facebook</span>
                        </a>
                        <a href="https://www.instagram.com/dantruongag/" target="_blank" class="contact-card c-ins">
                            <i class="fab fa-instagram"></i>
                            <span>Instagram</span>
                        </a>
                        <a href="https://www.tiktok.com/@dantruongag" target="_blank" class="contact-card c-tt">
                            <i class="fab fa-tiktok"></i>
                            <span>TikTok</span>
                        </a>
                        <a href="javascript:void(0);" onclick="copyEmail()" class="contact-card c-gm">
                            <i class="fas fa-envelope"></i>
                            <span>Sao chép Gmail</span>
                        </a>
                    </div>
                `,
                showConfirmButton: false,
                showCloseButton: true,
                background: '#111827',
                color: '#fff',
                customClass: { popup: 'rounded-3xl border border-white/10' }
            });
        }
        window.showContact = showContact;

        // --- SỬA LỖI SAO CHÉP EMAIL HOẠT ĐỘNG HOÀN HẢO Ở MỌI TRANG ---
        function copyEmail() {
            const emailStr = "dantruongag.phcn@gmail.com";
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(emailStr)
                    .then(() => {
                        showCopySuccessToast(emailStr);
                    })
                    .catch(() => {
                        fallbackCopyMethod(emailStr);
                    });
            } else {
                fallbackCopyMethod(emailStr);
            }
        }
        window.copyEmail = copyEmail;

        function fallbackCopyMethod(text) {
            try {
                const el = document.createElement('textarea');
                el.value = text;
                el.style.position = 'fixed';
                el.style.top = '0';
                el.style.left = '0';
                el.style.opacity = '0';
                document.body.appendChild(el);
                el.focus();
                el.select();
                
                const success = document.execCommand('copy');
                document.body.removeChild(el);

                if (success) {
                    showCopySuccessToast(text);
                } else {
                    throw new Error("Không thể thực thi lệnh copy");
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi sao chép tự động',
                    text: `Cậu vui lòng tự sao chép Gmail: ${text}`,
                    background: '#111827',
                    color: '#fff'
                });
            }
        }

        function showCopySuccessToast(email) {
            Swal.fire({ 
                icon: 'success', 
                title: 'Đã sao chép Gmail thành công!', 
                text: email,
                timer: 2000, 
                showConfirmButton: false,
                background: '#111827',
                color: '#fff'
            });
        }

        function loadComponents() {
            const headerPlaceholder = document.getElementById('header-placeholder');
            const searchPlaceholder = document.getElementById('search-placeholder');
            const footerPlaceholder = document.getElementById('footer-placeholder');

            const isLoggedIn = !!localStorage.getItem('loggedInUser');

            const dropdownMenuHTML = isLoggedIn ? `
                <div class="nav-dropdown-wrapper">
                    <a href="javascript:void(0);" class="desktop-nav-link text-white font-bold flex items-center gap-1.5">
                        MÔN HỌC <i class="fas fa-chevron-down text-xs"></i>
                    </a>
                    <div class="nav-dropdown-menu">
                        <a href="/tienganh/tienganh.html" class="nav-dropdown-item"><i class="fas fa-language"></i> Ngoại ngữ</a>
                        <a href="/giai_phau/giai_phau.html" class="nav-dropdown-item"><i class="fas fa-dna"></i> Giải Phẫu</a>
                        <a href="/benhhoc/benhhoc.html" class="nav-dropdown-item"><i class="fas fa-stethoscope"></i> Bệnh Học</a>
                        <a href="/hoahoc/hoahoc.html" class="nav-dropdown-item"><i class="fas fa-flask"></i> Hóa Học</a>
                        <a href="/yhoccotruyen/yhoccotruyen.html" class="nav-dropdown-item"><i class="fas fa-leaf"></i> Y Học Cổ Truyền</a>
                        <a href="/PHCN/phuc_hoi_chuc_nang.html" class="nav-dropdown-item"><i class="fas fa-wheelchair"></i> Phục Hồi Chức Năng</a>
                    </div>
                </div>
            ` : '';

            const headerHTML = `
                <header class="top-header" id="top-header">
                    <div class="container mx-auto px-4 md:px-8">
                        <div class="flex justify-between items-center">
                            <div class="logo">
                                <a href="/index.html">
                                   <img src="/hinhanh/logo_web.png" alt="Logo" onerror="this.onerror=null; this.src='https://placehold.co/150x150/4f46e5/ffffff?text=DT'">
                                </a>
                            </div>
                            <nav class="hidden md:flex items-center space-x-8">
                                <a href="/index.html" class="desktop-nav-link text-white font-bold">TRANG CHỦ</a>
                                ${dropdownMenuHTML}
                                ${isLoggedIn ? `
                                    <a href="javascript:void(0);" onclick="openNotesModal()" class="desktop-nav-link text-white font-bold flex items-center gap-1.5">SỔ TAY GHI CHÚ</a>
                                    <a href="javascript:void(0);" onclick="openSettings()" class="desktop-nav-link text-white font-bold flex items-center gap-1.5"><i class="fas fa-cog"></i> CÀI ĐẶT</a>
                                ` : ''}
                                <a href="javascript:void(0);" onclick="showContact()" class="desktop-nav-link text-white font-bold">LIÊN HỆ</a>
                                <a href="javascript:void(0);" onclick="showFeedback()" class="desktop-nav-link text-white font-bold">GÓP Ý</a>
                                
                                <div id="desktop-login-btn" class="pl-4"></div>
                                <div class="search-icon cursor-pointer text-white text-xl hover:text-yellow-300 transition-all duration-300 transform hover:scale-110" onclick="handleSearchClick()">
                                    <i class="fas fa-search"></i>
                                </div>
                            </nav>
                            <div class="md:hidden flex items-center gap-4">
                                <div class="search-icon cursor-pointer text-white text-xl" onclick="handleSearchClick()">
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
                    <div id="close-sidenav-btn" class="absolute top-5 right-6 text-white text-3xl cursor-pointer hover:text-red-500">
                        <i class="fas fa-times"></i>
                    </div>
                    <div id="login-btn" class="w-full mt-8 mb-4 px-6 border-b border-gray-800 pb-4"></div>
                    <a href="/index.html"><i class="fas fa-home"></i> TRANG CHỦ</a>
                    ${isLoggedIn ? `
                        <div class="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Môn Học nổi bật</div>
                        <a href="/tienganh/tienganh.html"><i class="fas fa-language"></i> Ngoại ngữ</a>
                        <a href="/giai_phau/giai_phau.html"><i class="fas fa-dna"></i> Giải Phẫu</a>
                        <a href="/benhhoc/benhhoc.html"><i class="fas fa-stethoscope"></i> Bệnh Học</a>
                        <a href="/PHCN/phuc_hoi_chuc_nang.html"><i class="fas fa-stethoscope"></i> Phục Hồi Chức Năng</a>
                        <div class="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Công cụ</div>
                        <a href="javascript:void(0);" onclick="openNotesModal()"><i class="fas fa-notes-medical"></i> Sổ tay ghi chú</a>
                        <a href="/yhoccotruyen/tra_cuu_huyet.html"><i class="fas fa-hand-sparkles"></i> Hệ thống tra cứu huyệt</a>
                        <a href="javascript:void(0);" onclick="openSettings()"><i class="fas fa-cog"></i> Cài đặt hệ thống</a>
                    ` : ''}
                    <a href="javascript:void(0);" onclick="showContact()"><i class="fas fa-phone"></i> LIÊN HỆ</a>
                    <a href="javascript:void(0);" onclick="showFeedback()"><i class="fas fa-envelope"></i> GÓP Ý</a>
                </aside>
            `;

            const searchHTML = `
                <div id="search-container" class="search-container">
                    <div class="search-panel">
                        <div class="search-bar-top">
                            <form id="search-form" class="w-full" onsubmit="event.preventDefault();">
                                <input type="search" id="search-input" placeholder="Nhập từ khóa cần tra cứu..." autocomplete="off">
                            </form>
                            <i class="fas fa-times close-search-btn" id="close-search-btn"></i>
                        </div>
                        <div id="search-suggestions-output"></div>
                    </div>
                </div>
            `;

            // STREAMING_CHUNK: Khởi tạo mã nguồn Footer tương thích tốt hơn với di động...
            const footerHTML = `
                <footer class="main-footer">
                    <div class="footer-content">
                        <div class="footer-brand">
                            <div class="footer-logo">
                                <a href="/index.html">
                                    <img src="/hinhanh/logo_web.png" alt="Logo" onerror="this.onerror=null; this.src='https://placehold.co/150x150/4f46e5/ffffff?text=DT'"/>
                                </a>
                            </div>
                            <p><b>dantruongag.id.vn</b></p>
                        </div>
                        
                        <div>
                            <h3 class="footer-column-title">Liên Kết Nhanh</h3>
                            <div class="footer-links">
                                <a href="/index.html"><i class="fas fa-home text-indigo-400"></i> Trang chủ</a>
                                ${isLoggedIn ? `
                                    <a href="javascript:void(0);" onclick="openNotesModal()"><i class="fas fa-edit text-teal-400"></i> Ghi chú</a>
                                    <a href="/yhoccotruyen/tra_cuu_huyet.html"><i class="fas fa-search-plus text-emerald-400"></i> Tra cứu huyệt</a>
                                    <a href="javascript:void(0);" onclick="openSettings()"><i class="fas fa-cog text-amber-400"></i> Cài đặt</a>
                                ` : ''}
                                <a href="javascript:void(0);" onclick="showContact()"><i class="fas fa-address-book text-blue-400"></i> Liên hệ</a>
                                <a href="javascript:void(0);" onclick="showFeedback()"><i class="fas fa-comment-dots text-pink-400"></i> Góp ý</a>
                            </div>
                        </div>

                        <div class="footer-social-wrapper">
                            <h3 class="footer-column-title">Liên Kết Mạng Xã Hội</h3>
                            <div class="footer-social">
                                <a href="https://web.facebook.com/dantruongag/" target="_blank" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                                <a href="https://www.instagram.com/dantruongag/" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                                <a href="https://www.tiktok.com/@dantruongag" target="_blank" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
                            </div>
                        </div>
                    </div>
                </footer>
            `;

            if (headerPlaceholder) headerPlaceholder.innerHTML = headerHTML;
            if (searchPlaceholder) searchPlaceholder.innerHTML = searchHTML;
            if (footerPlaceholder) footerPlaceholder.innerHTML = footerHTML;

            setupNavigationEvents();
        }

        // --- HÀM ẨN/HIỆN FORM GỬI LỜI CHÚC ---
        function toggleWishForm() {
            const form = document.getElementById('form_gui_loi_chuc');
            if (form) {
                if (form.classList.contains('max-h-0')) {
                    form.classList.remove('max-h-0');
                    form.classList.add('max-h-[500px]');
                    form.scrollIntoView({ behavior: 'smooth' });
                } else {
                    form.classList.remove('max-h-[500px]');
                    form.classList.add('max-h-0');
                }
            }
        }
        window.toggleWishForm = toggleWishForm;

        // --- BANNER CHỦ ĐỘNG ---
        function showMasterBanner() {
            const heroBg = document.getElementById('hero-bg');
            const heroTitle = document.getElementById('hero-title');
            const heroButtons = document.getElementById('hero-buttons');

            if (!heroBg || !heroTitle || !heroButtons) return;

            heroBg.style.background = 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.15), transparent), #0b0f19';
            heroTitle.innerHTML = `
                <span class="block text-3xl md:text-5xl lg:text-6xl font-black text-white mt-2">
                    CHÀO MỪNG BẠN ĐẾN VỚI TRANG WEBSITE
                </span>
            `;

            const today = new Date();
            const isBirthday = (today.getDate() === 18 && today.getMonth() === 6); 
            
            let birthdayBtnHTML = '';
            if (isBirthday) {
                birthdayBtnHTML = `
                    <button onclick="toggleWishForm()" class="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 font-bold text-white shadow-lg shadow-pink-500/25 transform hover:-translate-y-1 transition duration-300 flex items-center justify-center gap-2">
                        <i class="fas fa-birthday-cake animate-bounce"></i> GỬI LỜI CHÚC SINH NHẬT
                    </button>
                `;
            }

            heroButtons.innerHTML = `
                ${birthdayBtnHTML}
                <button onclick="showFeedback()" class="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-1 transition duration-300 flex items-center justify-center gap-2">
                    <i class="fas fa-paper-plane"></i> GỬI ĐÓNG GÓP Ý KIẾN
                </button>
                <button onclick="document.getElementById('guest-landing-info').scrollIntoView({ behavior: 'smooth' })" class="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 font-bold text-white transform hover:-translate-y-1 transition duration-300 flex items-center justify-center gap-2">
                    <i class="fas fa-book-reader"></i> KHÁM PHÁ NGAY
                </button>
            `;
        }

        // --- HỆ THỐNG ĐĂNG NHẬP & GAMIFICATION ---
        function checkLoginStatus() {
            const savedName = localStorage.getItem('loggedInUser');
            const guestLanding = document.getElementById('guest-landing-info');

            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                userProfile = JSON.parse(savedProfile);
            } else if (savedName) {
                userProfile.name = savedName;
            }

            if (savedName) {
                loadComponents();
                updateLoginUI();
                showProtectedContent();
                if (guestLanding) guestLanding.style.display = 'none';
            } else {
                resetLoginUI();
                hideProtectedContent();
                if (guestLanding) guestLanding.style.display = 'block';
            }
        }

        function updateLoginUI() {
            const mobileLoginBtn = document.getElementById('login-btn');
            const desktopLoginBtn = document.getElementById('desktop-login-btn');
            const loggedInHTML = `
                <div class="user-info text-white p-2 text-center md:text-left flex flex-col items-center md:items-start">
                    <div class="user-details flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full overflow-hidden border border-indigo-500 shadow animate-bounce">
                            <img src="${userProfile.avatar}" alt="Avatar" class="w-full h-full object-cover">
                        </div>
                        <span class="username font-semibold text-sm text-slate-200">${userProfile.name}</span>
                    </div>
                    <a class="logout-btn text-xs text-amber-400 hover:text-red-400 cursor-pointer block mt-1.5 transition" onclick="logout()">Đăng xuất</a>
                </div>`;
            
            if (mobileLoginBtn) mobileLoginBtn.innerHTML = loggedInHTML;
            if (desktopLoginBtn) desktopLoginBtn.innerHTML = loggedInHTML;
        }

        function resetLoginUI() {
            const mobileLoginBtn = document.getElementById('login-btn');
            const desktopLoginBtn = document.getElementById('desktop-login-btn');
            const loginHTMLMobile = `<a href="javascript:void(0);" onclick="showLoginForm()" class="login-button inline-flex items-center gap-2 w-full justify-center py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-lg text-white font-bold"><i class="fas fa-user-circle"></i> ĐĂNG NHẬP</a>`;
            const loginHTMLDesktop = `<a href="javascript:void(0);" onclick="showLoginForm()" class="login-button bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105 font-bold shadow-md shadow-indigo-500/20"><i class="fas fa-user-circle mr-2"></i>ĐĂNG NHẬP</a>`;
            
            if (mobileLoginBtn) mobileLoginBtn.innerHTML = loginHTMLMobile;
            if (desktopLoginBtn) desktopLoginBtn.innerHTML = loginHTMLDesktop;
        }

        function logout() {
            localStorage.removeItem('loggedInUser');
            Swal.fire({
                title: 'Đã đăng xuất!',
                text: 'Chúc bạn một ngày vui vẻ. Hẹn gặp lại!',
                icon: 'success',
                background: '#111827',
                color: '#fff',
                confirmButtonColor: 'var(--nut, #6366f1)'
            }).then(() => {
                loadComponents();
                checkLoginStatus();
                initAdvancedSearchEngine();
            });
        }
        window.logout = logout;

        function updateDashboardUI() {
            const dashboardAvatar = document.getElementById('dashboard-avatar');
            if (dashboardAvatar) {
                dashboardAvatar.src = userProfile.avatar;
            }
        }

        // --- TẢI FILE HTML TỰ ĐỘNG ---
        async function fetchAndParseArticle(url) {
            try {
                const fullUrl = url.startsWith('/') ? window.location.origin + url : url;
                const response = await fetch(fullUrl);
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                const htmlText = await response.text();
                
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, 'text/html');
                
                let title = doc.querySelector('title')?.textContent || "Bài giảng chi tiết";
                title = title.replace(" - Nguyễn Mai Đan Trường", "").trim();

                let desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 
                           doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                           "Khám phá tài liệu hướng dẫn lâm sàng chi tiết thuộc kho bài giảng của Đan Trường.";
                
                let tag = "Tài Liệu";
                if (url.includes("/tienganh/")) tag = "Tiếng Anh";
                else if (url.includes("/PHCN/")) tag = "PHCN";
                else if (url.includes("/yhoccotruyen/")) tag = "Y Học";
                else if (url.includes("đo_huyet_ap") || url.includes("rua_tay") || url.includes("tim_phoi")) tag = "Bệnh Học";

                return {
                    title,
                    desc,
                    tag,
                    date: "Vừa cập nhật",
                    link: url
                };
            } catch (err) {
                return null;
            }
        }

        async function loadAllArticles() {
            const container = document.getElementById('articles-container');
            if (container) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-r-2 mb-4"></div>
                        <p class="text-gray-400 text-sm">Đang tải & tự động đồng bộ tài liệu giảng dạy...</p>
                    </div>
                `;
            }

            const promises = allExternalLinks.map(url => fetchAndParseArticle(url));
            const results = await Promise.all(promises);
            
            const validArticles = results.filter(item => item !== null);

            if (validArticles.length > 0) {
                articlesDb = validArticles;
            } else {
                articlesDb = fallbackArticlesDb;
            }

            renderArticles();
        }

        // --- TRÌNH CHUYỂN SLIDE ĐIỀU HƯỚNG TRƠN TRU ---
        let sliderInterval = null;
        
        function initSlider() {
            const row = document.querySelector('.noidung-noibat-row');
            const items = document.querySelectorAll('.noidung-noibat-iten');
            const prev = document.querySelector('.prev-btn');
            const next = document.querySelector('.next-btn');
            const dotsContainer = document.querySelector('.slider-dots');

            if (!row || items.length === 0) return;

            let currentIndex = 0;
            let isDragging = false;
            let startX = 0;
            let currentTranslate = 0;
            let prevTranslate = 0;
            let animationId = 0;

            function getVisibleCount() {
                if (window.innerWidth <= 768) return 1;
                if (window.innerWidth <= 1024) return 2;
                return 3;
            }

            function getMaxIndex() {
                return Math.max(0, items.length - getVisibleCount());
            }

            function buildDots() {
                if (!dotsContainer) return;
                dotsContainer.innerHTML = '';
                const totalDots = getMaxIndex() + 1;
                for (let i = 0; i < totalDots; i++) {
                    const dot = document.createElement('div');
                    dot.classList.add('slider-dot');
                    if (i === 0) dot.classList.add('active');
                    dot.addEventListener('click', () => {
                        goToSlide(i);
                        resetAutoSlide();
                    });
                    dotsContainer.appendChild(dot);
                }
            }

            function updateDots() {
                if (!dotsContainer) return;
                const dots = dotsContainer.querySelectorAll('.slider-dot');
                dots.forEach((dot, index) => {
                    if (index === currentIndex) dot.classList.add('active');
                    else dot.classList.remove('active');
                });
            }

            function setSliderPosition() {
                row.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
            }

            // Fix kích thước slider di động chuẩn xác hơn
            function getSlideWidth() {
                if (items.length === 0) return 0;
                return items[0].getBoundingClientRect().width + 24;
            }

            function goToSlide(index) {
                currentIndex = Math.max(0, Math.min(index, getMaxIndex()));
                currentTranslate = -currentIndex * getSlideWidth();
                prevTranslate = currentTranslate;
                row.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                setSliderPosition();
                updateDots();
            }

            function dragStart(e) {
                isDragging = true;
                startX = getPositionX(e);
                row.style.transition = 'none';
                animationId = requestAnimationFrame(animation);
                resetAutoSlide();
            }

            function dragMove(e) {
                if (!isDragging) return;
                const currentX = getPositionX(e);
                const diff = currentX - startX;
                currentTranslate = prevTranslate + diff;
            }

            function dragEnd() {
                isDragging = false;
                cancelAnimationFrame(animationId);
                const movedBy = currentTranslate - prevTranslate;

                if (movedBy < -50 && currentIndex < getMaxIndex()) {
                    currentIndex += 1;
                } else if (movedBy > 50 && currentIndex > 0) {
                    currentIndex -= 1;
                }
                goToSlide(currentIndex);
            }

            function getPositionX(e) {
                return e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            }

            function animation() {
                setSliderPosition();
                if (isDragging) requestAnimationFrame(animation);
            }

            row.addEventListener('mousedown', dragStart);
            row.addEventListener('mousemove', dragMove);
            row.addEventListener('mouseup', dragEnd);
            row.addEventListener('mouseleave', dragEnd);

            row.addEventListener('touchstart', dragStart, { passive: true });
            row.addEventListener('touchmove', dragMove, { passive: true });
            row.addEventListener('touchend', dragEnd);

            if (next) {
                next.addEventListener('click', () => {
                    if (currentIndex < getMaxIndex()) {
                        goToSlide(currentIndex + 1);
                    } else {
                        goToSlide(0);
                    }
                    resetAutoSlide();
                });
            }

            if (prev) {
                prev.addEventListener('click', () => {
                    if (currentIndex > 0) {
                        goToSlide(currentIndex - 1);
                    } else {
                        goToSlide(getMaxIndex());
                    }
                    resetAutoSlide();
                });
            }

            function startAutoSlide() {
                sliderInterval = setInterval(() => {
                    if (currentIndex < getMaxIndex()) {
                        goToSlide(currentIndex + 1);
                    } else {
                        goToSlide(0);
                    }
                }, 5000);
            }

            function resetAutoSlide() {
                clearInterval(sliderInterval);
                startAutoSlide();
            }

            buildDots();
            goToSlide(0);
            startAutoSlide();

            window.addEventListener('resize', () => {
                buildDots();
                goToSlide(currentIndex);
            });
        }

        // --- SỔ TAY GHI CHÚ LÂM SÀNG ---
        let clinicalNotes = [];

        function openNotesModal() {
            const isLogged = !!localStorage.getItem('loggedInUser');
            if (!isLogged) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Yêu cầu đăng nhập',
                    text: 'Bạn vui lòng đăng nhập để sử dụng tính năng Sổ tay ghi chú ',
                    confirmButtonColor: 'var(--nut, #6366f1)',
                    background: '#111827',
                    color: '#fff'
                });
                return;
            }
            const modal = document.getElementById('notes-modal-overlay');
            if (modal) {
                modal.classList.remove('hidden');
                loadClinicalNotes();
                triggerNiceSound();
            }
        }
        window.openNotesModal = openNotesModal;

        function closeNotesModal() {
            const modal = document.getElementById('notes-modal-overlay');
            if (modal) {
                modal.classList.add('hidden');
            }
        }
        window.closeNotesModal = closeNotesModal;

        function loadClinicalNotes() {
            const saved = localStorage.getItem('clinicalNotes');
            if (saved) {
                clinicalNotes = JSON.parse(saved);
            } else {
                clinicalNotes = [
                    { id: Date.now(), title: "Triệu chứng Tăng Huyết Áp", content: "Đau đầu, hoa mắt, chóng mặt, ù tai, mất ngủ nhẹ, nặng nề vùng ngực cần kiểm tra huyết áp ngay.", tag: "Bệnh Học" }
                ];
            }
            renderNotesList();
        }

        function renderNotesList() {
            const container = document.getElementById('notes-grid');
            const counter = document.getElementById('notes-counter');
            if (!container) return;

            if (counter) counter.textContent = `${clinicalNotes.length} ghi chú`;

            if (clinicalNotes.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-10 text-gray-500 text-xs">
                        <i class="fas fa-folder-open text-2xl mb-2"></i>
                        <p>Sổ tay trống. Hãy thêm ghi chú mới lâm sàng!</p>
                    </div>`;
                return;
            }

            container.innerHTML = clinicalNotes.map(n => `
                <div class="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition duration-300 relative group">
                    <span class="text-[8px] uppercase font-extrabold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">${n.tag}</span>
                    <h4 class="text-sm font-bold text-white mt-1.5 mb-1">${n.title}</h4>
                    <p class="text-xs text-gray-400 leading-relaxed">${n.content}</p>
                    
                    <div class="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition">
                        <button onclick="copyNoteContent('${n.content.replace(/'/g, "\\'")}')" class="text-[10px] text-teal-400 hover:text-white" title="Sao chép nội dung"><i class="fas fa-copy"></i> Sao chép</button>
                        <button onclick="deleteClinicalNote(${n.id})" class="text-[10px] text-red-400 hover:text-white" title="Xóa ghi chú"><i class="fas fa-trash-alt"></i> Xóa</button>
                    </div>
                </div>
            `).join('');
        }

        function saveNewNote() {
            const titleInput = document.getElementById('note-title');
            const contentInput = document.getElementById('note-content');
            const tagInput = document.getElementById('note-tag');

            if (!titleInput || !contentInput || !titleInput.value.trim() || !contentInput.value.trim()) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Lỗi ghi chú',
                    text: 'Hãy điền đủ tiêu đề và nội dung ghi chú lâm sàng nhé!',
                    background: '#111827',
                    color: '#fff'
                });
                return;
            }

            const newNote = {
                id: Date.now(),
                title: titleInput.value.trim(),
                content: contentInput.value.trim(),
                tag: tagInput ? tagInput.value : "Lâm Sàng"
            };

            clinicalNotes.unshift(newNote);
            localStorage.setItem('clinicalNotes', JSON.stringify(clinicalNotes));
            
            titleInput.value = '';
            contentInput.value = '';
            
            renderNotesList();
            triggerNiceSound();
        }
        window.saveNewNote = saveNewNote;

        function copyNoteContent(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text)
                    .then(() => {
                        Swal.fire({ 
                            icon: 'success', 
                            title: 'Đã sao chép ghi chú!', 
                            timer: 1500, 
                            showConfirmButton: false,
                            background: '#111827',
                            color: '#fff'
                        });
                    })
                    .catch(() => {
                        fallbackCopyMethod(text);
                    });
            } else {
                fallbackCopyMethod(text);
            }
        }
        window.copyNoteContent = copyNoteContent;

        function deleteClinicalNote(id) {
            clinicalNotes = clinicalNotes.filter(n => n.id !== id);
            localStorage.setItem('clinicalNotes', JSON.stringify(clinicalNotes));
            renderNotesList();
            triggerNiceSound();
        }
        window.deleteClinicalNote = deleteClinicalNote;

        // --- CHỨC NĂNG HỆ THỐNG CÀI ĐẶT ---
        function openSettings() {
            const isLogged = !!localStorage.getItem('loggedInUser');
            if (!isLogged) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Yêu cầu đăng nhập',
                    text: 'Vui lòng đăng nhập để mở khóa cài đặt hệ thống.',
                    confirmButtonColor: 'var(--nut, #6366f1)',
                    background: '#111827',
                    color: '#fff'
                });
                return;
            }
            const modal = document.getElementById('settings-overlay');
            if (modal) {
                modal.classList.remove('hidden');
                
                document.getElementById('settings-name-input').value = userProfile.name;
                document.getElementById('settings-phone-input').value = userProfile.phone || "";
                document.getElementById('settings-birthday-input').value = userProfile.birthday || "";
                document.getElementById('settings-email-input').value = userProfile.email || "";
                document.getElementById('settings-avatar-preview').src = userProfile.avatar;

                switchSettingsTab('profile');
                triggerNiceSound();
            }
        }
        window.openSettings = openSettings;

        // --- XỬ LÝ GỬI LỜI CHÚC (doPost) ---
        function sendWish() {
            const textarea = document.querySelector('#form_gui_loi_chuc textarea');
            if (!textarea || !textarea.value.trim()) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Lỗi',
                    text: 'Bạn hãy viết một lời chúc thật ấm áp trước khi gửi nhé!',
                    background: '#111827',
                    color: '#fff'
                });
                return;
            }

            const wishContent = textarea.value.trim();
            const sendBtn = document.getElementById('nut_gui_loi_chuc');
            
            sendBtn.disabled = true;
            sendBtn.innerHTML = `Đang gửi... <i class="fas fa-spinner animate-spin ml-1"></i>`;

            const formData = new URLSearchParams();
            formData.append('wish', wishContent);

            fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            })
            .then(response => {
                return response.json().catch(() => ({ success: true, message: "Đã gửi lời chúc!" }));
            })
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Gửi Thành Công! 🎉',
                        text: 'Cảm ơn bạn rất nhiều vì lời chúc sinh nhật!',
                        background: '#111827',
                        color: '#fff',
                        confirmButtonColor: 'var(--nut, #6366f1)'
                    });
                    textarea.value = '';
                    toggleWishForm();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gửi Thất Bại!',
                        text: data.message || 'Xin lỗi, đã xảy ra sự cố khi gửi lời chúc. Vui lòng thử lại sau.',
                        background: '#111827',
                        color: '#fff'
                    });
                }
            })
            .catch(err => {
                Swal.fire({
                    icon: 'success',
                    title: 'Đã gửi lời chúc! 🎉',
                    text: 'Cảm ơn bạn đã chúc mừng sinh nhật cho mình!',
                    background: '#111827',
                    color: '#fff',
                    confirmButtonColor: 'var(--nut, #6366f1)'
                });
                textarea.value = '';
                toggleWishForm();
            })
            .finally(() => {
                sendBtn.disabled = false;
                sendBtn.innerHTML = `Gửi Đi Ngay <i class="fas fa-paper-plane ml-1"></i>`;
            });
        }
        window.sendWish = sendWish;

        function closeSettings() {
            const modal = document.getElementById('settings-overlay');
            if (modal) {
                modal.classList.add('hidden');
            }
        }
        window.closeSettings = closeSettings;

        function switchSettingsTab(tabName) {
            const panes = document.querySelectorAll('.settings-content-pane');
            panes.forEach(p => p.classList.add('hidden'));

            const target = document.getElementById(`settings-tab-${tabName}`);
            if (target) target.classList.remove('hidden');

            const tabs = ['profile', 'theme'];
            tabs.forEach(t => {
                const btn = document.getElementById(`set-tab-${t}`);
                if (btn) {
                    btn.className = "w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold transition flex items-center gap-2 text-gray-400 hover:text-white bg-transparent";
                }
            });

            const activeBtn = document.getElementById(`set-tab-${tabName}`);
            if (activeBtn) {
                activeBtn.className = "w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold transition flex items-center gap-2 bg-indigo-600 text-white shadow-lg shadow-indigo-500/25";
            }

            triggerNiceSound();
        }
        window.switchSettingsTab = switchSettingsTab;

        function previewUserAvatar(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('settings-avatar-preview').src = e.target.result;
                };
                reader.readAsDataURL(input.files[0]);
            }
        }
        window.previewUserAvatar = previewUserAvatar;

        function selectPresetAvatar(url) {
            document.getElementById('settings-avatar-preview').src = url;
            triggerNiceSound();
        }
        window.selectPresetAvatar = selectPresetAvatar;

        function saveSettings() {
            const nameVal = document.getElementById('settings-name-input').value.trim();
            const phoneVal = document.getElementById('settings-phone-input').value.trim();
            const birthdayVal = document.getElementById('settings-birthday-input').value;
            const emailVal = document.getElementById('settings-email-input').value.trim();
            const avatarSrc = document.getElementById('settings-avatar-preview').src;

            if (!nameVal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi đầu vào',
                    text: 'Bạn chưa nhập tên người dùng. Vui lòng điền đầy đủ thông tin!',
                    background: '#111827',
                    color: '#fff'
                });
                return;
            }

            if (phoneVal !== "") {
                const phoneRegex = /^0\d{9}$/;
                if (!phoneRegex.test(phoneVal)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Số điện thoại không hợp lệ',
                        text: 'Số điện thoại phải bắt đầu bằng chữ số 0 và có tổng cộng đúng 10 chữ số!',
                        background: '#111827',
                        color: '#fff',
                        confirmButtonColor: 'var(--nut, #6366f1)'
                    });
                    return;
                }
            }

            userProfile.name = nameVal;
            userProfile.phone = phoneVal;
            userProfile.birthday = birthdayVal;
            userProfile.email = emailVal;
            userProfile.avatar = avatarSrc;

            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            localStorage.setItem('loggedInUser', nameVal); 

            updateLoginUI();
            updateDashboardUI();
            closeSettings();

            Swal.fire({
                title: "Thành Công!",
                text: "Thông tin cá nhân và cấu hình đã được cập nhật hoàn tất!",
                icon: "success",
                background: "#0f172a",
                color: "#fff",
                confirmButtonColor: 'var(--nut, #6366f1)'
            });
        }
        window.saveSettings = saveSettings;

        // --- HIỂN THỊ NỘI DUNG CHUYÊN BIỆT SAU ĐĂNG NHẬP ---
        function showProtectedContent() {
            const el = document.getElementById('protected-content');
            if (el) {
                el.style.display = 'block';
                el.innerHTML = `
                    <!-- WELCOME HEADER -->
                    <section class="max-w-5xl mx-auto px-4 pt-12">
                        <div class="p-6 rounded-3xl bg-gradient-to-r from-[#1e1b4b]/80 to-[#0f172a]/95 border border-indigo-500/20 shadow-2xl relative overflow-hidden flex items-center gap-4">
                            <div class="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                            
                            <div class="w-16 h-16 rounded-2xl overflow-hidden border border-indigo-500/40 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg relative z-10 animate-pulse">
                                <img id="dashboard-avatar" src="${userProfile.avatar}" alt="Avatar" class="w-full h-full object-cover">
                            </div>
                            <div class="relative z-10">
                                <h3 class="text-xl font-bold text-white">Xin chào, ${userProfile.name}!</h3>
                                <p class="text-xs text-gray-400 mt-1">Chúc bạn một ngày vui vẻ và có những trải nghiệm tốt nhất</p>
                            </div>
                        </div>
                    </section>

                    <!-- CAROUSEL SLIDER NỔI BẬT -->
                    <section class="noidung-noibat">
                        <div class="text-center mb-10">
                            <h2 class="text-3xl md:text-5xl font-extrabold text-white mt-4">CHUYÊN ĐỀ HỌC TẬP</h2>
                            <div class="w-16 h-1 bg-indigo-500 mx-auto mt-4 rounded-full"></div>
                        </div>

                        <div class="slider-outer-wrapper">
                            <button class="prev-btn"><i class="fas fa-chevron-left"></i></button>
                            <div class="slider-container">
                                <div class="noidung-noibat-row">
                                    <div class="noidung-noibat-iten">
                                        <div class="noidung-noibat-ing"><img src="/hinhanh/Trang chủ/tienganh.png" alt="Tiếng Anh"></div>
                                        <div class="noidung-noibat-text">
                                            <h2>NGOẠI NGỮ</h2>
                                            <button onclick="window.location.href='/tienganh/tienganh.html'">KHÁM PHÁ</button>
                                        </div>
                                    </div>
                                    <div class="noidung-noibat-iten">
                                        <div class="noidung-noibat-ing"><img src="/hinhanh/Trang chủ/GPSL.png" alt="Giải Phẫu"></div>
                                        <div class="noidung-noibat-text">
                                            <h2>GIẢI PHẪU</h2>
                                            <button onclick="window.location.href='/giai_phau/giai_phau.html'">KHÁM PHÁ</button>
                                        </div>
                                    </div>
                                    <div class="noidung-noibat-iten">
                                        <div class="noidung-noibat-ing"><img src="/hinhanh/Trang chủ/benhhoc.png" alt="Bệnh Học"></div>
                                        <div class="noidung-noibat-text">
                                            <h2>BỆNH HỌC</h2>
                                            <button onclick="window.location.href='/benhhoc/benhhoc.html'">KHÁM PHÁ</button>
                                        </div>
                                    </div>
                                    <div class="noidung-noibat-iten">
                                        <div class="noidung-noibat-ing"><img src="/hinhanh/Trang chủ/hoahoc.png" alt="Hóa học"></div>
                                        <div class="noidung-noibat-text">
                                            <h2>HÓA HỌC</h2>
                                            <button onclick="window.location.href='/hoahoc/hoahoc.html'">KHÁM PHÁ</button>
                                        </div>
                                    </div>
                                    <div class="noidung-noibat-iten">
                                        <div class="noidung-noibat-ing"><img src="/hinhanh/Trang chủ/yhoccotruyen.png" alt="Y học cổ truyền"></div>
                                        <div class="noidung-noibat-text">
                                            <h2>Y HỌC CỔ TRUYỀN</h2>
                                            <button onclick="window.location.href='/yhoccotruyen/yhoccotruyen.html'">KHÁM PHÁ</button>
                                        </div>
                                    </div>
                                    <div class="noidung-noibat-iten">
                                        <div class="noidung-noibat-ing"><img src="/hinhanh/Trang chủ/phcn.png" alt="Phục Hồi Chức Năng"></div>
                                        <div class="noidung-noibat-text">
                                            <h2>PHỤC HỒI CHỨC NĂNG</h2>
                                            <button onclick="window.location.href='/PHCN/phuc_hoi_chuc_nang.html'">KHÁM PHÁ</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button class="next-btn"><i class="fas fa-chevron-right"></i></button>
                        </div>
                        <div class="slider-dots"></div>
                    </section>

                    <!-- DANH SÁCH BÀI VIẾT NỔI BẬT DỰA TRÊN DỮ LIỆU HTML THỰC TẾ -->
                    <section class="py-16 px-4 md:px-8 bg-[#090d1a]">
                        <div class="max-w-4xl mx-auto">
                            <div class="text-center mb-12">
                                <h2 class="text-3xl md:text-5xl font-extrabold text-white mt-4">BÀI VIẾT NỔI BẬT</h2>
                                <div class="w-16 h-1 bg-indigo-500 mx-auto mt-4 rounded-full"></div>
                            </div>
                            <div id="articles-container" class="space-y-6"></div>
                        </div>
                    </section>
                `;
                
                initSlider();
                updateDashboardUI();
                loadAllArticles();
            }
        }

        function renderArticles() {
            const container = document.getElementById('articles-container');
            if (container) {
                if (articlesDb.length === 0) {
                    container.innerHTML = '<p class="text-gray-400 text-center text-sm py-8">Chưa có bài giảng nào được tải lên.</p>';
                    return;
                }
                container.innerHTML = articlesDb.map(x => `
                    <div class="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer" onclick="window.location.href='${x.link || '#'}';">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="text-[10px] uppercase font-bold px-2.5 py-1 bg-indigo-600/30 text-indigo-300 rounded-full border border-indigo-500/20">${x.tag}</span>
                            <span class="text-xs text-gray-400">${x.date}</span>
                        </div>
                        <h3 class="text-lg md:text-xl font-bold text-white mb-2">${x.title}</h3>
                        <p class="text-gray-400 text-sm">${x.desc}</p>
                    </div>
                `).join('');
            }
        }

        function hideProtectedContent() {
            const el = document.getElementById('protected-content');
            if (el) {
                el.style.display = 'block';
                el.innerHTML = `
                    <section id="guest-landing-info" class="py-20 bg-gradient-to-b from-[#0b0f19] to-[#080b12] text-center px-4">
                        <div class="max-w-2xl mx-auto p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md relative overflow-hidden">
                            <div class="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                            <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"></div>
                            <div class="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl text-white shadow-lg relative z-10 animate-pulse">
                                <i class="fas fa-user-lock"></i>
                            </div>
                            <h3 class="text-2xl md:text-3xl font-bold text-white mb-3 relative z-10">YÊU CẦU ĐĂNG NHẬP</h3>
                            <p class="text-gray-300 text-sm md:text-base mb-8 max-w-md mx-auto relative z-10">
                                Bạn cần đăng nhập để xem nội dung này. Hãy đăng nhập ngay để khám phá những nội dung đặc biệt và trải nghiệm đầy đủ các tính năng của trang web!
                            </p>
                            <button onclick="showLoginForm()" class="px-8 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-300 relative z-10">
                                <i class="fas fa-user-circle mr-2"></i> ĐĂNG NHẬP NGAY
                            </button>
                        </div>
                    </section>
                `;
            }
            clearInterval(sliderInterval);
        }

        // --- XỬ LÝ ĐĂNG NHẬP QUA GOOGLE APPS SCRIPT ---
        function showLoginForm() {
            Swal.fire({
                title: 'ĐĂNG NHẬP HỆ THỐNG',
                html: `
                    <form id="loginForm" class="text-left mt-4" onsubmit="event.preventDefault();">
                        <div class="mb-4">
                            <label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Tên đăng nhập</label>
                            <input type="text" id="username" placeholder="Nhập tên đăng nhập" required class="w-full p-3 rounded-xl bg-slate-800 text-white border border-white/10 outline-none focus:border-indigo-500 transition text-sm">
                        </div>
                        <div class="mb-2 relative">
                            <label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Mật khẩu</label>
                            <input type="password" id="password" placeholder="Nhập mật khẩu" required class="w-full p-3 rounded-xl bg-slate-800 text-white border border-white/10 outline-none focus:border-indigo-500 transition text-sm pr-10">
                            <i id="togglePassword" class="fas fa-eye absolute right-3 top-9 cursor-pointer text-gray-400 hover:text-white"></i>
                        </div>
                    </form>`,
                showCancelButton: true, 
                confirmButtonText: 'Đăng Nhập Ngay', 
                cancelButtonText: 'Hủy bỏ',
                background: '#111827',
                color: '#fff',
                confirmButtonColor: 'var(--nut, #6366f1)',
                cancelButtonColor: '#374151',
                customClass: { popup: 'rounded-3xl border border-white/10' },
                preConfirm: () => {
                    const u = Swal.getPopup().querySelector('#username').value.trim();
                    const p = Swal.getPopup().querySelector('#password').value;
                    if (!u || !p) {
                        Swal.showValidationMessage(`Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!`);
                        return false;
                    }
                    return { username: u, password: p };
                },
                didOpen: () => {
                    const passInput = document.getElementById('password');
                    const toggle = document.getElementById('togglePassword');
                    if (toggle && passInput) {
                        toggle.addEventListener('click', () => {
                            const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
                            passInput.setAttribute('type', type);
                            toggle.classList.toggle('fa-eye');
                            toggle.classList.toggle('fa-eye-slash');
                        });
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const { username, password } = result.value;

                    Swal.fire({
                        title: 'Hệ thống đang xác thực...',
                        text: 'Vui lòng chờ trong giây lát',
                        allowOutsideClick: false,
                        background: '#111827',
                        color: '#fff',
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    const url = `${GOOGLE_APPS_SCRIPT_URL}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
                    
                    fetch(url)
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                localStorage.setItem('loggedInUser', data.name);
                                userProfile.name = data.name;
                                localStorage.setItem('userProfile', JSON.stringify(userProfile));

                                Swal.fire({
                                    icon: 'success',
                                    title: 'Đăng Nhập Thành Công!',
                                    text: `Chào mừng ${data.name} đến với website! Bạn đã đăng nhập thành công và có thể truy cập các nội dung.`,
                                    background: '#111827',
                                    color: '#fff',
                                    confirmButtonColor: 'var(--nut, #6366f1)'
                                }).then(() => {
                                    loadComponents();
                                    checkLoginStatus();
                                    initAdvancedSearchEngine();
                                });
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Xác Thực Thất Bại!',
                                    text: data.message || 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!',
                                    background: '#111827',
                                    color: '#fff'
                                });
                            }
                        })
                        .catch(err => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Lỗi Kết Nối!',
                                text: 'Hệ thống không thể kết nối đến cơ sở dữ liệu xác thực. Vui lòng kiểm tra lại kết nối mạng',
                                background: '#111827',
                                color: '#fff'
                            });
                        });
                }
            });
        }
        window.showLoginForm = showLoginForm;

        // --- ĐỒNG BỘ ĐÓNG/MỞ MENU VÀ BACKDROP TRÊN DI ĐỘNG ---
        function setupNavigationEvents() {
            const menuBar = document.getElementById("menu-bar");
            const sideNav = document.getElementById("side-nav");
            const closeSideNavBtn = document.getElementById("close-sidenav-btn");
            const backdrop = document.getElementById("side-nav-backdrop");

            function openSideMenu() {
                menuBar?.classList.add("active");
                sideNav?.classList.add("active");
                backdrop?.classList.add("active");
                document.body.style.overflow = "hidden"; // Ngăn cuộn phông nền trang chính
            }

            function closeSideMenu() {
                menuBar?.classList.remove("active");
                sideNav?.classList.remove("active");
                backdrop?.classList.remove("active");
                document.body.style.overflow = ""; // Khôi phục cuộn trang chính
            }

            if (menuBar && sideNav) {
                menuBar.onclick = (e) => {
                    e.stopPropagation();
                    if (sideNav.classList.contains("active")) {
                        closeSideMenu();
                    } else {
                        openSideMenu();
                    }
                };
            }
            
            if (closeSideNavBtn) {
                closeSideNavBtn.onclick = (e) => {
                    e.stopPropagation();
                    closeSideMenu();
                };
            }

            if (backdrop) {
                backdrop.onclick = closeSideMenu;
            }

            // TÍCH HỢP GESTURE VUỐT CHẠM (TOUCH SWIPES) ĐỂ ĐÓNG MENU DI ĐỘNG NHANH
            let touchStartX = 0;
            let touchEndX = 0;

            sideNav?.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            sideNav?.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                // Nếu vuốt sang phải một khoảng > 60px thì đóng Menu
                if (touchEndX - touchStartX > 60) {
                    closeSideMenu();
                }
            }, { passive: true });
        }

        // --- TRỢ LÝ ẢO MASCOT THÔNG MINH ---
        function initMascotInteractions() {
            const mascot = document.getElementById('website-mascot');
            const speech = document.getElementById('mascot-speech');
            if (!mascot || !speech) return;

            speech.addEventListener('click', (e) => e.stopPropagation());
            speech.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });

            window.handleAssistantAction = function(action) {
                if (action === 'contact') {
                    showContact();
                    closeAssistant();
                } else if (action === 'feedback') {
                    showFeedback();
                    closeAssistant();
                } else if (action === 'settings') {
                    openSettings();
                    closeAssistant();
                } else if (action === 'notes') {
                    openNotesModal();
                    closeAssistant();
                } else if (action === 'other') {
                    showSubMenu();
                } else if (action === 'q_search') {
                    showAnswer("Tìm kiếm bài học", "Bạn vui lòng nhấp vào biểu tượng kính lúp ở góc trên bên phải để mở công cụ tìm kiếm. Sau đó nhập từ khóa và xem các kết xuất hiện ra tức thì.");
                } else if (action === 'q_password') {
                    showAnswer("Tài khoản đăng nhập", "Bạn chưa có tài khoản đăng nhập hoặc mật khẩu không đúng. Vui lòng liên hệ trực tiếp để được cấp lại tài khoản.");
                } else if (action === 'main_menu') {
                    showMainMenu();
                }
            };

            function openAssistant() { speech.classList.add('active'); }
            function closeAssistant() { speech.classList.remove('active'); }

            function showMainMenu() {
                const isLogged = !!localStorage.getItem('loggedInUser');
                speech.innerHTML = `
                    <div class="assistant-title flex items-center gap-1.5 text-indigo-400">
                        <i class="fas fa-robot text-xs animate-pulse"></i> <span>Trợ lý ảo</span>
                    </div>
                    <p class="text-slate-300 mb-2 text-[11px]">Chào bạn, tôi luôn sẵn sàng hỗ trợ bạn</p>
                    ${isLogged ? `
                        <button onclick="handleAssistantAction('notes')" class="assistant-btn">
                            <i class="fas fa-notes-medical text-[10px] text-teal-400"></i> Mở Sổ tay Ghi chú
                        </button>
                        <button onclick="window.location.href='tracuuhuyet.html'" class="assistant-btn">
                            <i class="fas fa-hand-sparkles text-[10px] text-red-500"></i>
                            Mở Hệ thống tra cứu huyệt
                        </button>
                        <button onclick="handleAssistantAction('settings')" class="assistant-btn">
                            <i class="fas fa-cog text-[10px] text-amber-400"></i> Mở phần Cài đặt
                        </button>
                    ` : ''}
                    <button onclick="handleAssistantAction('contact')" class="assistant-btn">
                        <i class="fas fa-phone text-[10px] text-blue-400"></i> Liên hệ Đan Trường
                    </button>
                    <button onclick="handleAssistantAction('feedback')" class="assistant-btn">
                        <i class="fas fa-comment-dots text-[10px] text-pink-400"></i> Gửi góp ý phản hồi
                    </button>
                    <button onclick="handleAssistantAction('other')" class="assistant-btn">
                        <i class="fas fa-question-circle text-[10px] text-purple-400"></i> Các câu hỏi thường gặp
                    </button>
                `;
                openAssistant();
            }

            function showSubMenu() {
                speech.innerHTML = `
                    <div class="assistant-title flex items-center gap-1.5 text-amber-400">
                        <i class="fas fa-question-circle text-xs"></i> <span>Giải Đáp Thắc Mắc</span>
                    </div>
                    <button onclick="handleAssistantAction('q_search')" class="assistant-btn">❓ Tìm kiếm tài liệu như thế nào?</button>
                    <button onclick="handleAssistantAction('q_password')" class="assistant-btn">🔑 Tôi quên mật khẩu đăng nhập?</button>
                    <button onclick="handleAssistantAction('main_menu')" class="assistant-btn assistant-btn-back mt-2">
                        <i class="fas fa-arrow-left text-[10px]"></i> Quay lại
                    </button>
                `;
            }

            function showAnswer(title, answer) {
                speech.innerHTML = `
                    <div class="assistant-title flex items-center gap-1.5 text-emerald-400">
                        <i class="fas fa-info-circle text-xs"></i> <span>${title}</span>
                    </div>
                    <p class="text-slate-300 text-[11px] mb-3">${answer}</p>
                    <button onclick="handleAssistantAction('other')" class="assistant-btn assistant-btn-back">
                        <i class="fas fa-arrow-left text-[10px]"></i> Trở lại danh sách
                    </button>
                `;
            }

            setTimeout(() => { showMainMenu(); }, 2000);

            mascot.onclick = (e) => {
                e.stopPropagation();
                if (speech.classList.contains('active')) closeAssistant();
                else showMainMenu();
            };

            document.addEventListener('click', () => { closeAssistant(); });
        }

        // --- CÔNG CỤ TÌM KIẾM NÂNG CAO (KẾT NỐI REALTIME DATABASE QUA FIREBASE TỪ DULIEU.JS) ---
        async function initAdvancedSearchEngine() {
            // ================= CONFIG & DOM SETUP =================
            const config = {
                searchContainerId: 'search-container',
                searchFormId: 'search-form',
                searchInputId: 'search-input',
                closeSearchBtnId: 'close-search-btn',
                suggestionsOutputId: 'search-suggestions-output',

                loginPromptHTML: `
                    <div class="login-prompt-inline flex flex-col items-center justify-center text-center p-6 bg-slate-800/40 rounded-2xl border border-white/5">
                        <i class="fas fa-lock text-3xl text-amber-400 mb-3 animate-pulse"></i>
                        <h4 class="text-sm font-bold text-white mb-1">Yêu Cầu Đăng Nhập</h4>
                        <p class="text-xs text-gray-400 mb-4 max-w-xs">Bạn cần đăng nhập tài khoản để tìm kiếm và xem kết quả học tập.</p>
                        <button onclick="showLoginForm()" class="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-500/25">Đăng nhập ngay</button>
                    </div>`,

                noResultsHTML: `<p class="p-6 text-center text-gray-400 text-xs"><i class="fas fa-search-minus text-xl mb-2 block text-gray-500"></i>Không tìm thấy kết quả phù hợp với từ khóa.</p>`
            };

            const state = {
                isLoggedIn: () => !!localStorage.getItem('loggedInUser')
            };

            const searchContainer = document.getElementById(config.searchContainerId);
            const searchInput = document.getElementById(config.searchInputId);
            const closeSearchBtn = document.getElementById(config.closeSearchBtnId);
            const suggestionsOutput = document.getElementById(config.suggestionsOutputId);

            if (!searchContainer) return;

            // ================= UTILS =================
            const normalizeText = (text) => {
                if (!text) return '';
                const lower = text.trim().toLowerCase();
                return lower.charAt(0).toUpperCase() + lower.slice(1);
            };

            const removeVietnameseTones = (str) => {
                if (!str) return '';
                return str
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/đ/g, "d")
                    .replace(/Đ/g, "D");
            };

            // Dữ liệu mặc định ban đầu
            let searchableContent = [
                {
                    title: normalizeText('Trang Chủ'),
                    description: 'Quay về trang chủ của website học tập.',
                    url: '/index.html',
                    icon: 'fa-home',
                    category: 'Hệ thống'
                },
                {
                    title: normalizeText('Cơ sở dữ liệu'),
                    description: 'Hệ thống cơ sở dữ liệu lưu trữ các câu hỏi và tài liệu.',
                    url: '/dulieu.html',
                    icon: 'fa-database',
                    category: 'Hệ thống'
                },
                {
                    title: normalizeText('Hệ thống tạo câu hỏi'),
                    description: 'Công cụ hỗ trợ thêm tài liệu và đề ôn tập lâm sàng.',
                    url: '/formnhapcauhoi.html',
                    icon: 'fa-pen-to-square',
                    category: 'Hệ thống'
                }
            ];

            // --- TÍCH HỢP ĐỒNG BỘ REALTIME TỪ FIREBASE (LINKS) ---
            const loadFirebaseDatabaseSync = () => {
                const firebaseConfig = {
                    apiKey: "AIzaSyDyXmxsZAg6JxgcsujSIwMfbZTHscfJSCg",
                    authDomain: "dulieuweb-6541e.firebaseapp.com",
                    projectId: "dulieuweb-6541e",
                    storageBucket: "dulieuweb-6541e.firebasestorage.app",
                    messagingSenderId: "215480268517",
                    appId: "1:215480268517:web:16600eafd6839fee5dc60c"
                };

                const appId = typeof __app_id !== 'undefined' ? __app_id : 'v2-database-school';

                // Nạp động thư viện Firebase
                import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js")
                    .then(({ initializeApp }) => {
                        const app = initializeApp(firebaseConfig);
                        return Promise.all([
                            import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js"),
                            import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js")
                        ]);
                    })
                    .then(([{ getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken }, { getFirestore, collection, onSnapshot }]) => {
                        const auth = getAuth();
                        const db = getFirestore();

                        const authUser = async () => {
                            try {
                                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                                    await signInWithCustomToken(auth, __initial_auth_token);
                                } else {
                                    await signInAnonymously(auth);
                                }
                            } catch (e) {
                                console.warn("Lỗi kết nối Firebase Auth khi thiết lập tìm kiếm");
                            }
                        };

                        onAuthStateChanged(auth, (user) => {
                            if (user) {
                                // ĐỒNG BỘ REALTIME TÀI LIỆU HỌC TẬP (COLLECTION 'LINKS')
                                const linksRef = collection(db, 'artifacts', appId, 'public', 'data', 'links');
                                onSnapshot(linksRef, (snap) => {
                                    // Xóa bỏ tài liệu cũ đã được lưu trữ trong bộ nhớ đệm
                                    searchableContent = searchableContent.filter(item => item.source !== 'firebase_links');

                                    const firebaseLinks = snap.docs.map(doc => {
                                        const data = doc.data();
                                        return {
                                            title: normalizeText(data.title || 'Tài liệu lý thuyết'),
                                            description: `Chủ đề: ${data.topic || 'Y học'}`,
                                            keywords: `${data.title} ${data.subject} ${data.topic} tai lieu ly thuyet`.toLowerCase(),
                                            url: data.url || '#', // Chuyển hướng trực tiếp khi người dùng click
                                            icon: 'fa-book-open',
                                            category: data.subject || 'Tài Liệu',
                                            source: 'firebase_links'
                                        };
                                    });

                                    searchableContent = [...searchableContent, ...firebaseLinks];
                                    console.log("✅ Đã cập nhật realtime " + firebaseLinks.length + " tài liệu học tập vào bộ nhớ tìm kiếm.");
                                }, (err) => console.error("Firebase Search Links sync error:", err));
                            }
                        });

                        authUser();
                    })
                    .catch(err => {
                        console.warn("Không thể thiết lập tìm kiếm nâng cao qua Firebase:", err);
                    });
            };

            const buildFullSearchIndex = async () => {
                loadFirebaseDatabaseSync();
            };

            // ================= SEARCH PROCESS =================
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

            // ================= UI SUGGESTIONS RENDERER =================
            const renderSuggestions = (results) => {
                if (results.length === 0) {
                    suggestionsOutput.innerHTML = config.noResultsHTML;
                    return;
                }

                suggestionsOutput.innerHTML = '';

                results.slice(0, 15).forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item_search flex items-center gap-4 p-3.5 hover:bg-slate-800/60 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all duration-300 cursor-pointer';

                    const categoryBadgeColor = item.icon === 'fa-book-open' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                    div.innerHTML = `
                        <div class="icon w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 border border-white/5 shadow-inner">
                            <i class="fas ${item.icon}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${categoryBadgeColor}">
                                    ${item.category}
                                </span>
                            </div>
                            <h4 class="text-sm font-bold text-white truncate leading-snug">${item.title}</h4>
                            <p class="text-xs text-gray-400 truncate mt-0.5">${item.description}</p>
                        </div>
                        <div class="text-gray-500 group-hover:text-white transition">
                            <i class="fas fa-arrow-right text-xs"></i>
                        </div>
                    `;

                    div.onclick = () => {
                        if (item.url) window.location.href = item.url;
                    };

                    suggestionsOutput.appendChild(div);
                });
            };

            // ================= EVENT LISTENING =================
            const openSearch = () => {
                searchContainer.classList.add('active');
                searchInput.focus();
            };

            const closeSearch = () => {
                searchContainer.classList.remove('active');
                searchInput.value = '';
                suggestionsOutput.innerHTML = '';
            };

            window.handleSearchClick = openSearch;
            closeSearchBtn.onclick = closeSearch;

            searchInput.addEventListener('input', () => {
                performSearch(searchInput.value.trim());
            });

            await buildFullSearchIndex();
        }

        // --- LIFECYCLE INITIALIZER ---
        document.addEventListener("DOMContentLoaded", async function () {
            if (!window.Swal) {
                await new Promise((resolve) => {
                    const swalScript = document.createElement('script');
                    swalScript.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
                    swalScript.onload = resolve;
                    swalScript.onerror = resolve;
                    document.head.appendChild(swalScript);
                });
            }

            renderDynamicElements();
            loadComponents();
            showMasterBanner();
            initAmbientCanvas();

            const savedTheme = localStorage.getItem('selectedTheme');
            if (savedTheme) {
                changeAccentTheme(savedTheme);
            }

            window.addEventListener("scroll", () => {
                document.getElementById("top-header")?.classList.toggle("scrolled", window.scrollY > 50);
                const btt = document.getElementById('back-to-top');
                if (btt) {
                    if (window.scrollY > 300) {
                        btt.classList.remove('opacity-0', 'invisible', 'translate-y-3');
                        btt.classList.add('opacity-100', 'visible', 'translate-y-0');
                    } else {
                        btt.classList.add('opacity-0', 'invisible', 'translate-y-3');
                        btt.classList.remove('opacity-100', 'visible', 'translate-y-0');
                    }
                }
            });

            const bttBtn = document.getElementById('back-to-top');
            if (bttBtn) {
                bttBtn.onclick = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };
            }

            const sendWishBtn = document.getElementById('nut_gui_loi_chuc');
            if (sendWishBtn) {
                sendWishBtn.onclick = sendWish;
            }

            initMascotInteractions();
            checkLoginStatus();
            
            await initAdvancedSearchEngine();
        });