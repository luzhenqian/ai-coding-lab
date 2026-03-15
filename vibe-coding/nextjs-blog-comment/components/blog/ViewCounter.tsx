"use client";

import { useEffect } from "react";

type ViewCounterProps = {
  articleId: string;
};

export function ViewCounter({ articleId }: ViewCounterProps) {
  useEffect(() => {
    fetch(`/api/posts/${articleId}/views`, { method: "POST" }).catch(() => {});
  }, [articleId]);

  return null;
}
