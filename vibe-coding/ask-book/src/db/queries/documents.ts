import { eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { documents, statusEnum } from "@/db/schema";

export async function insertDocument(data: {
  filename: string;
  fileSize: number;
  fileData?: Buffer;
}) {
  const [doc] = await db.insert(documents).values(data).returning();
  return doc;
}

export async function getDocumentById(id: string) {
  return db.query.documents.findFirst({
    where: eq(documents.id, id),
    columns: {
      fileData: false,
    },
  });
}

export async function getDocumentFileData(id: string) {
  return db.query.documents.findFirst({
    where: eq(documents.id, id),
    columns: {
      id: true,
      filename: true,
      fileData: true,
    },
  });
}

export async function updateDocumentStatus(
  id: string,
  status: (typeof statusEnum.enumValues)[number],
  chunkCount?: number
) {
  const values: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };
  if (chunkCount !== undefined) {
    values.chunkCount = chunkCount;
  }
  const [doc] = await db
    .update(documents)
    .set(values)
    .where(eq(documents.id, id))
    .returning();
  return doc;
}

export async function listDocuments() {
  return db
    .select({
      id: documents.id,
      filename: documents.filename,
      fileSize: documents.fileSize,
      status: documents.status,
      chunkCount: documents.chunkCount,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
      hasFileData: sql<boolean>`${documents.fileData} IS NOT NULL`.as(
        "has_file_data"
      ),
    })
    .from(documents)
    .where(ne(documents.status, "failed"))
    .orderBy(sql`${documents.createdAt} DESC`);
}

export async function getDocumentByFilename(filename: string) {
  const rows = await db
    .select({ id: documents.id, filename: documents.filename })
    .from(documents)
    .where(eq(documents.filename, filename))
    .orderBy(
      sql`CASE WHEN ${documents.status} = 'completed' AND ${documents.fileData} IS NOT NULL THEN 0 ELSE 1 END`,
      sql`${documents.createdAt} DESC`
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function deleteDocument(id: string) {
  const [doc] = await db
    .delete(documents)
    .where(eq(documents.id, id))
    .returning();
  return doc;
}
