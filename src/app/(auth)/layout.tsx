export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center py-8 px-4 sm:px-8"
      style={{
        background: "linear-gradient(0deg, #FAF8FF, #FAF8FF), #FFFFFF",
      }}
    >
      <main className="flex flex-col justify-center items-center w-full max-w-[1280px]">
        {children}
      </main>
    </div>
  );
}
