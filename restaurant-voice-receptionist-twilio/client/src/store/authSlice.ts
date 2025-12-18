import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { auth, signOut } from "../firebase";
import { UserData } from "../types/userData";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";

interface SignInPayload {
  email: string;
  password: string;
}

export const signIn = createAsyncThunk<
  void,
  SignInPayload,
  { rejectValue: string }
>(
  "auth/signInWithEmailAndPassword",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        error.code !== "auth/cancelled-popup-request" &&
        error.code !== "auth/popup-closed-by-user"
      ) {
        return rejectWithValue("Error signing in with email and password");
      }
      return rejectWithValue("Error signing in with email and password");
    }
  }
);

// Thunk to handle Sign-Out
export const logOut = createAsyncThunk(
  "auth/logOut",
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      return; // The onAuthStateChanged listener will handle clearing the user state
    } catch (error) {
      console.error(error);
      return rejectWithValue("Error signing out");
    }
  }
);

interface AuthState {
  currentUser: UserData | null;
  isUserDataLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  currentUser: null,
  isUserDataLoading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserData>) => {
      state.currentUser = action.payload;
      state.isUserDataLoading = false;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isUserDataLoading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isUserDataLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.isUserDataLoading = true;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isUserDataLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logOut.pending, (state) => {
        state.isUserDataLoading = true;
        state.error = null;
      })
      .addCase(logOut.rejected, (state, action) => {
        state.isUserDataLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;
export default authSlice.reducer;

export type { AuthState };
