document.addEventListener('DOMContentLoaded', () => {

    // Đọc khóa kỹ thuật từ tiêu đề phụ
    const subTitleElement = document.querySelector('.sub-title');
    const techniqueKey = subTitleElement ? subTitleElement.getAttribute('data-technique') : 'thong_dam';

    // Dữ liệu Chỉ định và Chống chỉ định của thong_dam
    const thong_dam_chiDinh = [
        "Xẹp phân thuỳ Phổi",
        "Tống đàm và dịch tiết đường thở",
        "Tổn thương Phổi một bên",
        "Tình trạng cơ thể ít vận động."
    ];

    const thong_dam_chongChiDinh = [
        "Tràn khí màng Phổi mà chưa đặt ống sonde mở thông lồng ngực (chống chỉ định tuyệt đối).",
        "Lồng ngực bị xẹp, xẹp phổi hoàn toàn",
        "Chấn thương đầu cổ không ổn định",
        "Ho ra máu kèm chảy máu Phổi, đang xuất huyết và rối loạn huyết động",
        "Thuyên tắc Phổi",
        "Suy tim nặng, choáng, nhồi máu cơ tim cấp, loạn nhịp nặng",
        "Tình trạng tuần hoàn không ổn định.",
        "Hen phế quản cấp",
        "Gãy nhiều xương sườn, dập Phổi, mảng sườn di động.",
        "Mủ màng Phổi kèm dò Phổi (mạch lươn)",
        "Tăng áp lực nội sọ sau phẫu thuật thần kinh",
        "Chấn thương tuỷ sống, chấn thương cột sống chưa được mổ cố định"
    ];

    // Dữ liệu cho các kỹ thuật khác nhau
    const data = {
        thong_dam: {
            mucDich: [
                "Thải bỏ đàm nhớt",
                "Thông thoáng đường thở",
                "Tránh nguy cơ nhiễm trùng và hội chứng tắc nghẽn",
                "Hỗ trợ việc điều trị nội khoa tốt hơn."
            ],
            chiDinh: thong_dam_chiDinh,
            chongChiDinh: thong_dam_chongChiDinh
        },

        thong_khi: {
            mucDich: [
                "Tăng cường thể tích và phân bố không khí trong phổi.",
                "Cải thiện trao đổi oxy và loại bỏ CO2.",
                "Hỗ trợ cai máy thở hoặc phục hồi chức năng sau phẫu thuật."
            ],
            chiDinh: thong_dam_chiDinh,
            chongChiDinh: thong_dam_chongChiDinh
        }
    };

    const currentData = data[techniqueKey] || data['thong_dam'];

    // Hàm tạo danh sách ul
    const createListHTML = (items) => {
        if (!items || items.length === 0) return 'Thông tin đang được cập nhật.';
        const listItems = items
            .map(item => `<li style="margin-bottom: 0.25rem; color: #374151; list-style: none;">${item}</li>`)
            .join('');
        
        return `<ul style="padding-left: 0; margin-left: 0;">${listItems}</ul>`;
    };
    // Điền nội dung
    const mucDichElement = document.getElementById('mucDichContent');
    const chiDinhElement = document.getElementById('chiDinhContent');
    const chongChiDinhElement = document.getElementById('chongChiDinhContent');

    if (mucDichElement) mucDichElement.innerHTML = createListHTML(currentData.mucDich);
    if (chiDinhElement) chiDinhElement.innerHTML = createListHTML(currentData.chiDinh);
    if (chongChiDinhElement) chongChiDinhElement.innerHTML = createListHTML(currentData.chongChiDinh);
});


// Thu gọn / mở rộng phân thùy
function toggleSegment(segmentId) {
    const content = document.getElementById(segmentId);
    const icon = document.getElementById('icon-' + segmentId);
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    } else {
        document.querySelectorAll('.segment-content').forEach(c => {
            if (c.id !== segmentId && c.classList.contains('expanded')) {
                c.classList.remove('expanded');
                const otherIcon = document.getElementById('icon-' + c.id);
                otherIcon.classList.remove('fa-chevron-up');
                otherIcon.classList.add('fa-chevron-down');
            }
        });

        content.classList.add('expanded');
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    }
}

// Khởi tạo: đóng tất cả segment khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    const segments = document.querySelectorAll('.segment-content');
    segments.forEach(content => {
        content.classList.remove('expanded');
        
        const segmentId = content.id;
        const icon = document.getElementById('icon-' + segmentId);
        if (icon) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    });
});
