const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json());

app.use(function (req, res, next) {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, "public")));

function readItems() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeItems(items) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf8");
}

const REQUIRED = {
    title: "строка, название на русском",
    titleEn: "строка, оригинальное название",
    year: "целое число",
    genre: "строка, жанр",
    director: "строка, режиссёр",
    duration: "целое число минут, больше нуля",
    released: "true или false"
};

function validate(item) {
    const problems = [];

    for (const field in REQUIRED) {
        if (!(field in item)) {
            problems.push(`Отсутствует поле ${field}: ${REQUIRED[field]}`);
        }
    }

    if (problems.length > 0) {
        return problems;
    }

    if (typeof item.title !== "string" || item.title.trim() === "") {
        problems.push("Поле title должно быть непустой строкой");
    }

    if (typeof item.titleEn !== "string" || item.titleEn.trim() === "") {
        problems.push("Поле titleEn должно быть непустой строкой");
    }

    if (typeof item.genre !== "string" || item.genre.trim() === "") {
        problems.push("Поле genre должно быть непустой строкой");
    }

    if (typeof item.director !== "string" || item.director.trim() === "") {
        problems.push("Поле director должно быть непустой строкой");
    }

    if (!Number.isInteger(item.year) || item.year < 1900 || item.year > 2100) {
        problems.push("Поле year должно быть целым числом от 1900 до 2100");
    }

    if (!Number.isInteger(item.duration) || item.duration <= 0) {
        problems.push("Поле duration должно быть целым числом больше нуля");
    }

    if (typeof item.released !== "boolean") {
        problems.push("Поле released должно быть true или false");
    }

    return problems;
}

app.get("/api/items", function (req, res) {
    try {
        let items = readItems();

        if (req.query.genre) {
            items = items.filter(function (item) {
                return item.genre === req.query.genre;
            });
        }

        res.json(items);
    } catch (err) {
        res.status(500).json({
            error: "Не удалось прочитать данные"
        });
    }
});

app.get("/api/items/:id", function (req, res) {
    try {
        const id = Number(req.params.id);
        const item = readItems().find(function (x) {
            return x.id === id;
        });

        if (!item) {
            return res.status(404).json({
                error: "Запись не найдена"
            });
        }

        res.json(item);
    } catch (err) {
        res.status(500).json({
            error: "Не удалось прочитать данные"
        });
    }
});

app.post("/api/items", function (req, res) {
    const newItem = req.body;

    if (!newItem || Object.keys(newItem).length === 0) {
        return res.status(400).json({
            error: "Тело запроса не является корректным JSON"
        });
    }

    const problems = validate(newItem);

    if (problems.length > 0) {
        return res.status(400).json({
            error: "Данные заполнены неверно",
            problems: problems
        });
    }

    try {
        const items = readItems();

        const maxId = items.reduce(function (max, item) {
            return item.id > max ? item.id : max;
        }, 0);

        newItem.id = maxId + 1;

        items.push(newItem);
        writeItems(items);

        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({
            error: "Не удалось сохранить"
        });
    }
});

app.use(function (req, res) {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({
            error: "Маршрут не найден"
        });
    }

    res.status(404).sendFile(
        path.join(__dirname, "public", "404.html")
    );
});

app.listen(PORT, function () {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});

