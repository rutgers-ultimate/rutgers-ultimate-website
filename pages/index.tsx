import { Button, Container } from "@mui/material";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { auth } from "../app/firebaseApp";

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);
  return (
    <Container maxWidth={"lg"}>
      <Button onClick={() => signOut()}>Sign Out</Button>
    </Container>
  );
}
