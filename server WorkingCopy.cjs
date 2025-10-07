const express = require('express');

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const PORT = 3001;

// Фалшиви данни
const users = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 18 + (i % 40),
}));

// GET /api/users?page=...&pageSize=...&sortField=...&sortOrder=...&filter[name]=...
app.get('/api/users', (req, res) => {
    let { page = 0, pageSize = 20, sortField, sortOrder } = req.query;
    page = parseInt(page);
    pageSize = parseInt(pageSize);

    let data = [...users];

    // Филтриране
    if (req.query['filter[name]']) {
        const search = req.query['filter[name]'].toLowerCase();
        data = data.filter((u) => u.name.toLowerCase().includes(search));
    }
    if (req.query['filter[age]']) {
        const age = parseInt(req.query['filter[age]']);
        data = data.filter((u) => u.age === age);
    }

    // Сортиране
    if (sortField && sortOrder) {
        data.sort((a, b) => {
            if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Пагинация
    const total = data.length;
    const start = page * pageSize;
    const pagedData = data.slice(start, start + pageSize);

    res.json({
        rows: pagedData,
        total,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
