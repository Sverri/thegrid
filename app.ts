import "normalize.css";
import { faker } from "@faker-js/faker";
import { createGrid, DataType } from "./src/index";
import { Headers } from "@shared/enums";

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
        age: faker.number.int({ min: 10, max: 130 }),
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

const grid = createGrid(hostElement!, {
    data: users,
    showHeaders: Headers.Both,
    showHeaderSelection: Headers.Both,
    columns: [
        { binding: "id", dataType: DataType.Text, header: "Id", width: 100 },
        { binding: "subscribed", dataType: DataType.Boolean, header: "Subscribed", width: 115, readonly: true },
        { binding: "name", dataType: DataType.String, header: "Name", width: 200 },
        { binding: "age", dataType: DataType.Integer, header: "Age", width: 100 },
        { binding: "dob", dataType: DataType.Date, header: "Date of birth", width: 400 },
        {
            binding: "salary",
            dataType: DataType.Decimal,
            header: "Salary",
            width: 150,
            dataFormatter: new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "JPY",
                currencyDisplay: "symbol",
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
            }),
        },
        { binding: "email", dataType: DataType.Email, header: "Email address", width: 300 },
        { binding: "website", dataType: DataType.URL, header: "Website", width: 300 },
        { binding: "postcode", dataType: DataType.String, header: "Post code", width: 150 },
        { binding: "country", dataType: DataType.String, header: "Country", width: 250 },
        { binding: "telephone", dataType: DataType.String, header: "Telephone", width: 175 },
        { binding: "faxephone", dataType: DataType.String, header: "Telephone", width: 175 },
        { binding: "summary", dataType: DataType.Text, header: "Summary", width: 400 },
        { binding: "note", dataType: DataType.Text, header: "Note", width: 300 },
        { binding: "children", dataType: DataType.Integer, header: "Children", width: 100 },
    ],
});

const collator = new Intl.Collator("en", { numeric: true });
grid.data.filter = item => item.id % 2 === 0;
grid.data.sorter = (a, b) => collator.compare(a.name!, b.name!);
grid.selection.select(1, 1);

// Cell size slider

const cellSizeValue = document.querySelector(".cell-size .value")!;
const cellSizeSlider = document.querySelector<HTMLInputElement>(".cell-size .slider")!;
cellSizeValue.textContent = String(grid.cellSize);
cellSizeSlider.value = String(grid.cellSize);

cellSizeSlider.addEventListener("input", event => {
    const value = Number.parseInt((event.target! as HTMLInputElement).value, 10);
    if (Number.isNaN(value)) {
        return;
    }
    cellSizeValue.textContent = String(value);
    grid.cellSize = value;
});

// Show headers

const showHeaders = document.querySelector<HTMLSelectElement>(".show-headers .dropdown")!;
showHeaders.addEventListener("input", event => {
    const value = (event.target! as HTMLSelectElement).value;
    switch (value) {
        case "both": {
            grid.showHeaders = Headers.Both;
            break;
        }
        case "columns": {
            grid.showHeaders = Headers.Columns;
            break;
        }
        case "rows": {
            grid.showHeaders = Headers.Rows;
            break;
        }
        case "none": {
            grid.showHeaders = Headers.None;
            break;
        }
    }
});

// Header selection dropdown

const headerSelectionDropdown = document.querySelector<HTMLSelectElement>(".header-selection .dropdown")!;
headerSelectionDropdown.addEventListener("input", event => {
    const value = (event.target! as HTMLSelectElement).value;
    switch (value) {
        case "both": {
            grid.showHeaderSelection = Headers.Both;
            break;
        }
        case "columns": {
            grid.showHeaderSelection = Headers.Columns;
            break;
        }
        case "rows": {
            grid.showHeaderSelection = Headers.Rows;
            break;
        }
        case "none": {
            grid.showHeaderSelection = Headers.None;
            break;
        }
    }
});
