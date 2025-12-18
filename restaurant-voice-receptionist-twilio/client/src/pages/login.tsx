import { useAppDispatch } from "../hooks/useAppDispatch";
import { IconEyeOff, IconEye } from "@tabler/icons-react";
import { Button, Input } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../store/authSlice";
import { toast } from "react-toastify";
import { useState } from "react";

export const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await dispatch(signIn({ email, password })).unwrap();
      toast.success("Login successful");
      navigate("/");
    } catch (_) {
      toast.error("Incorrect email or password");
    }
    setLoading(false);
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isValid = email && password && emailRegex.test(email);

  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-gray-100 flex flex-col gap-2 flex-1 w-full h-full">
        <h1 className="text-3xl font-light text-black font-bebas tracking-wide">
          Login
        </h1>
        <div className="flex flex-col gap-4 w-1/2 self-center mt-auto mb-auto border-2 p-6 rounded-2xl shadow-xl">
          <Input
            isRequired
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onValueChange={(val) => setEmail(val)}
          />
          <Input
            isRequired
            label="Password"
            placeholder="Enter your password"
            endContent={
              <button
                className="focus:outline-none"
                type="button"
                onClick={() => {
                  setIsVisible(!isVisible);
                }}
                aria-label="toggle password visibility"
              >
                {isVisible ? <IconEyeOff /> : <IconEye />}
              </button>
            }
            type={isVisible ? "text" : "password"}
            value={password}
            onValueChange={(val) => setPassword(val)}
          />
          <Button
            className="mt-4"
            color="primary"
            isLoading={loading}
            onPress={handleSignIn}
            isDisabled={!isValid}
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};
