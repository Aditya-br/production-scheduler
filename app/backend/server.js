const express = require("express");
const cors = require("cors");
const multer = require("multer");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json()); // Needed to parse JSON body

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Generate file name based on today's date
const getTodayFilename = (originalName = ".xlsx") => {
    const dateStr = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
    const ext = path.extname(originalName) || ".xlsx";
    return `${dateStr}${ext}`;
};

// Set up multer to store uploaded files with overwrite behavior
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const filename = getTodayFilename(file.originalname);
        const filePath = path.join(uploadDir, filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Overwrite file if it exists
        }

        cb(null, filename);
    },
});

const upload = multer({ storage: storage });

// POST /entersales - Upload Excel file
app.post("/entersales", upload.single("file"), async (req, res) => {
    const filePath = req.file?.path;
    if (!filePath) return res.status(400).json({ error: "No file uploaded" });

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        const worksheet = workbook.worksheets[0];
        const rows = [];

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            const [name, quantity, price, availableStock] = row.values.slice(1);
            const p = Math.round((quantity / (quantity + availableStock)) * 100);
            rows.push({ name, quantity, price, availableStock, percentage: p });
        });

        rows.sort((a, b) => b.percentage - a.percentage);
        console.log("Parsed rows:", rows);

        res.status(200).json({ message: "File parsed successfully", data: rows });
    } catch (err) {
        console.error("Failed to parse Excel:", err);
        res.status(500).json({ error: "Failed to process file" });
    }
});

// POST /generateplan - Generate time allocation plan
app.post("/generateplan", async (req, res) => {
    try {
        const { totalhours, workingdays } = req.body;
        const totalAvailableHours = totalhours * workingdays;

        const filename = getTodayFilename();
        const filePath = path.join(uploadDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "Sales file for today not found." });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];

        const products = [];
        let totalQuantity = 0;

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            const [name, quantity] = row.values.slice(1);
            if (!name || !quantity) return;
            totalQuantity += quantity;
            products.push({ name, quantity });
        });

        if (totalQuantity === 0) {
            return res.status(400).json({ error: "Total quantity is zero. Cannot generate plan." });
        }

        const plan = products.map((product) => {
            const percentage = product.quantity / totalQuantity;
            return {
                name: product.name,
                quantity: product.quantity,
                percentage: (percentage * 100).toFixed(2) + "%",
            };
        });

        res.status(200).json({ message: "Plan generated successfully", plan });
    } catch (err) {
        console.error("Error generating plan:", err);
        res.status(500).json({ error: "Failed to generate plan" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
