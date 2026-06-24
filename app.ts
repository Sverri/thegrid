import { TheGrid, ColumnType } from "./src/index";

const hostElement = document.getElementById("app");

const users = [];
for (let i = 1; i < 1001; i++) {
    users.push({ id: i, name: `User ${i}`, age: Math.floor(Math.random() * 100) });
}

const grid = new TheGrid(hostElement!, {
    data: users,
    columns: [
        { binding: "id", header: "Id", type: ColumnType.Text },
        { binding: "name", header: "Name" },
        { binding: "age", header: "Age" },
    ],
});

console.log(grid);
