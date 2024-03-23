"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useParams } from "next/navigation";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useCoverImage } from "@/hooks/use-cover-image";
import { SingleImageDropzone } from "@/components/SingleImageDropzone";
import { api } from "@/convex/_generated/api";
import { useEdgeStore } from "@/lib/edgestore";
import { Id } from "@/convex/_generated/dataModel";

export const CoverImageModal = () => {
  const {
    isOpen: isModalOpen,
    onClose: onCloseModal,
    url: coverImageUrl,
  } = useCoverImage();
  const params = useParams();
  const update = useMutation(api.documents.updateDocument);

  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { edgestore } = useEdgeStore();

  const onClose = () => {
    setFile(undefined);
    setIsSubmitting(false);
    onCloseModal();
  };

  const onChange = async (file?: File) => {
    if (file) {
      setIsSubmitting(true);
      setFile(file);

      const res = await edgestore.publicFiles.upload({
        file,
        options: {
          replaceTargetUrl: coverImageUrl,
        },
      });

      await update({
        id: params.documentId as Id<"documents">,
        coverImage: res.url,
      });

      onClose();
    }
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={onCloseModal}>
        <DialogContent>
          <DialogHeader>
            <h2 className="text-center text-lg font-semibold">Cover Image</h2>
          </DialogHeader>

          <SingleImageDropzone
            className="w-full outline-none"
            disabled={isSubmitting}
            value={file}
            onChange={onChange}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
