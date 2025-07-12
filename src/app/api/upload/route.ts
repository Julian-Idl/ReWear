import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const folder: string = data.get('folder') as string || 'general';

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.name.replace(/\.[^/.]+$/, '') + '-' + uniqueSuffix + '.' + file.name.split('.').pop();
    
    // Create uploads directory structure
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    // Write file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/${folder}/${filename}`;

    return NextResponse.json({ 
      message: "File uploaded successfully", 
      url: publicUrl,
      filename: filename
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
