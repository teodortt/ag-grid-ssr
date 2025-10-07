const express = require('express');

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const PORT = 3001;

const users = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 18 + (i % 40),
}));

app.get('/api/users', (req, res) => {
    console.log('Query params:', req.query);

    let { page = 0, pageSize = 20, sortField, sortOrder } = req.query;
    page = parseInt(page);
    pageSize = parseInt(pageSize);

    let data = [...users];

    // Филтриране - ПОПРАВКА ТУК
    // Търсим filter_name, filter_id, filter_age вместо filter[name]
    if (req.query.filter_name) {
        const search = req.query.filter_name.toLowerCase();
        const filterType = req.query.filterType_name || 'contains';
        console.log('Filtering by name:', search, 'type:', filterType);

        if (filterType === 'contains') {
            data = data.filter((u) => u.name.toLowerCase().includes(search));
        } else if (filterType === 'equals') {
            data = data.filter((u) => u.name.toLowerCase() === search);
        } else if (filterType === 'startsWith') {
            data = data.filter((u) => u.name.toLowerCase().startsWith(search));
        } else if (filterType === 'endsWith') {
            data = data.filter((u) => u.name.toLowerCase().endsWith(search));
        }
    }

    if (req.query.filter_id) {
        const id = parseInt(req.query.filter_id);
        const filterType = req.query.filterType_id || 'equals';
        console.log('Filtering by id:', id, 'type:', filterType);

        if (filterType === 'equals') {
            data = data.filter((u) => u.id === id);
        } else if (filterType === 'notEqual') {
            data = data.filter((u) => u.id !== id);
        } else if (filterType === 'lessThan') {
            data = data.filter((u) => u.id < id);
        } else if (filterType === 'greaterThan') {
            data = data.filter((u) => u.id > id);
        }
    }

    if (req.query.filter_age) {
        const age = parseInt(req.query.filter_age);
        const filterType = req.query.filterType_age || 'equals';
        console.log('Filtering by age:', age, 'type:', filterType);

        if (filterType === 'equals') {
            data = data.filter((u) => u.age === age);
        } else if (filterType === 'notEqual') {
            data = data.filter((u) => u.age !== age);
        } else if (filterType === 'lessThan') {
            data = data.filter((u) => u.age < age);
        } else if (filterType === 'greaterThan') {
            data = data.filter((u) => u.age > age);
        }
    }

    // Сортиране
    if (sortField && sortOrder) {
        console.log('Sorting by:', sortField, sortOrder);
        data.sort((a, b) => {
            if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const total = data.length;
    const start = page * pageSize;
    const end = start + pageSize;
    const pagedData = data.slice(start, end);

    console.log(`Returning ${pagedData.length} rows out of ${total} total`);

    res.json({
        rows: pagedData,
        total,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
