const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  // Add some functions here...

  return (
    <>
      <div className="h-full dark:bg-[#1F1F1F]">{children}</div>
    </>
  );
};

export default PublicLayout;
