import "normalize.css";
import { TheGrid, ColumnType } from "./src/index";
import { faker } from "@faker-js/faker";
import { Range } from "@/shared/range";

const hostElement = document.querySelector<HTMLDivElement>(".grid");

interface User {
    id: number;
    name?: string;
    age?: number;
    dob?: Date;
    salary?: number;
    email?: string;
    website?: string;
    postcode?: string;
    country?: string;
    telephone?: string;
    faxephone?: string;
    subscribed?: boolean;
    summary?: string;
    note?: string;
    children?: number;
}

const users: User[] = [];
for (let i = 0; i < 1000; i++) {
    users.push({
        id: i,
        name: faker.person.fullName(),
        age: faker.number.int({ min: 18, max: 130 }),
        dob: faker.date.birthdate(),
        salary: faker.number.float({ min: 10_000, max: 500_000, fractionDigits: 2 }),
        email: faker.internet.email(),
        website: faker.internet.url(),
        postcode: faker.location.zipCode(),
        country: faker.location.country(),
        telephone: faker.phone.number(),
        faxephone: faker.phone.number(),
        subscribed: faker.datatype.boolean(),
        summary: faker.person.bio(),
        note: faker.lorem.sentence(),
        children: faker.number.int({ min: 0, max: 4 }),
    });
}

const grid = new TheGrid<User>(hostElement!, {
    data: users,
    size: "full",
    zebra: true,
    columns: [
        { binding: "id", header: "Id", width: 100, dataType: ColumnType.Text },
        { binding: "name", header: "Name", width: 200, dataType: ColumnType.String },
        { binding: "age", header: "Age", width: 100, dataType: ColumnType.Integer },
        { binding: "dob", header: "Date of birth", width: 400, dataType: ColumnType.Date },
        { binding: "salary", header: "Salary", width: 150, dataType: ColumnType.Decimal },
        { binding: "email", header: "Email address", width: 300, dataType: ColumnType.Email },
        { binding: "website", header: "Website", width: 300, dataType: ColumnType.URL },
        { binding: "postcode", header: "Post code", width: 150, dataType: ColumnType.String },
        { binding: "country", header: "Country", width: 250 },
        { binding: "telephone", header: "Telephone", width: 175, dataType: ColumnType.String },
        { binding: "faxephone", header: "Telephone", width: 175, dataType: ColumnType.String },
        { binding: "subscribed", header: "Subscribed", width: 100, dataType: ColumnType.Boolean },
        { binding: "summary", header: "Summary", width: 400, dataType: ColumnType.Text },
        { binding: "note", header: "Note", width: 300, dataType: ColumnType.Text },
        { binding: "children", header: "Children", width: 100, dataType: ColumnType.Integer },
    ],
});

grid.selection = new Range(2, 2, 5, 5);

// setTimeout(() => {
//     grid.columns.update(columns => {
//         return columns.map(column => {
//             if (column.binding === "age") {
//                 column.visible = false;
//             }
//             return column;
//         });
//     });
// }, 1000);
