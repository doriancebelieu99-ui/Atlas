import type { Metadata } from "next";
import "@/styles/atlas.css";

export const metadata: Metadata = {
  title: "Atlas — Copilote intelligent de voyage",
  description:
    "Trouvez la destination qui vous correspond, comprenez pourquoi, et construisez un itinéraire réaliste.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
