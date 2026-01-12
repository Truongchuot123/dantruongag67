    /**
     * Tự động tạo ID cho các thẻ thuốc dựa trên tên thuốc
     */
    function generateAutoIDs() {
        const drugElements = document.querySelectorAll('.drug-name_duocly');
        
        drugElements.forEach(el => {
            // Lấy text, chuyển thường, bỏ dấu, thay khoảng trắng thành gạch ngang
            let text = el.innerText.trim();
            let autoID = 'drug-' + text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
                .replace(/[^\w\s]/gi, '')       // Bỏ ký tự đặc biệt
                .replace(/\s+/g, '-');          // Thay khoảng trắng thành gạch ngang
            
            el.id = autoID;
            
            // Console log để bạn kiểm tra ID đã tạo
            console.log(`Generated ID: ${autoID}`);
        });
    }

    // Xử lý lỗi ảnh
    function handleImageErrors() {
        document.querySelectorAll('img').forEach(img => {
            img.onerror = function() {
                this.src = 'https://via.placeholder.com/400x200/1e293b/60a5fa?text=Ảnh+Dược+Phẩm';
            };
        });
    }

    // Chạy khi trang load xong
    window.onload = function() {
        generateAutoIDs();
        handleImageErrors();
    };