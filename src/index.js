const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const routes = require('./routes');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
routes(app);

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'letuananh',
    password: process.env.DB_PASSWORD || 'Lt@19052003',
    database: process.env.DB_NAME || 'ShareVid',
});

db.connect(err => {
    if (err) {
        console.error('Lỗi kết nối đến cơ sở dữ liệu:', err);
        return;
    }
    console.log('Kết nối đến cơ sở dữ liệu MySQL thành công!');
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/accounts', (req, res) => {
    db.query('SELECT * FROM account', (err, results) => {
        if (err) {
            console.error('Có lỗi xảy ra khi truy vấn dữ liệu:', err);
            return res.status(500).send('Có lỗi xảy ra khi truy vấn dữ liệu.');
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server đang chạy trong cổng: ${port}`);
});