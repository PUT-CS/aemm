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
import { useNavigate } from "react-router";

export default function Login() {
  const formSchema = z.object({
    username: z
      .string()
      .min(2, { message: "Username must be at least 2 characters." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const navigate = useNavigate();

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
    navigate("/");
  };

  return (
    <Card className="p-20 w-[500px]">
      <h1 className="text-2xl font-bold">Welcome to AEMM</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-0"
        >
          <FormField
            name="username"
            control={form.control}
            render={({ field }) => (
              <FormItem className="px-0 py-0 mb-2">
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
              <FormItem className="px-0 py-0 mb-2">
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
          <Button type="submit" className="mt-4 h-10">
            Log In
          </Button>
        </form>
      </Form>
    </Card>
  );
}
