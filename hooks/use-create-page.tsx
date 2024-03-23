import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useCreatePage = () => {
  const router = useRouter();
  const create = useMutation(api.documents.create);

  const createNewPage = (documentId?: string) => {
    const promise = create({ title: "untitled" }).then(documentId => {
      router.push(`/documents/${documentId}`);
    });

    // Add Notification
    toast.promise(promise, {
      loading: "Creating a new page...",
      success: "New page created!",
      error: "Failed to create a new page",
    });
  };

  return {
    createNewPage,
  };
};
