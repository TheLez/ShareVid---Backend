const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const routes = require('./routes');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Nếu bạn cần xử lý form data
routes(app);

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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

app.listen(port, () => {
    console.log(`Server đang chạy trong cổng: ${port}`);
});