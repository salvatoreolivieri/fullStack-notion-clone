import { Navbar } from "./_components/navbar";

const MarketingLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="h-full">
    <Navbar />

    <main className="h-full pt-28">{children}</main>
  </div>
);

export default MarketingLayout;
