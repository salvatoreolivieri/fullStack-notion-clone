"use client";

import { useMutation, useQuery } from "convex/react";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/Toolbar";
import { Cover } from "@/components/Cover";
// import { Skeleton } from "@/components/ui/skeleton";

interface DocumentIdPageProps {
  params: {
    documentId: Id<"documents">;
  };
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  const document = useQuery(api.documents.getDocumentById, {
    documentId: params.documentId,
  });

  if (!document) {
    return <div>Loading</div>;
  }

  if (document === null) {
    return <div>Not Found</div>;
  }

  return (
    <>
      <div className="pb-40">
        <Cover url={document.coverImage} />

        <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
          <Toolbar initialData={document} />

          {/* <Editor onChange={onChange} initialContent={document.content} /> */}
        </div>
      </div>
    </>
  );
};

export default DocumentIdPage;
