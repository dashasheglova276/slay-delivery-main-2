import TopNav from "@/components/top-nav";
import BottomNav from "@/components/bottom-nav";
import AddressOnboarding from "@/components/address-onboarding";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="stage">
      <div className="app">
        <TopNav />
        <AddressOnboarding />
        <main className="content">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
