import React from "react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        background: "linear-gradient(to bottom, #e9dbc7 0%, #c8b08c 100%)",
      }}
    >
      {children}
    </div>
  );
} 