import { NextResponse } from "next/server";
import { importMembersFromUploadFile } from "@/features/medical/members/upload/import-member-upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please attach a CSV or Excel file" },
        { status: 400 }
      );
    }

    if (!file.name.trim()) {
      return NextResponse.json(
        { error: "Uploaded file is missing a name" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "The uploaded file is empty" },
        { status: 400 }
      );
    }

    const result = await importMembersFromUploadFile(buffer, file.name);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("POST /api/medical/members/upload failed:", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to process upload file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
