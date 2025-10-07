const express = require('express');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    res.header("Cache-Control", "no-store, no-cache, must-revalidate, private");
    next();
});

const PORT = 3001;

let users = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 18 + (i % 40),
}));

// GET endpoint (същия като преди)
app.get('/api/users', (req, res) => {
    try {
        console.log('Query params:', req.query);

        let { page = 0, pageSize = 20, sortField, sortOrder } = req.query;
        page = parseInt(page);
        pageSize = parseInt(pageSize);

        let data = [...users];

        if (req.query.filter_name) {
            const search = req.query.filter_name.toLowerCase();
            const filterType = req.query.filterType_name || 'contains';

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

        if (sortField && sortOrder) {
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

        res.setHeader('Content-Type', 'application/json');
        res.json({ rows: pagedData, total });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH endpoint за inline editing
app.patch('/api/users/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { field, value } = req.body;

        console.log(`Updating user ${userId}, field: ${field}, value: ${value}`);

        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Валидация
        if (field === 'age') {
            const age = parseInt(value);
            if (isNaN(age) || age < 0 || age > 120) {
                return res.status(400).json({ error: 'Invalid age value' });
            }
            users[userIndex].age = age;
        } else if (field === 'name') {
            if (!value || value.trim() === '') {
                return res.status(400).json({ error: 'Name cannot be empty' });
            }
            users[userIndex].name = value.trim();
        } else {
            return res.status(400).json({ error: 'Invalid field' });
        }

        console.log('Updated user:', users[userIndex]);

        res.json({
            success: true,
            user: users[userIndex]
        });

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
