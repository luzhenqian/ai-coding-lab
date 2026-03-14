import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  documents,
  chunks,
  conversations,
  messages,
} from "@/db/schema";

export type Document = InferSelectModel<typeof documents>;
export type NewDocument = InferInsertModel<typeof documents>;

export interface DocumentListItem {
  id: string;
  filename: string;
  fileSize: number;
  status: string;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
  hasFileData: boolean;
}

export type Chunk = InferSelectModel<typeof chunks>;
export type NewChunk = InferInsertModel<typeof chunks>;

export type Conversation = InferSelectModel<typeof conversations>;
export type NewConversation = InferInsertModel<typeof conversations>;

export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;

export interface ChunkMetadata {
  page: number;
  section: string | null;
}

export interface ChunkWithEmbedding {
  content: string;
  embedding: number[];
  metadata: ChunkMetadata;
}

export interface ParsedPage {
  pageNumber: number;
  text: string;
}

export interface RetrievalResult {
  content: string;
  similarity: number;
  documentFilename: string;
  metadata: ChunkMetadata;
}

export interface RetrievalOptions {
  topK?: number;
  similarityThreshold?: number;
}

export interface SourceCitation {
  filename: string;
  page: number;
  section: string | null;
}
