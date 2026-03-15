import { auth } from "@/lib/auth";
import { LocalStorageProvider } from "@/lib/storage";
import { successResponse, errorResponse } from "@/lib/api-response";

const storage = new LocalStorageProvider();

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Not authenticated", 401);

    if (session.user.role !== "AUTHOR" && session.user.role !== "ADMIN") {
      return errorResponse("Not authorized", 403);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse("No file provided", 400);
    }

    const key = await storage.upload(file);
    const url = storage.getUrl(key);

    return successResponse({ url }, 201);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to upload file";
    return errorResponse(message, 400);
  }
}
