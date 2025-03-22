import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading, setError } from "@/store/slices/authSlice";
import { RootState } from "@/store";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Toaster, toast } from "react-hot-toast";



const signupSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect( () => {
    if (user) {
      navigate("/");
    }
  } , [user])

  const handleSignup = async () => {
    const signupData = { email, password, fullName, confirmPassword };
    const result = signupSchema.safeParse(signupData);

    if (!result.success) {
      result.error.errors.forEach((err) => toast.error(err.message));
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
        { email, password, fullName },
        { withCredentials: true }
      );

      if (response.data._id) {
        dispatch(setLoading(false));
        dispatch(setUser(response.data));
        toast.success("Signup successful! Welcome!");
        navigate("/");
      } else {
        toast.error(response.data.message || "Signup failed");
        dispatch(setError(response.data.message || "Signup failed"));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "An error occurred during signup";
      toast.error(errorMsg);
      dispatch(setError(errorMsg));
    }
  };

  const handleLogin = async () => {
    const loginData = { email, password };
    const result = loginSchema.safeParse(loginData);

    if (!result.success) {
      result.error.errors.forEach((err) => toast.error(err.message));
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signin`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data._id) {
        dispatch(setLoading(false));
        dispatch(setUser(response.data));
        toast.success("Login successful! Welcome back!");
        navigate("/");
      } else {
        toast.error(response.data.message || "Login failed");
        dispatch(setError(response.data.message || "Login failed"));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "An error occurred during login";
      toast.error(errorMsg);
      dispatch(setError(errorMsg));
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex justify-center items-center bg-gray-100">
      <div className="w-[50vw] max-w-md h-[80vh] max-h-[600px] shadow-xl border rounded-lg bg-white p-6">
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="w-full bg-transparent grid grid-cols-2">
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-transparent border-b-2 rounded-none data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
            >
              Signup
            </TabsTrigger>
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-transparent border-b-2 rounded-none data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
            >
              Login
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signup" className="flex flex-col gap-4 mt-6">
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button onClick={handleSignup} disabled={loading}>
              {loading ? "Signing up..." : "Signup"}
            </Button>
          </TabsContent>

          <TabsContent value="login" className="flex flex-col gap-4 mt-6">
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};