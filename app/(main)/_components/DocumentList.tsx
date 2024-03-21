"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";

import { Item } from "./Item";

interface DocumentListProps {
  perentDocumentId?: Id<"documents">;
  level?: number;
  data?: Doc<"documents">[];
}

export const DocumentList = ({
  perentDocumentId,
  level = 0,
  data,
}: DocumentListProps) => {
  const params = useParams();
  const router = useRouter();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const onExpand = (documentId: string) => {
    {
      setExpanded(prevExpanded => ({
        ...prevExpanded,
        [documentId]: !prevExpanded[documentId],
      }));
    }
  };

  const onRedirect = (documentId: string) =>
    router.push(`/documents/${documentId}`);

  const documents = useQuery(api.documents.getDocuments, {
    parentDocument: perentDocumentId,
  });

  if (documents === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />

        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  return (
    <div className="mb-3">
      <p
        style={{
          paddingLeft: level ? `${level * 12 + 25}px` : "12px",
        }}
        className={cn(
          "hidden text-sm font-medium text-muted-foreground/80",
          expanded && "last:block",
          level === 0 && "hidden"
        )}
      >
        No pages inside
      </p>

      {documents.map(document => (
        <div key={document._id}>
          <Item
            id={document._id}
            onClick={() => onRedirect(document._id)}
            label={document.title}
            icon={FileIcon}
            documentIcon={document.icon}
            active={params.documentId === document._id}
            level={level}
            onExpand={() => onExpand(document._id)}
            expanded={expanded[document._id]}
          />

          {expanded[document._id] && (
            <DocumentList perentDocumentId={document._id} level={level + 1} />
          )}
        </div>
      ))}
    </div>
  );
};
