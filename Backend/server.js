const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const multer = require("multer");
const { Readable } = require("stream");

require("dotenv").config();

const { drive } = require("./googleDrive");

const app = express();

// =========================
// Middleware
// =========================

app.use(cors());
app.use(express.json());

// =========================
// Multer
// =========================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

// =========================
// MySQL
// =========================

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// =========================
// Test Backend
// =========================

app.get("/", (req, res) => {
  res.json({
    message: "Invoice System Backend is running!",
  });
});

// =========================
// Test Database
// =========================

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM invoices ORDER BY id DESC");

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// =========================
// Add Invoice
// ID + Image
// =========================

app.post(
  "/api/invoices",
  upload.single("invoice_picture"),
  async (req, res) => {
    try {
      const { invoice_id } = req.body;
      const file = req.file;

      // Check Invoice ID
      if (!invoice_id) {
        return res.status(400).json({
          success: false,
          message: "Invoice ID is required",
        });
      }

      // Check Image
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Invoice image is required",
        });
      }

      // =========================
      // Check Duplicate Invoice ID
      // =========================

      const [existing] = await db.query(
        "SELECT id FROM invoices WHERE invoice_id = ?",
        [invoice_id],
      );

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Invoice ID already exists",
        });
      }

      // =========================
      // Upload to Google Drive
      // =========================

      console.log("Uploading image to Google Drive...");

      const driveResponse = await drive.files.create({
        requestBody: {
          name: `${invoice_id}-${file.originalname}`,
        },

        media: {
          mimeType: file.mimetype,
          body: Readable.from(file.buffer),
        },

        fields: "id,name,webViewLink",
      });

      const driveFileId = driveResponse.data.id;
      const imageUrl = driveResponse.data.webViewLink;

      console.log("Google Drive upload successful!");

      console.log("Drive File ID:", driveFileId);

      // =========================
      // Save to MySQL
      // =========================

      const [result] = await db.query(
        `
                INSERT INTO invoices
                (invoice_id, image_url)
                VALUES (?, ?)
                `,
        [invoice_id, imageUrl],
      );

      // =========================
      // Response
      // =========================

      res.json({
        success: true,
        message: "Invoice saved successfully",

        data: {
          id: result.insertId,
          invoice_id: invoice_id,
          image_url: imageUrl,
          drive_file_id: driveFileId,
        },
      });
    } catch (error) {
      console.error("Invoice upload error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to save invoice",
        error: error.message,
      });
    }
  },
);

// =========================
// Search Invoice
// =========================

app.get("/api/invoices/:invoice_id", async (req, res) => {
  try {
    const { invoice_id } = req.params;

    const [rows] = await db.query(
      `
            SELECT
                id,
                invoice_id,
                image_url,
                created_at
            FROM invoices
            WHERE invoice_id = ?
            `,
      [invoice_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to search invoice",
    });
  }
});

// =========================
// Get Invoice Image
// =========================

app.get("/api/invoices/:invoice_id/image", async (req, res) => {
  try {
    const { invoice_id } = req.params;

    // Find invoice in MySQL
    const [rows] = await db.query(
      `
      SELECT image_url
      FROM invoices
      WHERE invoice_id = ?
      `,
      [invoice_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const imageUrl = rows[0].image_url;

    if (!imageUrl) {
      return res.status(404).json({
        success: false,
        message: "Invoice image not found",
      });
    }

    // Get Google Drive File ID from URL
    const match = imageUrl.match(/\/d\/([^/]+)/);

    if (!match) {
      return res.status(500).json({
        success: false,
        message: "Invalid Google Drive image URL",
      });
    }

    const driveFileId = match[1];

    // Get image from Google Drive
    const driveResponse = await drive.files.get(
      {
        fileId: driveFileId,
        alt: "media",
      },
      {
        responseType: "stream",
      },
    );

    // Send image to browser
    res.setHeader(
      "Content-Type",
      driveResponse.headers["content-type"] || "image/jpeg",
    );

    driveResponse.data.pipe(res);
  } catch (error) {
    console.error("Image loading error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load invoice image",
    });
  }
});
// =========================
// Start Server
// =========================

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
