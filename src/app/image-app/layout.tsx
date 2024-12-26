import QueryProvider from '../../providers/query-providers';

export default function ImageAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>{children}</QueryProvider>
  );
}