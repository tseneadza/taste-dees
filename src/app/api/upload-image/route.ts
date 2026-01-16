import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Sanitize filename according to PRD rules:
 * 1. Convert to lowercase
 * 2. Replace spaces with hyphens
 * 3. Remove all characters except: a-z, 0-9, -, .
 * 4. Collapse multiple hyphens to single hyphen
 * 5. Trim hyphens from start/end
 */
function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-\.]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Allowed: jpg, jpeg, png, webp" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size: 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const sanitizedName = sanitizeFilename(file.name);
    const uniqueFilename = `${Date.now()}-${sanitizedName}`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), "public", "images", "products");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (mkdirError) {
      console.error("Failed to create upload directory:", mkdirError);
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Write file to disk
    const filePath = path.join(uploadDir, uniqueFilename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      await writeFile(filePath, buffer);
    } catch (writeError) {
      console.error("Failed to write file:", writeError);
      return NextResponse.json(
        { success: false, error: "Failed to save image. Please try again." },
        { status: 500 }
      );
    }

    // Return success with path
    const publicPath = `/images/products/${uniqueFilename}`;
    return NextResponse.json({ success: true, path: publicPath });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save image. Please try again." },
      { status: 500 }
    );
  }
}
