import Sidebar from "../Sidebar/Sidebar";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] md:flex">
      <Sidebar />
      <main className="relative min-w-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.035),transparent_18%),linear-gradient(180deg,rgba(10,10,10,0.98),rgba(0,0,0,1))] px-3 py-4 sm:px-4 sm:py-5 lg:px-7 lg:py-7">
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-12 bg-[linear-gradient(90deg,rgba(0,0,0,0.32),rgba(0,0,0,0))] md:block" />
        <div className="relative mx-auto max-w-[min(1600px,100%)]">
          <div className="rounded-[1.4rem] border border-[rgba(255,255,255,0.05)] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] shadow-[0_24px_60px_rgba(0,0,0,0.2)] backdrop-blur-[2px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
