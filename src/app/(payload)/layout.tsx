import config from "@payload-config";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import type { ServerFunctionClient } from "payload";
import React from "react";
import {
  newsreader,
  inter,
  notoNaskhArabic,
  notoSansArabic,
} from "@/lib/fonts";
import { importMap } from "./admin/importMap";
import "@payloadcms/next/css";
import "./admin.css";

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

export default async function Layout({ children }: Args) {
  const fontVariables = `${newsreader.variable} ${inter.variable} ${notoSansArabic.variable} ${notoNaskhArabic.variable}`;

  return (
    <RootLayout
      config={config}
      htmlProps={{
        className: fontVariables,
        suppressHydrationWarning: true,
      }}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  );
}
