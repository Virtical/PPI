// ==================== ТЕСТОВЫЕ ДАННЫЕ ====================
const DEMO_TREE = {
    name: 'CarWashGo_Project',
    type: 'folder',
    children: [
        {
            name: 'app',
            type: 'folder',
            children: [
                { name: 'index.html', type: 'file' },
                { name: 'script.js', type: 'file' },
                { name: 'styles.css', type: 'file' }
            ]
        },
        {
            name: 'assets',
            type: 'folder',
            children: [
                { name: 'images', type: 'folder', children: [
                        { name: 'car_wash.jpg', type: 'file' },
                        { name: 'star.png', type: 'file' },
                        { name: 'location.png', type: 'file' }
                    ]},
                { name: 'logo.svg', type: 'file' }
            ]
        },
        {
            name: 'data',
            type: 'folder',
            children: [
                { name: 'services.json', type: 'file' },
                { name: 'clients.csv', type: 'file' }
            ]
        },
        {
            name: 'logs',
            type: 'folder',
            children: [
                { name: 'error.log', type: 'file' },
                { name: 'access.log', type: 'file' }
            ]
        },
        { name: 'README.md', type: 'file' },
        { name: 'config.json', type: 'file' }
    ]
};

// Генерация тестовых логов (если localStorage пуст)
function seedTestLogs() {
    const existing = localStorage.getItem('carwash_log');
    if (existing) return;

    const actions = [
        ['INFO', 'Пользователь: Страница загружена'],
        ['INFO', 'Пользователь: Добавил услугу "Полировка" (1200 ₽)'],
        ['INFO', 'Пользователь: Удалил услугу "Уборка салона"'],
        ['INFO', 'Пользователь: Открыл модальное окно выбора услуги'],
        ['INFO', 'Пользователь: Выбрал дату/время: 2026-04-25T10:00'],
        ['ERROR', 'Ошибка: Выберите услугу'],
        ['INFO', 'Пользователь: Успешная запись: 2026-04-25T10:00, услуги: Основная мойка, Полировка'],
        ['INFO', 'Пользователь: Нажал кнопку "Назад"'],
        ['ERROR', 'Ошибка: Дата не может быть в прошлом'],
        ['INFO', 'Пользователь: Скачал лог-файл'],
        ['INFO', 'Пользователь: Закрыл модальное окно кликом вне области'],
        ['INFO', 'Пользователь: Открыл админ-панель в новой вкладке']
    ];

    const logs = [];
    const now = Date.now();

    actions.forEach((action, index) => {
        const hoursAgo = (index * 2) % 24;
        const timestamp = new Date(now - hoursAgo * 60 * 60 * 1000 - index * 60000).toISOString();
        logs.push({
            timestamp,
            level: action[0],
            message: action[1],
            details: index % 3 === 0 ? 'демо-запись' : ''
        });
    });

    localStorage.setItem('carwash_log', JSON.stringify(logs));
}
seedTestLogs();

// ==================== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ====================
const tabs = document.querySelectorAll('.tab');
const panels = {
    tree: document.getElementById('treePanel'),
    stats: document.getElementById('statsPanel'),
    logs: document.getElementById('logsPanel')
};

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabName = tab.dataset.tab;
        Object.values(panels).forEach(p => p.classList.add('hidden'));
        panels[tabName].classList.remove('hidden');
        if (tabName === 'stats') drawStatistics();
        if (tabName === 'logs') displayLogs();
    });
});

// ==================== ДЕРЕВО ФАЙЛОВ ====================
function createTreeNode(node) {
    const li = document.createElement('li');
    li.classList.add(node.type);
    if (node.type === 'folder') {
        const toggle = document.createElement('span');
        toggle.classList.add('toggle');
        toggle.textContent = '▼';
        const span = document.createElement('span');
        span.textContent = node.name;
        li.appendChild(toggle);
        li.appendChild(span);
        if (node.children && node.children.length > 0) {
            const ul = document.createElement('ul');
            node.children.forEach(child => ul.appendChild(createTreeNode(child)));
            li.appendChild(ul);
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                ul.hidden = !ul.hidden;
                toggle.textContent = ul.hidden ? '▶' : '▼';
            });
        } else {
            toggle.style.visibility = 'hidden';
        }
    } else {
        li.textContent = node.name;
    }
    return li;
}

function renderTree(data) {
    const treeDiv = document.getElementById('fileTree');
    treeDiv.innerHTML = '';
    const ul = document.createElement('ul');
    ul.appendChild(createTreeNode(data));
    treeDiv.appendChild(ul);
}

renderTree(DEMO_TREE);

// ==================== РАБОТА С ЛОГАМИ ====================
const LOG_KEY = 'carwash_log';

function getLogs() {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
}

