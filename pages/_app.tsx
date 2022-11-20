import "styles/globals.css";
import type { AppProps } from "next/app";
import "firebaseui/dist/firebaseui.css";
import { Box, ThemeProvider } from "@mui/material";
import { theme } from "config/theme";
import NavBar from "components/NavBar";
import NonSSRWrapper from "components/NonSSRWrapper";
import { SnackbarProvider } from "notistack";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <NonSSRWrapper>
          <NavBar />
          <main>
            <Component {...pageProps} />
          </main>
          <Box height={50} />
        </NonSSRWrapper>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
