"use client";

import { useEffect } from "react";

export function ViewCounter({ articleId }: { articleId: string }) {
  useEffect(() => {
    fetch(`/api/posts/${articleId}/views`, { method: "POST" }).catch(() => {});
  }, [articleId]);

  return null;
}
