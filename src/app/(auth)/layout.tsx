export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page-wrapper">
      <main data-ui-style="ui-style-zuiogu">
        {children}
      </main>
    </div>
  );
}
