import ClientLayout from "./client-layout";

export * from "./__metadata";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  );
}