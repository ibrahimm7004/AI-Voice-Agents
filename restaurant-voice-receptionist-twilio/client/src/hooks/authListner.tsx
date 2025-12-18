import { ReactNode, useEffect } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { auth, onAuthStateChanged } from "../firebase";
import { setUser, clearUser, setLoading } from "../store/authSlice";

interface AuthListenerProps {
  children: ReactNode;
}

export const AuthListener: React.FC<AuthListenerProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setLoading(true));
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const accessToken = await user.getIdToken();

        dispatch(
          setUser({
            id: user.uid,
            accessToken: accessToken,
            email: user.email || "",
          })
        );
      } else {
        dispatch(clearUser());
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return <>{children}</>;
};
