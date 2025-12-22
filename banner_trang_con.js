        function resolveArticleData(url){

            for(const k of Object.keys(dataStore)){
                const f = dataStore[k].articles.find(a => a.url === url);
                if(f){
                    // clone để không sửa dataStore gốc
                    return { title: f.title, imageUrl: DEFAULT_IMAGE };
                }
            }

            return { title: `Không tìm thấy tiêu đề (${url})`, imageUrl: DEFAULT_IMAGE };
        }

        function createArticleBox(targetUrl, container, index){
            const data = resolveArticleData(targetUrl);
            const box = document.createElement('a');
            box.href = targetUrl || '#';
            box.className = 'article-card transition-observer';
            box.style.transitionDelay = `${index * 50}ms`;

            let categoryKey = 'tab_1';
            for(const k of Object.keys(dataStore)){
                if(dataStore[k].articles.some(a => a.url === targetUrl)){
                    categoryKey = k;
                    box.dataset.cat = k;
                    break;
                }
            }

            box.innerHTML = `
                <div class="image-wrapper" aria-hidden="true">
                    <img class="article-image" src="${DEFAULT_IMAGE}" alt="${data.title}" onerror="this.style.display='none'"/>
                </div>
                <div class="content-area">
                    <span class="tag-pill">${dataStore[categoryKey].name}</span>
                    <p class="article-title">${data.title}</p>
                </div>
            `;
            container.appendChild(box);
            observer.observe(box);
        }

        function renderCategories(){
            const tabs = document.getElementById('category-tabs');
            if(!tabs) return;
            tabs.innerHTML = '';
            let tabIndex = 1;
            Object.keys(dataStore).forEach(key => {
                const btn = document.createElement('button');
                btn.id = `tab_${tabIndex++}`;
                btn.className = 'category-btn';
                btn.dataset.key = key;

                const colorData = categoryColors[key] || {bg:'linear-gradient(90deg,#374151,#4b5563)', activeColor:'#fff', inactiveColor:'#94a3b8'};

                if(key === currentCategory){
                    btn.classList.remove('inactive');
                    btn.classList.add('active');
                    btn.style.background = colorData.bg;
                    btn.style.color = colorData.activeColor;
                    btn.innerHTML = `<span class="category-name-span" style="color: ${colorData.activeColor};">${dataStore[key].name}</span>
                                     <span class="category-count-span"> (${dataStore[key].articles.length})</span>`;
                } else {
                    btn.classList.remove('active');
                    btn.classList.add('inactive');
                    btn.innerHTML = `<span class="category-name-span" style="color: ${colorData.inactiveColor};">${dataStore[key].name}</span>
                                     <span class="category-count-span"> (${dataStore[key].articles.length})</span>`;
                }

                btn.onclick = () => {
                    if(key === currentCategory) return;
                    currentCategory = key;
                    renderCategories();
                    renderArticles(); // show all trong category
                    // scroll tab into view for better UX on mobile:
                    btn.scrollIntoView({behavior:'smooth', inline:'center'});
                };
                tabs.appendChild(btn);
            });
        }

        // Render tất cả bài viết của category hiện tại (KHÔNG phân trang, KHÔNG xáo trộn)
        function renderArticles(){
            const container = document.getElementById('articles-container');
            const section = document.getElementById('articles-section');
            if(!container || !section) return;

            Array.from(container.children).forEach(c => observer.unobserve(c));
            container.innerHTML = '';

            const links = (dataStore[currentCategory]?.articles) || [];
            if(links.length === 0){
                const empty = document.createElement('div');
                empty.className = 'empty-state-box';
                empty.innerHTML = `<p>Không tìm thấy bài viết nào trong danh mục <strong>${dataStore[currentCategory]?.name || ''}</strong>.</p>`;
                container.appendChild(empty);
                return;
            }

            links.forEach((a, i) => createArticleBox(a.url, container, i));
            // điều chỉnh padding nếu cần
            section.style.paddingBottom = '4rem';
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderCategories();
            renderArticles();
            // resize debounce để observe lại nếu cần
            window.addEventListener('resize', () => {
                clearTimeout(window._rt);
                window._rt = setTimeout(() => {
                    document.querySelectorAll('.article-card').forEach(el => observer.observe(el));
                }, 120);
            });
        });