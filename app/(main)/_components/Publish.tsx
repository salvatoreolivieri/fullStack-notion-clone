"use client";

import { Doc } from "@/convex/_generated/dataModel";

interface PublishProps {
  initialData: Doc<"documents">;
}

export const Publish = ({ initialData }: PublishProps) => {
  // Add some functions here...

  return (
    <>
      <div>{initialData.isPublished ? "published" : "unpublished"}</div>
    </>
  );
};
