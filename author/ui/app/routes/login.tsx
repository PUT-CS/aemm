import { Card } from "~/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useNavigate, useLocation } from "react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  loginRequest,
  registerRequest,
} from "~/routes/admin/UsersTab/mutations";
import { setAuthToken } from "~/lib/auth";

export const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export type LoginFormData = z.infer<typeof formSchema>;

export default function Login() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from ?? "/";
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      // Persist JWT token for subsequent authenticated requests
      setAuthToken(data.token);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Reset form and navigate to the originally requested page or home
      form.reset({ username: "", password: "" });
      navigate(from, { replace: true });
    },
    onError: (error: Error) => {
      console.error("Failed to log in:", error);
      setServerError(error.message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: () => {
      setSuccessMsg("Account created successfully. You can now log in.");
      setIsRegistering(false);
      form.reset({ username: "", password: "" });
    },
    onError: (error: Error) => {
      console.error("Failed to register:", error);
      setServerError(error.message);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setServerError(null);
    setSuccessMsg(null);
    if (isRegistering) {
      registerMutation.mutate(data);
    } else {
      loginMutation.mutate(data);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md p-10">
        <h1 className="mb-6 text-center text-2xl font-bold">
          {isRegistering ? "Create Account" : "Welcome to AEMM"}
        </h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-0"
          >
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem className="mb-2 px-0 py-0">
                  <FormLabel className="block">Username</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10" />
                  </FormControl>
                  <div className="h-6">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem className="mb-2 px-0 py-0">
                  <FormLabel className="block">Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} className="h-10" />
                  </FormControl>
                  <div className="h-6">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {successMsg ? (
              <p className="mt-2 text-sm text-green-500">{successMsg}</p>
            ) : null}

            {serverError ? (
              <p className="mt-2 text-sm text-red-500">{serverError}</p>
            ) : null}

            <Button
              type="submit"
              className="mt-4 h-10"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {isRegistering
                ? registerMutation.isPending
                  ? "Creating Account..."
                  : "Create Account"
                : loginMutation.isPending
                  ? "Logging in..."
                  : "Log In"}
            </Button>

            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                className="text-blue-500 hover:underline"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setServerError(null);
                  setSuccessMsg(null);
                }}
              >
                {isRegistering
                  ? "Already have an account? Log in"
                  : "Don't have an account? Create one"}
              </button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
