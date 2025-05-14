const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cors = require('cors');
const routes = require('./routes');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Cấu hình CORS
app.use(cors());

// Middleware để xử lý JSON và URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối đến cơ sở dữ liệu MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Kiểm tra kết nối cơ sở dữ liệu
db.connect(err => {
    if (err) {
        console.error('Lỗi kết nối đến cơ sở dữ liệu:', err);
        return;
    }
    console.log('Kết nối đến cơ sở dữ liệu MySQL thành công!');
});

// Định nghĩa các route
routes(app);

// Route chính
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy trên cổng: ${port}`);
});