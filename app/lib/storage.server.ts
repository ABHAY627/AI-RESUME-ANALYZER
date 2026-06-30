import { put, del } from "@vercel/blob";

/**
 * Upload a file to Vercel Blob and return its public URL.
 */
export async function uploadFile(
  file: File | Blob,
  filename: string,
  contentType: string
): Promise<string> {
  try {
    const { url } = await put(filename, file, {
      access: "public",
      contentType,
    });
    return url;
  } catch (err: any) {
    if (err.message && err.message.includes("private store")) {
      const { url } = await put(filename, file, {
        access: "private",
        contentType,
      });
      return url;
    }
    throw err;
  }
}

/**
 * Delete a file from Vercel Blob by its URL.
 */
export async function deleteFile(url: string): Promise<void> {
  await del(url);
}
