import "normalize.css";
import { DataType } from "./src/index";
import { faker } from "@faker-js/faker";
import { createRange } from "@/parts/range";
import { createGrid } from "@/grid";
import { createSelection } from "@/parts/selection";

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

const grid = createGrid<User>(hostElement!, {
    data: users,
    columns: [
        { binding: "id", header: "Id", width: 100, dataType: DataType.Text },
        { binding: "name", header: "Name", width: 200, dataType: DataType.String },
        { binding: "age", header: "Age", width: 100, dataType: DataType.Integer },
        { binding: "dob", header: "Date of birth", width: 400, dataType: DataType.Date, visible: false },
        { binding: "salary", header: "Salary", width: 150, dataType: DataType.Decimal },
        { binding: "email", header: "Email address", width: 300, dataType: DataType.Email },
        { binding: "website", header: "Website", width: 300, dataType: DataType.URL },
        { binding: "postcode", header: "Post code", width: 150, dataType: DataType.String },
        { binding: "country", header: "Country", width: 250 },
        { binding: "telephone", header: "Telephone", width: 175, dataType: DataType.String },
        { binding: "faxephone", header: "Telephone", width: 175, dataType: DataType.String },
        { binding: "subscribed", header: "Subscribed", width: 100, dataType: DataType.Boolean },
        { binding: "summary", header: "Summary", width: 400, dataType: DataType.Text },
        { binding: "note", header: "Note", width: 300, dataType: DataType.Text },
        { binding: "children", header: "Children", width: 100, dataType: DataType.Integer },
    ],
});

grid.updateSelection(selection => {
    return selection.set("range", createRange(0, 0));
});

// setTimeout(() => {
//     grid.updateColumns(columnCollection => {
//         return columnCollection.map(column => {
//             return column.withMutations(data => {
//                 if (data.get("binding") === "age") {
//                     data.set("visible", false);
//                 }
//             });
//         });
//     });
// }, 1000);

// setTimeout(() => {
//     console.log("->", grid);
//     grid.updateSource(source => {
//         return source.filter(item => item.id % 2 === 0);
//     });
// }, 2000);
