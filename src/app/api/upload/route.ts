import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = path.extname(file.name) || '.png';
    const filename = `${uuidv4()}${ext}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, filename);

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${filename}`;

    // Create project in database
    const project = await db.project.create({
      data: {
        name: file.name.replace(/\.[^/.]+$/, ''),
        imageUrl,
        status: 'uploaded',
      },
    });

    return NextResponse.json({
      projectId: project.id,
      imageUrl: project.imageUrl,
      name: project.name,
      status: project.status,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
