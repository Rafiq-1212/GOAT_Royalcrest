import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function getDatabaseUrl(): string | undefined {
  try {
    const rootEnv = path.resolve(process.cwd(), "..", ".env");
    const localEnv = path.resolve(process.cwd(), ".env");
    const targetPath = fs.existsSync(localEnv) ? localEnv : rootEnv;
    if (fs.existsSync(targetPath)) {
      const content = fs.readFileSync(targetPath, "utf-8");
      const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch {
    // fallback
  }
  return process.env.DATABASE_URL;
}

const dbUrl = getDatabaseUrl();
const prisma = new PrismaClient({ datasourceUrl: dbUrl });

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: submissions,
    });
  } catch (error: any) {
    console.error("Admin DB fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
