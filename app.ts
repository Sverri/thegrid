import "normalize.css";
import { TheGrid, ColumnType } from "./src/index";

const hostElement = document.querySelector<HTMLDivElement>(".grid");

interface User {
    id: number;
    name?: string;
    age?: number;
    dob?: Date;
    salary?: number;
    email?: string;
    website?: string;
    postcode?: number;
    country?: string;
    telprefix?: number;
    telephone?: number;
    faxprefix?: number;
    faxephone?: number;
    subscribed?: boolean;
    summary?: string;
    note?: string;
    children?: number;
}

const users: User[] = [];
for (let i = 0; i < 1000; i++) {
    users.push({
        id: i,
        name: `User ${i}`,
        age: Math.floor(Math.random() * 100),
        dob: new Date(),
        salary: Math.floor(Math.random() * 100000),
        email: "test@test.test",
        website: "http://google.com/",
        postcode: Math.floor(Math.random() * 10000),
        country: "Greenland",
        telprefix: Math.floor(Math.random() * 100),
        telephone: Math.floor(Math.random() * 100000000),
        faxprefix: Math.floor(Math.random() * 100),
        faxephone: Math.floor(Math.random() * 100000000),
        subscribed: Math.random() > 0.5,
        summary: "This is a summary of something and contains more text so the text breaks.",
        note: "This is a note",
        children: Math.floor(Math.random() * 100),
    });
}

const grid = new TheGrid<User>(hostElement!, {
    data: users,
    size: "full",
    columns: [
        { binding: "id", header: "Id", width: 100, dataType: ColumnType.Text, visible: false },
        { binding: "name", header: "Name", width: 200, dataType: ColumnType.String },
        { binding: "age", header: "Age", width: 100, dataType: ColumnType.Integer },
        { binding: "dob", header: "Date of birth", width: 400, dataType: ColumnType.Date },
        { binding: "salary", header: "Salary", width: 150, dataType: ColumnType.Decimal },
        { binding: "email", header: "Email address", width: 300, dataType: ColumnType.Email },
        { binding: "website", header: "Website", width: 300, dataType: ColumnType.URL },
        { binding: "postcode", header: "Post code", width: 150, dataType: ColumnType.Integer },
        { binding: "country", header: "Country", width: 250 },
        { binding: "telprefix", header: "Tel. prefix", width: 100, dataType: ColumnType.Integer },
        { binding: "telephone", header: "Telephone", width: 175, dataType: ColumnType.Integer },
        { binding: "faxprefix", header: "Tel. prefix", width: 100, dataType: ColumnType.Integer },
        { binding: "faxephone", header: "Telephone", width: 175, dataType: ColumnType.Integer },
        { binding: "subscribed", header: "Subscribed", width: 100, dataType: ColumnType.Boolean },
        { binding: "summary", header: "Summary", width: 400, dataType: ColumnType.Text },
        { binding: "note", header: "Note", width: 300, dataType: ColumnType.Text },
        { binding: "children", header: "Children", width: 100, dataType: ColumnType.Integer },
    ],
});

// console.log(grid);
