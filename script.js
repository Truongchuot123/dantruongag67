// ================= GOOGLE APPS SCRIPT CONFIGURATION =================
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxPan-KQDfgVodlpBL06ZjkSrIKUTgS3syVxJCZ67JhJaMktXfjz_99c6WptPuzjzLN_g/exec";

const allExternalLinks = [
    "/so_cuu_di_vat_duong_tho.html",
    "/giai_phau/csdl_giai_phau.html",
    "/giai_phau/giai_phau.co2.html",
    "/dulieu_nghiem_phap.html",
    "/giai_phau.html",
    "/đo_huyet_ap.html",
    "/rua_tay.html",
    "/hoi_suc_tim_phoi_co_ban.html",
    "/tienganh/IPA.html",
    "/PHCN/HĐTL/dung_cu_vltl.html",
    "/yhoccotruyen/tra_cuu_huyet.html",
    "/phong_luyen_thi_trac_nghiem.html",
    "/LearmAptis.html"
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
    // 0. Đảm bảo SweetAlert2 luôn hiển thị trên các modal có z-index cao (như z-[1200])
    if (!document.getElementById('swal-zindex-fix')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'swal-zindex-fix';
        styleEl.textContent = `.swal2-container { z-index: 9999 !important; }`;
        document.head.appendChild(styleEl);
    }

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

    // 4. Tạo Modal Sổ tay ghi chú lâm sàng (ĐÃ BỎ SAO LƯU & KHÔI PHỤC, NÂNG CẤP CSS ĐỊNH DẠNG)
    if (!document.getElementById('notes-modal-overlay')) {
        const notesOverlay = document.createElement('div');
        notesOverlay.id = 'notes-modal-overlay';
        notesOverlay.className = 'fixed inset-0 z-[1200] hidden bg-black/85 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4';
        notesOverlay.innerHTML = `
            <div class="bg-gradient-to-b from-[#0f172a] via-[#0b0f19] to-[#080b12] border border-white/15 shadow-[0_0_50px_rgba(99,102,241,0.15)] rounded-3xl w-full max-w-6xl h-[90vh] max-h-[820px] flex flex-col overflow-hidden transform transition-all duration-300">
                
                <!-- HEADER -->
                <div class="px-6 py-4 border-b border-white/10 flex flex-wrap justify-between items-center gap-4 bg-white/[0.03] shrink-0">
                    <div class="flex items-center gap-3.5">
                        <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
                            <i class="fas fa-book-medical"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h2 class="text-lg sm:text-xl font-black text-white tracking-tight">Sổ Tay Ghi Chú Thông Minh</h2>
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
                            </div>
                            <p class="text-xs text-gray-400">Quản lý kiến thức theo chủ đề, hỗ trợ hình ảnh & định dạng CSS</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2.5">
                        <!-- Thanh tìm kiếm nhanh -->
                        <div class="relative hidden sm:block">
                            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                            <input type="text" id="notes-search-input" oninput="handleNotesSearch(this.value)" placeholder="Tìm tiêu đề, nội dung..." class="pl-8 pr-3 py-1.5 w-48 lg:w-64 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition">
                        </div>

                        <button onclick="closeNotesModal()" class="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition ml-1">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- BODY CHÍNH (2 CỘT) -->
                <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                    
                    <!-- CỘT TRÁI: TRÌNH SOẠN THẢO & TÙY CHỈNH CSS / HÌNH ẢNH -->
                    <div class="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-white/10 p-5 overflow-y-auto bg-black/20 flex flex-col gap-4 custom-scrollbar">
                        <div class="flex items-center justify-between border-b border-white/10 pb-2.5">
                            <h3 id="editor-form-title" class="text-sm font-bold text-white flex items-center gap-2">
                                <i class="fas fa-pen-fancy text-indigo-400"></i> Tạo Ghi Chú Mới
                            </h3>
                            <button id="cancel-edit-btn" onclick="resetNoteForm()" class="hidden text-[11px] text-amber-400 hover:text-amber-300 font-semibold">
                                <i class="fas fa-undo mr-1"></i> Hủy sửa
                            </button>
                        </div>

                        <input type="hidden" id="note-edit-id" value="">

                        <!-- Chủ đề & Tiêu đề -->
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div class="sm:col-span-1">
                                <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Chủ đề</label>
                                <select id="note-tag" class="w-full p-2.5 rounded-xl bg-slate-800/90 text-white border border-white/10 outline-none focus:border-indigo-500 text-xs font-medium">
                                    <option value="Bệnh Học">🩺 Bệnh Học</option>
                                    <option value="Ngoại Ngữ">🌐 Ngoại Ngữ</option>
                                    <option value="Y học cổ truyền">🌿 Y học cổ truyền</option>
                                    <option value="Phục hồi chức năng">♿ Phục hồi chức năng</option>
                                    <option value="Giải Phẫu">🧬 Giải Phẫu</option>
                                    <option value="Khác">📌 Ghi chú khác</option>
                                </select>
                            </div>
                            <div class="sm:col-span-2">
                                <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tiêu đề ghi chú <span class="text-red-400">*</span></label>
                                <input id="note-title" type="text" placeholder="VD: Phác đồ cấp cứu phản vệ..." class="w-full p-2.5 rounded-xl bg-slate-800/90 text-white border border-white/10 outline-none focus:border-indigo-500 text-xs font-semibold">
                            </div>
                        </div>

                        <!-- Thanh công cụ định dạng CSS Nội dung (In đậm, In nghiêng, Gạch chân, Tô sáng chọn màu) -->
                        <div class="bg-slate-900/90 border border-white/10 rounded-2xl p-3 space-y-3">
                            <div class="flex items-center justify-between border-b border-white/5 pb-2">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                                    <i class="fas fa-paint-brush"></i> Định dạng CSS nội dung
                                </span>
                                <span class="text-[9px] text-gray-400 italic">Bôi đen chữ hoặc nhấn nút định dạng</span>
                            </div>

                            <!-- Hàng 1: In đậm, In nghiêng, Gạch chân & Tô sáng chọn màu -->
                            <div class="flex flex-wrap items-center gap-2">
                                <!-- Nhóm định dạng kiểu chữ -->
                                <div class="flex items-center bg-slate-800/90 p-1 rounded-xl border border-white/10 gap-1">
                                    <button type="button" id="btn-format-bold" onclick="toggleGlobalOrSelectionFormat('bold')" title="In đậm (Bold)" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-indigo-600 text-gray-200 hover:text-white text-xs font-black transition flex items-center justify-center">B</button>
                                    <button type="button" id="btn-format-italic" onclick="toggleGlobalOrSelectionFormat('italic')" title="In nghiêng (Italic)" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-indigo-600 text-gray-200 hover:text-white text-xs italic font-serif transition flex items-center justify-center">I</button>
                                    <button type="button" id="btn-format-underline" onclick="toggleGlobalOrSelectionFormat('underline')" title="Gạch chân (Underline)" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-indigo-600 text-gray-200 hover:text-white text-xs underline transition flex items-center justify-center">U</button>
                                </div>

                                <!-- Nhóm Tô sáng chọn màu (Highlight Palette + Color Picker) -->
                                <div class="flex items-center bg-slate-800/90 px-2 py-1 rounded-xl border border-white/10 gap-1.5 flex-1 justify-between">
                                    <span class="text-[10px] font-semibold text-gray-300 flex items-center gap-1">
                                        <i class="fas fa-highlighter text-yellow-400"></i> Tô sáng:
                                    </span>
                                    <div class="flex items-center gap-1">
                                        <button type="button" onclick="applyHighlightColor('#fde047', '#0f172a')" title="Tô sáng Vàng" class="w-5 h-5 rounded-full bg-[#fde047] border border-white/30 hover:scale-110 transition"></button>
                                        <button type="button" onclick="applyHighlightColor('#6ee7b7', '#064e3b')" title="Tô sáng Xanh Ngọc" class="w-5 h-5 rounded-full bg-[#6ee7b7] border border-white/30 hover:scale-110 transition"></button>
                                        <button type="button" onclick="applyHighlightColor('#93c5fd', '#1e3a8a')" title="Tô sáng Xanh Dương" class="w-5 h-5 rounded-full bg-[#93c5fd] border border-white/30 hover:scale-110 transition"></button>
                                        <button type="button" onclick="applyHighlightColor('#fda4af', '#881337')" title="Tô sáng Hồng Đỏ" class="w-5 h-5 rounded-full bg-[#fda4af] border border-white/30 hover:scale-110 transition"></button>
                                        <label title="Chọn màu tô sáng tùy ý" class="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 via-yellow-400 to-cyan-400 border border-white/40 cursor-pointer flex items-center justify-center overflow-hidden hover:scale-110 transition">
                                            <input type="color" id="note-highlight-picker" value="#fde047" onchange="applyHighlightColor(this.value, '#000000')" class="opacity-0 w-full h-full cursor-pointer">
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Hàng 2: Màu chữ, Cỡ chữ, Nền khung -->
                            <div class="grid grid-cols-3 gap-2">
                                <div>
                                    <label class="block text-[9px] text-gray-400 mb-0.5">Màu chữ</label>
                                    <div class="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-white/5">
                                        <input type="color" id="note-css-color" value="#e2e8f0" onchange="updateNotePreviewStyle()" class="w-4 h-4 rounded cursor-pointer bg-transparent border-0">
                                        <span class="text-[10px] text-gray-300">Màu chữ</span>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-[9px] text-gray-400 mb-0.5">Cỡ chữ</label>
                                    <select id="note-css-size" onchange="updateNotePreviewStyle()" class="w-full p-1.5 rounded-lg bg-slate-800 text-white border border-white/5 text-[11px] outline-none">
                                        <option value="13px">Nhỏ (13px)</option>
                                        <option value="14px" selected>Vừa (14px)</option>
                                        <option value="16px">Lớn (16px)</option>
                                        <option value="18px">Rất lớn (18px)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-[9px] text-gray-400 mb-0.5">Nền khung</label>
                                    <select id="note-css-bg" onchange="updateNotePreviewStyle()" class="w-full p-1.5 rounded-lg bg-slate-800 text-white border border-white/5 text-[11px] outline-none">
                                        <option value="rgba(30, 41, 59, 0.5)">Mặc định tối</option>
                                        <option value="rgba(49, 46, 129, 0.35)">Tím Indigo</option>
                                        <option value="rgba(6, 78, 59, 0.35)">Xanh Ngọc Lục</option>
                                        <option value="rgba(120, 53, 15, 0.35)">Vàng Hổ Phách</option>
                                        <option value="rgba(136, 19, 55, 0.35)">Đỏ San Hô</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Custom CSS nâng cao -->
                            <div>
                                <div class="flex justify-between items-center mb-0.5">
                                    <label class="text-[9px] text-gray-400 flex items-center gap-1"><i class="fas fa-code text-indigo-400"></i> Custom CSS (Tùy chọn nâng cao)</label>
                                </div>
                                <input type="text" id="note-custom-css" oninput="updateNotePreviewStyle()" placeholder="VD: line-height: 1.8; border-left: 3px solid #6366f1;" class="w-full p-2 rounded-lg bg-slate-800/80 text-indigo-200 border border-white/5 focus:border-indigo-500 outline-none text-[11px] font-mono">
                            </div>
                        </div>

                        <!-- Nội dung ghi chú -->
                        <div>
                            <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Nội dung ghi chú <span class="text-red-400">*</span></label>
                            <textarea id="note-content" rows="4" placeholder="Nhập nội dung kiến thức... Bôi đen đoạn chữ và nhấn B, I, U hoặc chọn màu tô sáng ở trên!" class="w-full p-3 rounded-xl bg-slate-800/90 text-white border border-white/10 outline-none focus:border-indigo-500 text-xs leading-relaxed resize-y transition-all"></textarea>
                        </div>

                        <!-- Thêm hình ảnh (Upload File hoặc Dán Link URL) -->
                        <div class="bg-slate-900/60 border border-dashed border-white/15 rounded-2xl p-3">
                            <div class="flex items-center justify-between mb-2">
                                <label class="text-[10px] uppercase font-bold text-gray-300 flex items-center gap-1.5">
                                    <i class="fas fa-image text-emerald-400"></i> Đính kèm hình ảnh minh họa
                                </label>
                                <label class="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold cursor-pointer transition">
                                    <i class="fas fa-folder-open mr-1"></i> Chọn ảnh từ máy
                                    <input type="file" id="note-image-file" accept="image/*" class="hidden" onchange="handleNoteImageUpload(this)">
                                </label>
                            </div>
                            <input type="text" id="note-image-url" oninput="previewNoteImageFromUrl(this.value)" placeholder="Hoặc dán đường dẫn URL hình ảnh (https://...) tại đây" class="w-full p-2 rounded-lg bg-slate-800/80 text-white border border-white/10 outline-none focus:border-emerald-500 text-[11px]">
                            
                            <!-- Khung xem trước ảnh -->
                            <div id="note-image-preview-box" class="hidden mt-2.5 relative rounded-xl overflow-hidden border border-white/10 bg-black/40 max-h-36 flex items-center justify-center">
                                <img id="note-image-preview" src="" alt="Preview" class="max-h-36 object-contain">
                                <button type="button" onclick="clearNoteImage()" class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 text-white text-xs flex items-center justify-center hover:bg-red-500 shadow">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Nút Lưu -->
                        <button id="save-note-btn" onclick="saveNewNote()" class="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 shrink-0">
                            <i class="fas fa-save"></i> <span>Lưu Vào Sổ Tay</span>
                        </button>
                    </div>

                    <!-- CỘT PHẢI: THẺ CARD CHỦ ĐỀ -> DANH SÁCH TIÊU ĐỀ -> ĐỌC CHI TIẾT -->
                    <div class="lg:col-span-7 p-5 overflow-y-auto flex flex-col bg-[#0b0f19] custom-scrollbar">
                        
                        <!-- Thanh tìm kiếm trên mobile -->
                        <div class="sm:hidden mb-3 relative">
                            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                            <input type="text" oninput="handleNotesSearch(this.value)" placeholder="Tìm tiêu đề, nội dung..." class="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white outline-none">
                        </div>

                        <!-- Điều hướng Breadcrumb -->
                        <div class="flex items-center justify-between mb-4 pb-2.5 border-b border-white/10 shrink-0">
                            <div id="notes-breadcrumb" class="flex items-center gap-2 text-xs font-bold text-gray-300">
                                <!-- Render động qua JS -->
                            </div>
                            <div class="text-xs text-indigo-300 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20" id="notes-counter">
                                0 ghi chú
                            </div>
                        </div>

                        <!-- VÙNG HIỂN THỊ ĐỘNG (THẺ CHỦ ĐỀ / DANH SÁCH TIÊU ĐỀ / TRÌNH ĐỌC CHI TIẾT) -->
                        <div id="notes-dynamic-view" class="flex-1">
                            <!-- Nội dung thay đổi linh hoạt theo trạng thái chọn -->
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

// --- MODAL LIÊN HỆ ---
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

// --- SAO CHÉP EMAIL ---
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
                <a href="/tienganh/vocab_notebook.html"><i class="fas fa-hand-paper"></i> Hệ thống học từ vựng</a>
                <a href="/hethong_laisuat.html"><i class="fas fa-hand-holding-usd"></i> Hệ thống tính lãi suất</a>
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

// =========================================================================
// --- SỔ TAY GHI CHÚ THÔNG MINH (ĐÃ SỬA LỖI XÓA & NÂNG CẤP ĐỊNH DẠNG CSS) ---
// =========================================================================
let clinicalNotes = [];
let noteNavState = {
    view: 'topics',     // 'topics' | 'titles' | 'detail'
    selectedTopic: null,
    selectedNoteId: null,
    searchQuery: ''
};

// Trạng thái định dạng CSS toàn khung cho ghi chú đang soạn
let activeEditorFormats = {
    bold: false,
    italic: false,
    underline: false
};

// Cấu hình giao diện màu sắc & icon cho từng Card Chủ Đề
const TOPIC_STYLES = {
    "Bệnh Học": { icon: "fa-stethoscope", gradient: "from-rose-600/20 to-red-900/20", border: "border-rose-500/30 hover:border-rose-400", badge: "bg-rose-500/20 text-rose-300", iconColor: "text-rose-400" },
    "Ngoại Ngữ": { icon: "fa-language", gradient: "from-sky-600/20 to-blue-900/20", border: "border-sky-500/30 hover:border-sky-400", badge: "bg-sky-500/20 text-sky-300", iconColor: "text-sky-400" },
    "Y học cổ truyền": { icon: "fa-leaf", gradient: "from-emerald-600/20 to-teal-900/20", border: "border-emerald-500/30 hover:border-emerald-400", badge: "bg-emerald-500/20 text-emerald-300", iconColor: "text-emerald-400" },
    "Phục hồi chức năng": { icon: "fa-wheelchair", gradient: "from-amber-600/20 to-orange-900/20", border: "border-amber-500/30 hover:border-amber-400", badge: "bg-amber-500/20 text-amber-300", iconColor: "text-amber-400" },
    "Giải Phẫu": { icon: "fa-dna", gradient: "from-purple-600/20 to-violet-900/20", border: "border-purple-500/30 hover:border-purple-400", badge: "bg-purple-500/20 text-purple-300", iconColor: "text-purple-400" },
    "Khác": { icon: "fa-bookmark", gradient: "from-indigo-600/20 to-slate-900/20", border: "border-indigo-500/30 hover:border-indigo-400", badge: "bg-indigo-500/20 text-indigo-300", iconColor: "text-indigo-400" }
};

function openNotesModal() {
    const isLogged = !!localStorage.getItem('loggedInUser');
    if (!isLogged) {
        Swal.fire({
            icon: 'warning',
            title: 'Yêu cầu đăng nhập',
            text: 'Bạn vui lòng đăng nhập để sử dụng tính năng Sổ tay ghi chú.',
            confirmButtonColor: 'var(--nut, #6366f1)',
            background: '#111827',
            color: '#fff'
        });
        return;
    }
    const modal = document.getElementById('notes-modal-overlay');
    if (modal) {
        modal.classList.remove('hidden');
        noteNavState = { view: 'topics', selectedTopic: null, selectedNoteId: null, searchQuery: '' };
        const searchInput = document.getElementById('notes-search-input');
        if (searchInput) searchInput.value = '';
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
            {
                id: Date.now(),
                title: "Triệu chứng Tăng Huyết Áp Lâm Sàng",
                content: "<b>Dấu hiệu nhận biết:</b> Đau đầu vùng chẩm, hoa mắt, chóng mặt, ù tai, mất ngủ nhẹ, nặng nề vùng ngực.\n\n<mark style='background-color:#fde047;color:#0f172a;padding:1px 6px;border-radius:4px;font-weight:600;'>Lưu ý:</mark> Cần đo huyết áp ở tư thế nghỉ ngơi ít nhất 5 phút để đánh giá chính xác.",
                tag: "Bệnh Học",
                image: "",
                pinned: true,
                createdAt: new Date().toLocaleDateString('vi-VN'),
                style: {
                    color: "#e2e8f0",
                    fontSize: "14px",
                    bgColor: "rgba(30, 41, 59, 0.5)",
                    bold: false,
                    italic: false,
                    underline: false,
                    customCss: "line-height: 1.7;"
                }
            }
        ];
        localStorage.setItem('clinicalNotes', JSON.stringify(clinicalNotes));
    }
    renderNotesExplorer();
}

// Chèn thẻ định dạng HTML nhanh vào vị trí con trỏ trong textarea
function insertFormatTag(openTag, closeTag) {
    const textarea = document.getElementById('note-content');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || "Nội dung";
    
    textarea.value = text.substring(0, start) + openTag + selected + closeTag + text.substring(end);
    textarea.focus();
    textarea.selectionStart = start + openTag.length;
    textarea.selectionEnd = start + openTag.length + selected.length;
}
window.insertFormatTag = insertFormatTag;

// Áp dụng In đậm / In nghiêng / Gạch chân (cho vùng bôi đen hoặc toàn bộ khung CSS)
function toggleGlobalOrSelectionFormat(type) {
    const textarea = document.getElementById('note-content');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Nếu người dùng đang bôi đen một đoạn chữ -> bọc thẻ HTML định dạng CSS cho đoạn chữ đó
    if (start !== end) {
        const tagMap = {
            bold: ['<span style="font-weight: 800;">', '</span>'],
            italic: ['<span style="font-style: italic;">', '</span>'],
            underline: ['<span style="text-decoration: underline;">', '</span>']
        };
        insertFormatTag(tagMap[type][0], tagMap[type][1]);
        triggerNiceSound();
        return;
    }

    // Nếu không bôi đen chữ -> bật/tắt thuộc tính CSS cho toàn bộ nội dung ghi chú
    activeEditorFormats[type] = !activeEditorFormats[type];
    const btn = document.getElementById(`btn-format-${type}`);
    if (btn) {
        if (activeEditorFormats[type]) {
            btn.classList.remove('bg-white/5', 'text-gray-200');
            btn.classList.add('bg-indigo-600', 'text-white', 'shadow');
        } else {
            btn.classList.add('bg-white/5', 'text-gray-200');
            btn.classList.remove('bg-indigo-600', 'text-white', 'shadow');
        }
    }
    updateNotePreviewStyle();
    triggerNiceSound();
}
window.toggleGlobalOrSelectionFormat = toggleGlobalOrSelectionFormat;

// Áp dụng Tô sáng chọn màu (Highlight)
function applyHighlightColor(bgColor, textColor = '#0f172a') {
    const openTag = `<mark style="background-color:${bgColor};color:${textColor};padding:1px 6px;border-radius:4px;font-weight:600;">`;
    const closeTag = `</mark>`;
    insertFormatTag(openTag, closeTag);
    triggerNiceSound();
}
window.applyHighlightColor = applyHighlightColor;

// Xử lý tải ảnh từ máy tính (nén nhẹ bằng Canvas để không vượt quá giới hạn localStorage)
function handleNoteImageUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                document.getElementById('note-image-url').value = compressedDataUrl;
                showNoteImagePreview(compressedDataUrl);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}
window.handleNoteImageUpload = handleNoteImageUpload;

function previewNoteImageFromUrl(url) {
    if (url && url.trim() !== '') {
        showNoteImagePreview(url.trim());
    } else {
        clearNoteImage();
    }
}
window.previewNoteImageFromUrl = previewNoteImageFromUrl;

function showNoteImagePreview(src) {
    const box = document.getElementById('note-image-preview-box');
    const img = document.getElementById('note-image-preview');
    if (box && img) {
        img.src = src;
        box.classList.remove('hidden');
    }
}

function clearNoteImage() {
    const box = document.getElementById('note-image-preview-box');
    const img = document.getElementById('note-image-preview');
    const urlInput = document.getElementById('note-image-url');
    const fileInput = document.getElementById('note-image-file');
    if (box) box.classList.add('hidden');
    if (img) img.src = '';
    if (urlInput) urlInput.value = '';
    if (fileInput) fileInput.value = '';
}
window.clearNoteImage = clearNoteImage;

function updateNotePreviewStyle() {
    const textarea = document.getElementById('note-content');
    if (!textarea) return;
    const color = document.getElementById('note-css-color')?.value || '#e2e8f0';
    const fontSize = document.getElementById('note-css-size')?.value || '14px';
    textarea.style.color = color;
    textarea.style.fontSize = fontSize;
    textarea.style.fontWeight = activeEditorFormats.bold ? '700' : '400';
    textarea.style.fontStyle = activeEditorFormats.italic ? 'italic' : 'normal';
    textarea.style.textDecoration = activeEditorFormats.underline ? 'underline' : 'none';
}
window.updateNotePreviewStyle = updateNotePreviewStyle;

// Lưu hoặc Cập nhật ghi chú
function saveNewNote() {
    const editId = document.getElementById('note-edit-id')?.value;
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    const tagInput = document.getElementById('note-tag');
    const imageInput = document.getElementById('note-image-url');

    const colorVal = document.getElementById('note-css-color')?.value || '#e2e8f0';
    const sizeVal = document.getElementById('note-css-size')?.value || '14px';
    const bgVal = document.getElementById('note-css-bg')?.value || 'rgba(30, 41, 59, 0.5)';
    const customCssVal = document.getElementById('note-custom-css')?.value.trim() || '';

    if (!titleInput || !contentInput || !titleInput.value.trim() || !contentInput.value.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: 'Vui lòng nhập đầy đủ tiêu đề và nội dung ghi chú!',
            background: '#111827',
            color: '#fff'
        });
        return;
    }

    const noteData = {
        id: editId ? Number(editId) : Date.now(),
        title: titleInput.value.trim(),
        content: contentInput.value.trim(),
        tag: tagInput ? tagInput.value : "Khác",
        image: imageInput ? imageInput.value.trim() : "",
        pinned: false,
        createdAt: new Date().toLocaleDateString('vi-VN'),
        style: {
            color: colorVal,
            fontSize: sizeVal,
            bgColor: bgVal,
            bold: activeEditorFormats.bold,
            italic: activeEditorFormats.italic,
            underline: activeEditorFormats.underline,
            customCss: customCssVal
        }
    };

    if (editId) {
        const index = clinicalNotes.findIndex(n => String(n.id) === String(editId));
        if (index !== -1) {
            noteData.pinned = clinicalNotes[index].pinned || false;
            noteData.createdAt = clinicalNotes[index].createdAt || noteData.createdAt;
            clinicalNotes[index] = noteData;
        }
    } else {
        clinicalNotes.unshift(noteData);
    }

    try {
        localStorage.setItem('clinicalNotes', JSON.stringify(clinicalNotes));
    } catch (e) {
        Swal.fire({
            icon: 'error',
            title: 'Bộ nhớ đầy',
            text: 'Hình ảnh quá lớn vượt quá bộ nhớ trình duyệt. Hãy thử dùng ảnh nhẹ hơn hoặc dán link URL ảnh.',
            background: '#111827',
            color: '#fff'
        });
        return;
    }

    // Chuyển thẳng đến bài vừa tạo/sửa để xem kết quả
    noteNavState.view = 'detail';
    noteNavState.selectedTopic = noteData.tag;
    noteNavState.selectedNoteId = noteData.id;

    resetNoteForm();
    renderNotesExplorer();
    triggerNiceSound();

    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: editId ? 'Đã cập nhật ghi chú!' : 'Đã thêm ghi chú mới!',
        showConfirmButton: false,
        timer: 1800,
        background: '#1e293b',
        color: '#fff'
    });
}
window.saveNewNote = saveNewNote;

function resetNoteForm() {
    document.getElementById('note-edit-id').value = '';
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    document.getElementById('note-custom-css').value = '';
    document.getElementById('note-css-color').value = '#e2e8f0';
    document.getElementById('note-css-size').value = '14px';
    document.getElementById('note-css-bg').value = 'rgba(30, 41, 59, 0.5)';
    
    activeEditorFormats = { bold: false, italic: false, underline: false };
    ['bold', 'italic', 'underline'].forEach(type => {
        const btn = document.getElementById(`btn-format-${type}`);
        if (btn) {
            btn.classList.add('bg-white/5', 'text-gray-200');
            btn.classList.remove('bg-indigo-600', 'text-white', 'shadow');
        }
    });

    const textarea = document.getElementById('note-content');
    if (textarea) {
        textarea.style.color = '#e2e8f0';
        textarea.style.fontSize = '14px';
        textarea.style.fontWeight = '400';
        textarea.style.fontStyle = 'normal';
        textarea.style.textDecoration = 'none';
    }

    clearNoteImage();
    document.getElementById('editor-form-title').innerHTML = `<i class="fas fa-pen-fancy text-indigo-400"></i> Tạo Ghi Chú Mới`;
    document.getElementById('save-note-btn').innerHTML = `<i class="fas fa-save"></i> <span>Lưu Vào Sổ Tay</span>`;
    document.getElementById('cancel-edit-btn').classList.add('hidden');
}
window.resetNoteForm = resetNoteForm;

// Nạp dữ liệu ghi chú lên form để chỉnh sửa
function editClinicalNote(id) {
    const note = clinicalNotes.find(n => String(n.id) === String(id));
    if (!note) return;

    document.getElementById('note-edit-id').value = note.id;
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').value = note.content;
    document.getElementById('note-tag').value = note.tag;

    const st = note.style || {};
    document.getElementById('note-css-color').value = st.color || '#e2e8f0';
    document.getElementById('note-css-size').value = st.fontSize || '14px';
    document.getElementById('note-css-bg').value = st.bgColor || 'rgba(30, 41, 59, 0.5)';
    document.getElementById('note-custom-css').value = st.customCss || '';

    activeEditorFormats = {
        bold: !!st.bold,
        italic: !!st.italic,
        underline: !!st.underline
    };

    ['bold', 'italic', 'underline'].forEach(type => {
        const btn = document.getElementById(`btn-format-${type}`);
        if (btn) {
            if (activeEditorFormats[type]) {
                btn.classList.remove('bg-white/5', 'text-gray-200');
                btn.classList.add('bg-indigo-600', 'text-white', 'shadow');
            } else {
                btn.classList.add('bg-white/5', 'text-gray-200');
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow');
            }
        }
    });

    updateNotePreviewStyle();

    if (note.image) {
        document.getElementById('note-image-url').value = note.image;
        showNoteImagePreview(note.image);
    } else {
        clearNoteImage();
    }

    document.getElementById('editor-form-title').innerHTML = `<i class="fas fa-edit text-amber-400"></i> Đang Chỉnh Sửa Ghi Chú`;
    document.getElementById('save-note-btn').innerHTML = `<i class="fas fa-check-circle"></i> <span>Cập Nhật Thay Đổi</span>`;
    document.getElementById('cancel-edit-btn').classList.remove('hidden');
    triggerNiceSound();
}
window.editClinicalNote = editClinicalNote;

// Ghim / Bỏ ghim ghi chú lên đầu
function togglePinNote(id, event) {
    if (event) event.stopPropagation();
    const note = clinicalNotes.find(n => String(n.id) === String(id));
    if (note) {
        note.pinned = !note.pinned;
        localStorage.setItem('clinicalNotes', JSON.stringify(clinicalNotes));
        renderNotesExplorer();
        triggerNiceSound();
    }
}
window.togglePinNote = togglePinNote;

// Điều hướng giữa các cấp: Card Chủ Đề -> Danh Sách Tiêu Đề -> Đọc Chi Tiết
function navigateNotesView(view, topic = null, noteId = null) {
    noteNavState.view = view;
    if (topic !== null) noteNavState.selectedTopic = topic;
    if (noteId !== null) noteNavState.selectedNoteId = noteId;
    renderNotesExplorer();
    triggerNiceSound();
}
window.navigateNotesView = navigateNotesView;

function handleNotesSearch(query) {
    noteNavState.searchQuery = query.trim().toLowerCase();
    renderNotesExplorer();
}
window.handleNotesSearch = handleNotesSearch;

// --- RENDER GIAO DIỆN EXPLORER BÊN PHẢI ---
function renderNotesExplorer() {
    const viewContainer = document.getElementById('notes-dynamic-view');
    const breadcrumb = document.getElementById('notes-breadcrumb');
    const counter = document.getElementById('notes-counter');

    if (!viewContainer || !breadcrumb) return;
    if (counter) counter.textContent = `${clinicalNotes.length} ghi chú`;

    // 1. NẾU ĐANG TÌM KIẾM TỪ KHÓA
    if (noteNavState.searchQuery) {
        breadcrumb.innerHTML = `
            <button onclick="navigateNotesView('topics')" class="text-indigo-400 hover:underline flex items-center gap-1">
                <i class="fas fa-th-large"></i> Tất cả chủ đề
            </button>
            <i class="fas fa-chevron-right text-[10px] text-gray-600"></i>
            <span class="text-white">Kết quả tìm kiếm "${noteNavState.searchQuery}"</span>
        `;

        const filtered = clinicalNotes.filter(n => 
            n.title.toLowerCase().includes(noteNavState.searchQuery) || 
            n.content.toLowerCase().includes(noteNavState.searchQuery) ||
            n.tag.toLowerCase().includes(noteNavState.searchQuery)
        );

        renderTitlesListHTML(viewContainer, filtered, "Không tìm thấy ghi chú nào khớp với từ khóa.");
        return;
    }

    // 2. CẤP 1: HIỂN THỊ DANH SÁCH THẺ CARD CHỦ ĐỀ
    if (noteNavState.view === 'topics') {
        breadcrumb.innerHTML = `
            <span class="text-white flex items-center gap-2">
                <i class="fas fa-layer-group text-indigo-400"></i> Danh Mục Thẻ Chủ Đề
            </span>
        `;

        const topicMap = {};
        Object.keys(TOPIC_STYLES).forEach(t => topicMap[t] = []);
        clinicalNotes.forEach(note => {
            const t = topicMap[note.tag] ? note.tag : "Khác";
            topicMap[t].push(note);
        });

        const cardsHTML = Object.keys(topicMap).map(topicName => {
            const notesInTopic = topicMap[topicName];
            const style = TOPIC_STYLES[topicName] || TOPIC_STYLES["Khác"];
            const latestTitle = notesInTopic.length > 0 ? notesInTopic[0].title : "Chưa có ghi chú nào";

            return `
                <div onclick="navigateNotesView('titles', '${topicName}')" 
                     class="group relative p-5 rounded-2xl bg-gradient-to-br ${style.gradient} border ${style.border} cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between overflow-hidden">
                    
                    <div class="flex items-start justify-between mb-4">
                        <div class="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-xl ${style.iconColor} group-hover:scale-110 transition-transform">
                            <i class="fas ${style.icon}"></i>
                        </div>
                        <span class="text-xs font-extrabold px-3 py-1 rounded-full ${style.badge}">
                            ${notesInTopic.length} bài
                        </span>
                    </div>

                    <div>
                        <h4 class="text-base font-extrabold text-white group-hover:text-indigo-200 transition">${topicName}</h4>
                        <p class="text-[11px] text-gray-400 mt-1 truncate">
                            ${notesInTopic.length > 0 ? `<i class="fas fa-file-alt mr-1 opacity-70"></i>Mới nhất: ${latestTitle}` : 'Nhấn để xem hoặc thêm mới'}
                        </p>
                    </div>

                    <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-gray-300 group-hover:text-white">
                        <span>Xem danh sách tiêu đề</span>
                        <i class="fas fa-arrow-right transform group-hover:translate-x-1 transition-transform"></i>
                    </div>
                </div>
            `;
        }).join('');

        viewContainer.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${cardsHTML}
            </div>
        `;
        return;
    }

    // 3. CẤP 2: HIỂN THỊ DANH SÁCH TIÊU ĐỀ KHI CHỌN MỘT THẺ CHỦ ĐỀ
    if (noteNavState.view === 'titles') {
        const topic = noteNavState.selectedTopic;
        breadcrumb.innerHTML = `
            <button onclick="navigateNotesView('topics')" class="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition">
                <i class="fas fa-arrow-left"></i> Thẻ chủ đề
            </button>
            <i class="fas fa-chevron-right text-[10px] text-gray-600"></i>
            <span class="text-white font-extrabold">${topic}</span>
        `;

        const notesInTopic = clinicalNotes
            .filter(n => n.tag === topic)
            .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

        renderTitlesListHTML(viewContainer, notesInTopic, `Chủ đề "${topic}" hiện chưa có ghi chú nào. Hãy tạo ghi chú mới ở cột bên trái!`);
        return;
    }

    // 4. CẤP 3: ĐỌC CHI TIẾT NỘI DUNG GHI CHÚ KHI NHẤP VÀO TIÊU ĐỀ
    if (noteNavState.view === 'detail') {
        const note = clinicalNotes.find(n => String(n.id) === String(noteNavState.selectedNoteId));
        if (!note) {
            navigateNotesView('topics');
            return;
        }

        const style = TOPIC_STYLES[note.tag] || TOPIC_STYLES["Khác"];
        const customStyle = note.style || {};
        const inlineCss = `
            color: ${customStyle.color || '#e2e8f0'};
            font-size: ${customStyle.fontSize || '14px'};
            background-color: ${customStyle.bgColor || 'rgba(30, 41, 59, 0.5)'};
            font-weight: ${customStyle.bold ? '700' : '400'};
            font-style: ${customStyle.italic ? 'italic' : 'normal'};
            text-decoration: ${customStyle.underline ? 'underline' : 'none'};
            ${customStyle.customCss || ''}
        `;

        const formattedContent = note.content.replace(/\n/g, '<br>');

        breadcrumb.innerHTML = `
            <button onclick="navigateNotesView('topics')" class="text-gray-400 hover:text-white transition">Chủ đề</button>
            <i class="fas fa-chevron-right text-[10px] text-gray-600"></i>
            <button onclick="navigateNotesView('titles', '${note.tag}')" class="text-indigo-400 hover:text-indigo-300 transition">${note.tag}</button>
            <i class="fas fa-chevron-right text-[10px] text-gray-600"></i>
            <span class="text-white truncate max-w-[150px] sm:max-w-[240px]">Đọc chi tiết</span>
        `;

        viewContainer.innerHTML = `
            <div class="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden shadow-2xl animate-fadeIn">
                <!-- Thanh công cụ bài đọc -->
                <div class="px-5 py-3.5 bg-white/[0.03] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <button onclick="navigateNotesView('titles', '${note.tag}')" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-white transition flex items-center gap-1.5">
                        <i class="fas fa-arrow-left"></i> Quay lại danh sách
                    </button>

                    <div class="flex items-center gap-2">
                        <button onclick="togglePinNote(${note.id})" class="px-2.5 py-1.5 rounded-xl ${note.pinned ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-gray-400 hover:text-white'} text-xs font-semibold transition" title="Ghim bài viết">
                            <i class="fas fa-thumbtack"></i>
                        </button>
                        <button onclick="copyNoteContentById(${note.id})" class="px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 text-xs font-semibold transition flex items-center gap-1">
                            <i class="fas fa-copy"></i> Sao chép
                        </button>
                        <button onclick="editClinicalNote(${note.id})" class="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold transition flex items-center gap-1">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button onclick="deleteClinicalNote(${note.id}, event)" class="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-semibold transition flex items-center gap-1">
                            <i class="fas fa-trash-alt"></i> Xóa
                        </button>
                    </div>
                </div>

                <!-- Nội dung chi tiết bài ghi chú -->
                <div class="p-6 space-y-5">
                    <div>
                        <div class="flex items-center gap-2.5 mb-2">
                            <span class="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-lg ${style.badge}">
                                <i class="fas ${style.icon} mr-1"></i> ${note.tag}
                            </span>
                            <span class="text-xs text-gray-500"><i class="far fa-clock mr-1"></i>${note.createdAt || 'Hôm nay'}</span>
                        </div>
                        <h2 class="text-xl sm:text-2xl font-black text-white leading-snug">${note.title}</h2>
                    </div>

                    ${note.image ? `
                        <div class="rounded-2xl overflow-hidden border border-white/10 bg-black/50 flex justify-center">
                            <img src="${note.image}" alt="${note.title}" class="max-h-80 w-auto object-contain cursor-zoom-in" onclick="window.open('${note.image}', '_blank')">
                        </div>
                    ` : ''}

                    <!-- Khung nội dung áp dụng CSS tùy chỉnh của người dùng -->
                    <div class="p-5 rounded-2xl border border-white/10 leading-relaxed break-words" style="${inlineCss}">
                        ${formattedContent}
                    </div>
                </div>
            </div>
        `;
    }
}

