import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

export const useCreatePage = () => {
  const create = useMutation(api.documents.create);

  const createNewPage = () => {
    const promise = create({ title: "untitled" });

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
