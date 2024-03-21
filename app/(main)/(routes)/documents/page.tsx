"use client";

import { useUser } from "@clerk/clerk-react";

import Image from "next/image";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreatePage } from "@/hooks/use-create-page";

const DocumentPage = () => {
  const { user } = useUser();
  const { createNewPage } = useCreatePage();

  return (
    <>
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Image
          src="/empty.png"
          height="300"
          width="300"
          alt="empty"
          className="dark:hidden"
        />
        <Image
          src="/empty-dark.png"
          height="300"
          width="300"
          alt="empty"
          className="hidden dark:block"
        />

        <h2 className="text-lg font-medium ">
          Welcome to {user?.firstName}&apos;s Notion
        </h2>

        <Button onClick={createNewPage}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create a Note
        </Button>
      </div>
    </>
  );
};

export default DocumentPage;