// Hàm phụ trợ render danh sách tiêu đề (bổ sung nút Xóa trực tiếp trên từng dòng)
function renderTitlesListHTML(container, notesList, emptyMessage) {
    if (notesList.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl mb-3 text-gray-600">
                    <i class="fas fa-folder-open"></i>
                </div>
                <p class="text-xs max-w-xs leading-relaxed">${emptyMessage}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="space-y-2.5">
            ${notesList.map((n, idx) => `
                <div onclick="navigateNotesView('detail', '${n.tag}', ${n.id})" 
                     class="group p-4 rounded-2xl bg-white/[0.03] hover:bg-indigo-600/15 border ${n.pinned ? 'border-amber-500/40' : 'border-white/10 hover:border-indigo-500/50'} cursor-pointer transition-all duration-200 flex items-center justify-between gap-4">
                    
                    <div class="flex items-center gap-3.5 min-w-0">
                        <div class="w-9 h-9 rounded-xl ${n.pinned ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'} flex items-center justify-center font-bold text-xs shrink-0 transition">
                            ${n.pinned ? '<i class="fas fa-thumbtack"></i>' : (idx + 1)}
                        </div>
                        <div class="min-w-0">
                            <h4 class="text-sm font-bold text-white group-hover:text-indigo-200 truncate transition">
                                ${n.title}
                            </h4>
                            <div class="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                                <span><i class="far fa-calendar-alt mr-1"></i>${n.createdAt || 'Mới'}</span>
                                ${n.image ? '<span class="text-emerald-400"><i class="fas fa-image mr-1"></i>Có hình ảnh</span>' : ''}
                                ${n.style && n.style.customCss ? '<span class="text-purple-400"><i class="fas fa-code mr-1"></i>Custom CSS</span>' : ''}
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-1.5 shrink-0">
                        <button type="button" onclick="togglePinNote(${n.id}, event)" title="${n.pinned ? 'Bỏ ghim' : 'Ghim lên đầu'}" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-300 flex items-center justify-center transition">
                            <i class="fas fa-thumbtack text-xs"></i>
                        </button>
                        <button type="button" onclick="deleteClinicalNote(${n.id}, event)" title="Xóa ghi chú" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                        <div class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center transition">
                            <i class="fas fa-book-open text-xs"></i>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function copyNoteContentById(id) {
    const note = clinicalNotes.find(n => String(n.id) === String(id));
    if (!note) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    const plainText = `${note.title}\n\n${tempDiv.textContent || tempDiv.innerText || ''}`;
    copyNoteContent(plainText);
}
window.copyNoteContentById = copyNoteContentById;

function copyNoteContent(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                Swal.fire({ 
                    icon: 'success', 
                    title: 'Đã sao chép nội dung ghi chú!', 
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

// Hàm Xóa Ghi Chú đã được sửa lỗi z-index & so sánh ID an toàn
function deleteClinicalNote(id, event) {
    if (event) event.stopPropagation();

    const executeDelete = () => {
        const deletedNote = clinicalNotes.find(n => String(n.id) === String(id));
        clinicalNotes = clinicalNotes.filter(n => String(n.id) !== String(id));
        localStorage.setItem('clinicalNotes', JSON.stringify(clinicalNotes));
        
        // Nếu đang sửa đúng bài viết vừa xóa thì reset form
        const currentEditId = document.getElementById('note-edit-id')?.value;
        if (currentEditId && String(currentEditId) === String(id)) {
            resetNoteForm();
        }

        if (noteNavState.view === 'detail') {
            noteNavState.view = 'titles';
            noteNavState.selectedTopic = deletedNote ? deletedNote.tag : 'Bệnh Học';
        }
        renderNotesExplorer();
        triggerNiceSound();
    };

    if (window.Swal) {
        Swal.fire({
            title: 'Xóa ghi chú này?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy',
            background: '#111827',
            color: '#fff',
            customClass: { container: 'z-[9999]' }
        }).then((result) => {
            if (result.isConfirmed) {
                executeDelete();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Đã xóa ghi chú!',
                    showConfirmButton: false,
                    timer: 1500,
                    background: '#1e293b',
                    color: '#fff'
                });
            }
        });
    } else {
        executeDelete();
    }
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
        document.body.style.overflow = "hidden";
    }

    function closeSideMenu() {
        menuBar?.classList.remove("active");
        sideNav?.classList.remove("active");
        backdrop?.classList.remove("active");
        document.body.style.overflow = "";
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

    let touchStartX = 0;
    let touchEndX = 0;

    sideNav?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sideNav?.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
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
            showAnswer("Tìm kiếm tài liệu", "Bạn vui lòng nhấp vào biểu tượng kính lúp ở góc trên bên phải để mở công cụ tìm kiếm. Sau đó nhập từ khóa và xem kết quả.");
        } else if (action === 'q_password') {
            showAnswer("Tôi không có tài khoản", "Bạn chưa có tài khoản đăng nhập hoặc mật khẩu không đúng. Vui lòng liên hệ trực tiếp để được cấp lại tài khoản.");
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
                <i class="fas fa-question-circle text-xs"></i> <span>Câu hỏi thường gặp</span>
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

// --- CÔNG CỤ TÌM KIẾM NÂNG CAO ---
async function initAdvancedSearchEngine() {
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
                <p class="text-xs text-gray-400 mb-4 max-w-xs">Bạn cần đăng nhập tài khoản để tìm kiếm và xem kết quả.</p>
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

    let searchableContent = [
        {
            title: normalizeText('Trang Chủ'),
            description: 'Quay về trang chủ của website.',
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
            title: normalizeText('Hệ thống tính lãi suất'),
            description: 'Công cụ tính lãi suất.',
            url: '/hethong_laisuat.html',
            icon: 'fa-pen-to-square',
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
                        const linksRef = collection(db, 'artifacts', appId, 'public', 'data', 'links');
                        onSnapshot(linksRef, (snap) => {
                            searchableContent = searchableContent.filter(item => item.source !== 'firebase_links');

                            const firebaseLinks = snap.docs.map(doc => {
                                const data = doc.data();
                                return {
                                    title: normalizeText(data.title || 'Tài liệu lý thuyết'),
                                    description: `Chủ đề: ${data.topic || 'Y học'}`,
                                    keywords: `${data.title} ${data.subject} ${data.topic} tai lieu ly thuyet`.toLowerCase(),
                                    url: data.url || '#',
                                    icon: 'fa-book-open',
                                    category: data.subject || 'Tài Liệu',
                                    source: 'firebase_links'
                                };
                            });

                            searchableContent = [...searchableContent, ...firebaseLinks];
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