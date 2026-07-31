// مصفوفة الألعاب (تجلب من التخزين المحلي أو مصفوفة فارغة)
let games = JSON.parse(localStorage.getItem('myGames')) || [];

// دالة التبديل بين الصفحات
function switchPage(pageId, element) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    element.classList.add('active');
    
    renderData();
}

// نوافذ إضافة اللعبة
function openModal() { document.getElementById('game-modal').style.display = 'flex'; }
function closeModal() { document.getElementById('game-modal').style.display = 'none'; }

function toggleFormFields() {
    const status = document.getElementById('game-status').value;
    document.getElementById('upcoming-fields').style.display = status === 'upcoming' ? 'block' : 'none';
    document.getElementById('completed-fields').style.display = status === 'completed' ? 'block' : 'none';
    document.getElementById('wishlist-fields').style.display = status === 'wishlist' ? 'block' : 'none';
}

// حفظ البيانات في LocalStorage
function saveGames() {
    localStorage.setItem('myGames', JSON.stringify(games));
    renderData();
}

// تحويل التاريخ للميلادي والهجري
function formatDates(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const gregorian = new Intl.DateTimeFormat('ar-SA').format(date);
    const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
    return `${gregorian} م | ${hijri} هـ`;
}

// إضافة لعبة جديدة
document.getElementById('add-game-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newGame = {
        id: Date.now(),
        status: document.getElementById('game-status').value,
        title: document.getElementById('game-title').value,
        cover: document.getElementById('game-cover').value,
        genre: document.getElementById('game-genre').value,
        platforms: document.getElementById('game-platforms').value,
        releaseDate: document.getElementById('game-release-date').value,
        playtime: document.getElementById('game-playtime').value,
        rating: document.getElementById('game-rating').value,
        comment: document.getElementById('game-comment').value,
        completedDate: document.getElementById('game-completed-date').value,
        priority: document.getElementById('game-priority').value
    };

    games.push(newGame);
    saveGames();
    closeModal();
    this.reset();
});

// حذف لعبة
function deleteGame(id) {
    if (confirm("هل أنت متأكد من حذف هذه اللعبة؟")) {
        games = games.filter(g => g.id !== id);
        saveGames();
    }
}

// تحديث العداد التنازلي
function updateCountdowns() {
    document.querySelectorAll('.countdown-timer').forEach(el => {
        const target = new Date(el.dataset.date).getTime();
        const now = new Date().getTime();
        const distance = target - now;

        if (distance < 0) {
            el.innerHTML = "تم الإصدار!";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        el.innerHTML = `باقي: ${days} يوم و ${hours} ساعة`;
    });
}
setInterval(updateCountdowns, 60000); // تحديث كل دقيقة

// عرض البيانات في الواجهة
function renderData() {
    const upcomingGrid = document.getElementById('upcoming-grid');
    const completedGrid = document.getElementById('completed-grid');
    const wishlistGrid = document.getElementById('wishlist-grid');

    upcomingGrid.innerHTML = ''; completedGrid.innerHTML = ''; wishlistGrid.innerHTML = '';

    // ترتيب الألعاب القادمة حسب الأقرب
    const upcomingGames = games.filter(g => g.status === 'upcoming').sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
    
    upcomingGames.forEach(g => {
        upcomingGrid.innerHTML += `
            <div class="game-card">
                <button class="delete-btn" onclick="deleteGame(${g.id})"><i class="fas fa-trash"></i></button>
                <img src="${g.cover}" alt="غلاف">
                <div class="game-info">
                    <div class="game-title">${g.title}</div>
                    <p style="font-size:12px; color:#aaa;">${formatDates(g.releaseDate)}</p>
                    <div class="countdown countdown-timer" data-date="${g.releaseDate}">جاري الحساب...</div>
                    <div style="margin-top:10px;">
                        <span class="badge">${g.platforms}</span>
                        <span class="badge" style="background:#555;">${g.genre}</span>
                    </div>
                </div>
            </div>`;
    });

    // الألعاب المختومة
    games.filter(g => g.status === 'completed').forEach(g => {
        completedGrid.innerHTML += `
            <div class="game-card">
                <button class="delete-btn" onclick="deleteGame(${g.id})"><i class="fas fa-trash"></i></button>
                <img src="${g.cover}" alt="غلاف">
                <div class="game-info">
                    <div class="game-title">${g.title} <span style="color:gold;">⭐ ${g.rating}/10</span></div>
                    <p style="font-size:12px; color:#aaa;">التختيم: ${formatDates(g.completedDate)} | ${g.playtime} ساعة</p>
                    <p style="margin-top:10px; font-size:14px;">"${g.comment}"</p>
                </div>
            </div>`;
    });

    // قائمة الانتظار
    games.filter(g => g.status === 'wishlist').forEach(g => {
        wishlistGrid.innerHTML += `
            <div class="game-card">
                <button class="delete-btn" onclick="deleteGame(${g.id})"><i class="fas fa-trash"></i></button>
                <img src="${g.cover}" alt="غلاف">
                <div class="game-info">
                    <div class="game-title">${g.title}</div>
                    <p style="color:var(--primary-color); font-weight:bold; margin-top:5px;">الأولوية: ${g.priority}</p>
                </div>
            </div>`;
    });

    updateCountdowns();
    calculateStats();
}

// حساب الإحصائيات
function calculateStats() {
    const completed = games.filter(g => g.status === 'completed');
    const totalPlaytime = completed.reduce((sum, g) => sum + (parseInt(g.playtime) || 0), 0);
    
    document.getElementById('stats-container').innerHTML = `
        <div class="stat-box">
            <h3>عدد الألعاب المختومة</h3>
            <p>${completed.length}</p>
        </div>
        <div class="stat-box">
            <h3>إجمالي ساعات اللعب</h3>
            <p>${totalPlaytime} ساعة</p>
        </div>
    `;
}

// تشغيل العرض عند تحميل الصفحة
window.onload = renderData;
