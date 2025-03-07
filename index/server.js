const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Создание или открытие базы данных
let db = new sqlite3.Database('./names.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Подключено к базе данных SQLite');
});

// Создание таблицы, если она не существует
db.run('CREATE TABLE IF NOT EXISTS participants (id INTEGER PRIMARY KEY, name TEXT)');

// Настройка парсинга тела запроса
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Отправка формы с именем
app.post('/submit', (req, res) => {
    const { name } = req.body;

    // Добавление имени в базу данных
    db.run('INSERT INTO participants (name) VALUES (?)', [name], function(err) {
        if (err) {
            return console.log(err.message);
        }
        res.redirect('/');
    });
});

// Получение всех имен участников
app.get('/', (req, res) => {
    db.all('SELECT name FROM participants', [], (err, rows) => {
        if (err) {
            throw err;
        }

        // Отправляем имена в HTML
        let namesList = rows.map(row => `<li>${row.name}</li>`).join('');
        res.send(`
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Приглашение в кинорум 10Д класса</title>
                <style>
                    body {
                        font-family: 'Segoe Print', cursive, sans-serif;
                        background-color: #fce4ec;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 80%;
                        max-width: 600px;
                        margin: 50px auto;
                        background-color: #fff;
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                        text-align: center;
                        font-size: 18px;
                        color: #333;
                    }
                    .button {
                        padding: 12px 30px;
                        background-color: #f06292;
                        color: white;
                        text-decoration: none;
                        border-radius: 30px;
                        font-size: 18px;
                        font-weight: bold;
                    }
                    .name-list {
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Дорогие одноклассницы!</h1>
                    <p>Введите ваше имя, чтобы подтвердить участие:</p>
                    <form action="/submit" method="POST">
                        <input type="text" name="name" required>
                        <input type="submit" value="Подтвердить участие" class="button">
                    </form>

                    <div class="name-list">
                        <h2>Участники:</h2>
                        <ul>${namesList}</ul>
                    </div>
                </div>
            </body>
            </html>
        `);
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
