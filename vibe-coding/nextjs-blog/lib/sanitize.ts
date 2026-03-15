import { defaultSchema } from "rehype-sanitize";

export const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code || []),
      ["className"],
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      ["className"],
    ],
    pre: [
      ...(defaultSchema.attributes?.pre || []),
      ["className"],
    ],
    div: [
      ...(defaultSchema.attributes?.div || []),
      ["className"],
    ],
  },
};
