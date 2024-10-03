import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import ejs from "ejs";
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
    { id: 1, title: "Buy milk" },
    { id: 2, title: "Finish homework" },
];

async function getAllItems() {
    let items = await db.query("SELECT * FROM items;");
    return items.rows;
}

app.get("/", async (req, res) => {
    let items = await getAllItems();
    res.render("index.ejs", {
        listTitle: "Today",
        listItems: items,
    });
});

app.post("/add", async (req, res) => {
    if (req.body.newItem.length) {
        const item = req.body.newItem;
        await db.query("INSERT INTO items (title) VALUES ($1);", [item]);
    }
    res.redirect("/");
});

app.post("/edit", async (req, res) => {
    try {
        await db.query("UPDATE items SET title = $1 WHERE id = $2;", [req.body.updatedItemTitle, req.body.updatedItemId]);
        res.redirect("/");
    } catch (error) {
        console.log(error)
    }
    console.log(req.body);
});

app.post("/delete", async (req, res) => {
    await db.query("DELETE FROM items WHERE id = $1;", [req.body.deleteItemId]);
    res.redirect("/");
    console.log(req.body);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
