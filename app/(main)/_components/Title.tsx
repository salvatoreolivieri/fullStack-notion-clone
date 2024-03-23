"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";

import { cn } from "@/lib/utils";

import { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TitleProps {
  initialData: Doc<"documents">;
}

export const Title = ({ initialData }: TitleProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const update = useMutation(api.documents.updateDocument);

  const [title, setTitle] = useState(initialData.title || "Untitled");
  const [isEditing, setIsEditing] = useState(false);

  const enableInput = () => {
    setTitle(initialData.title);
    setIsEditing(true);

    setTimeout(() => {
      inputRef.current?.focus();

      // Enable this part of the code to select all the title onClick (personally I don't like it)
      // inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  };

  const disableInput = () => setIsEditing(false);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);

    update({
      id: initialData._id,
      title: event.target.value || "Untitled",
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") disableInput();
  };

  return (
    <>
      <div className="flex items-center gap-x-1">
        {!!initialData.icon && <p>{initialData.icon}</p>}

        {isEditing ? (
          <Input
            ref={inputRef}
            onClick={enableInput}
            onBlur={disableInput}
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={title}
            className="h-6 ml-1 px-2 focus-visible:ring-transparent"
          />
        ) : (
          <Button
            onClick={enableInput}
            variant="ghost"
            size="sm"
            className={cn("border border-transparent font-normal h-auto ")}
          >
            <span className="truncate"> {initialData.title}</span>
          </Button>
        )}
      </div>
    </>
  );
};

Title.Skeleton = function TitleSkeleton() {
  return <Skeleton className="h-6 w-20 rounded-md" />;
};
