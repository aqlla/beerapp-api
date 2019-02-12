import * as env from "dotenv";
import * as express from "express";
import * as path from "path";
import { Client } from "pg";
import * as proc from "process";
import ISqlColumn from "../models/ISqlColumn";

env.config();

const pg = new Client({
    host: proc.env.DB_HOST,
    database: proc.env.DB_NAME,
    user: proc.env.DB_USER
});
const app = express();
const port = 8080;
const fs: ISqlColumn[] = [
    {
        table: "beers",
        name: "name",
        type: "string"
    },
    {
        table: "beers",
        name: "style",
        type: "string"
    },
    {
        table: "breweries",
        name: "name",
        alias: "brewery_name",
        type: "string"
    },
    {
        table: "breweries",
        name: "city",
        type: "string"
    },
    {
        table: "breweries",
        name: "state",
        type: "string"
    },
    {
        table: "beers",
        name: "ibu",
        type: "number"
    },
    {
        table: "beers",
        name: "abv",
        type: "number"
    }
];

app.get("/", (req, res) =>
    res.render(path.join(__dirname + "../../client/index.html")));

app.get("/api/beer", async (req, res) => {
    try {
        await pg.connect();
        const data = await pg.query("select * from beers");
        if ("rows" in data) {
            res.send(data.rows);
        }
    } catch (e) {
        console.log(e);
    }
});

app.get("/api/s/:val", async (req, res) => {
    try {
        const maxResults: number = req.query.max || 250;
        const searchStr: number | string  = req.params.val;
        const select = fs.map((f) => `${f.table}.${f.name} ${f.alias ? `AS ${f.alias} ` : ``}`);
        const query = `SELECT ${select} FROM beers LEFT JOIN breweries ON breweries.id = beers.brewery_id WHERE `
            + (Number(searchStr)
                ? fs.filter((f) => f.type = "number")
                    .reduce((acc, f) => (acc ? `${acc} or ` : ``) + `${f.table}.${f.name} ilike '%${searchStr}%'`, "")
                : fs.filter((f) => f.type = "string")
                    .reduce((acc, f) => (acc ? `${acc} or ` : ``) + `${f.table}.${f.name} = ${searchStr}`, ""))
            + ` ORDER BY beers.name ASC `
            + ` LIMIT ${maxResults}`;
        console.log(query);
        const data = await pg.query(query);

        if ("rows" in data) {
            res.send(data.rows);
        } else {
            res.send(`there was a problem.`);
        }
    } catch (e) {
        res.send(e);
        console.log(e);
    }
});

app.get("/api/beer/:field/:val", async (req, res) => {
    const field = fs.find((f) => f.name = req.params.field);

    if (field) {
        try {
            const val = req.params.val.toLowerCase();
            const operator = field.type === "string" ? "ILIKE" : "=";
            const select = fs.map((f) => `${f.table}.${f.name} ${f.alias ? `AS ${f.alias} ` : ``}`);
            const where = `${field.table}.${field.name} ${operator} '%${val}%'`;
            const query = `SELECT ${select} FROM beers LEFT JOIN breweries ON breweries.id = beers.brewery_id WHERE ${where}`;
            const data = await pg.query(query);

            if ("rows" in data) {
                res.send(data.rows);
            }
        } catch (e) {
            res.send(e);
            console.error(e);
        }
    } else  {
        res.send(`${req.params.field} is not a valid search field`);
    }
});

app.listen(port, async (_) => {
    try {
        await pg.connect();
        console.log(`server started at http://localhost:${port}`);
    } catch (e) {
        console.error(e);
    }
});