function displayLogs(filteredLogs = null) {
    const logs = filteredLogs || getLogs();
    const tbody = document.getElementById('logTableBody');
    const noMsg = document.getElementById('noLogsMsg');
    const table = document.getElementById('logTable');
    tbody.innerHTML = '';

    if (logs.length === 0) {
        noMsg.style.display = 'block';
        table.style.display = 'none';
    } else {
        noMsg.style.display = 'none';
        table.style.display = '';
        logs.forEach(log => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = new Date(log.timestamp).toLocaleString();
            const levelCell = row.insertCell(1);
            levelCell.textContent = log.level;
            levelCell.style.fontWeight = 'bold';
            levelCell.style.color = log.level === 'ERROR' ? 'red' : 'green';
            row.insertCell(2).textContent = log.message;
            row.insertCell(3).textContent = log.details || '';
        });
    }
}

function applyFilter() {
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    const levelFilter = document.getElementById('filterLevel').value;

    let logs = getLogs();

    // Фильтр по дате
    if (from && to) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        if (fromDate > toDate) {
            alert('Дата "С" не может быть позже "По"');
            return;
        }
        logs = logs.filter(log => {
            const t = new Date(log.timestamp);
            return t >= fromDate && t <= toDate;
        });
    }

    // Фильтр по уровню
    if (levelFilter !== 'ALL') {
        logs = logs.filter(log => log.level === levelFilter);
    }

    displayLogs(logs);
}

function resetFilter() {
    document.getElementById('filterFrom').value = '';
    document.getElementById('filterTo').value = '';
    document.getElementById('filterLevel').value = 'ALL';
    displayLogs(getLogs());
}

function downloadFilteredLogs() {
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    const levelFilter = document.getElementById('filterLevel').value;

    let logs = getLogs();

    if (from && to) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        logs = logs.filter(log => {
            const t = new Date(log.timestamp);
            return t >= fromDate && t <= toDate;
        });
    }

    if (levelFilter !== 'ALL') {
        logs = logs.filter(log => log.level === levelFilter);
    }

    const text = logs
        .map(e => `[${e.timestamp}] [${e.level}] ${e.message}` + (e.details ? ` | ${e.details}` : ''))
        .join('\n') || 'Нет записей за указанный период.\n';

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `log_filtered_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearAllLogs() {
    if (confirm('Удалить все демо-логи безвозвратно?')) {
        localStorage.removeItem(LOG_KEY);
        displayLogs([]);
        drawStatistics();
    }
}

document.getElementById('applyFilterBtn').addEventListener('click', applyFilter);
document.getElementById('resetFilterBtn').addEventListener('click', resetFilter);
document.getElementById('downloadFilteredBtn').addEventListener('click', downloadFilteredLogs);
document.getElementById('clearLogsBtn').addEventListener('click', clearAllLogs);

// ==================== СТАТИСТИКА ====================
function drawStatistics() {
    const logs = getLogs();
    const now = new Date();
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentLogs = logs.filter(log => new Date(log.timestamp) >= since);

    document.getElementById('totalActions').textContent = recentLogs.length;
    document.getElementById('infoActions').textContent = recentLogs.filter(l => l.level === 'INFO').length;
    document.getElementById('errorActions').textContent = recentLogs.filter(l => l.level === 'ERROR').length;

    drawChart(recentLogs);
}

function drawChart(logs) {
    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const now = new Date();
    const hours = Array(24).fill(0).map(() => ({ info: 0, error: 0 }));
    logs.forEach(log => {
        const date = new Date(log.timestamp);
        const hourDiff = Math.floor((now - date) / (1000 * 60 * 60));
        if (hourDiff >= 0 && hourDiff < 24) {
            const idx = 23 - hourDiff;
            if (log.level === 'ERROR') hours[idx].error++;
            else hours[idx].info++;
        }
    });

    const maxVal = Math.max(1, ...hours.map(h => h.info + h.error));
    const barWidth = (width - 80) / 24;  // больше отступ слева
    const chartBottom = height - 30;
    const chartLeft = 60;  // больше места для подписей Y

    // Сетка Y
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const y = chartBottom - (i / 5) * (chartBottom - 20);
        ctx.beginPath();
        ctx.moveTo(chartLeft - 5, y);
        ctx.lineTo(width - 30, y);
        ctx.stroke();
        ctx.fillText(Math.round(maxVal * i / 5), chartLeft - 10, y + 3);
    }

    // Подписи X
    ctx.textAlign = 'center';
    for (let i = 0; i < 24; i += 3) {
        const x = chartLeft + i * barWidth + barWidth / 2;
        const hourLabel = (23 - i) % 24;
        ctx.fillText(hourLabel + ':00', x, chartBottom + 15);
    }

    // Столбцы
    for (let i = 0; i < 24; i++) {
        const total = hours[i].info + hours[i].error;
        if (total === 0) continue;
        const barHeight = (total / maxVal) * (chartBottom - 20);
        const x = chartLeft + i * barWidth;
        const y = chartBottom - barHeight;

        const errorH = (hours[i].error / total) * barHeight;
        const infoH = barHeight - errorH;

        if (infoH > 0) {
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(x + 1, y, barWidth - 2, infoH);
        }
        if (errorH > 0) {
            ctx.fillStyle = '#f44336';
            ctx.fillRect(x + 1, y + infoH, barWidth - 2, errorH);
        }
    }
}

// Инициализация
panels.stats.classList.add('hidden');
panels.logs.classList.add('hidden');
displayLogs();