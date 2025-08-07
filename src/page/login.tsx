import { Card, Typography, Input, Button } from "antd";
import { Mail, Lock } from "lucide-react"; // Changed from User to Mail
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Logo from "../assets/logo.png";
import { useSignIn } from "../reactQuery/hooks/auth";

const { Title, Text } = Typography;

// ✅ Updated Zod Schema with email
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { mutate, isPending } = useSignIn();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginFormValues) => {
    mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3c1f10] via-[#8b5e3c] to-[#d9a679] relative overflow-hidden">
      <div className="absolute top-[-50px] left-[-50px] w-80 h-80 bg-[#f7e8dc] opacity-10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-[#f3d1a4] opacity-10 rounded-full blur-[140px] animate-pulse" />

      <Card className="w-full max-w-md shadow-2xl !border-0 rounded-3xl overflow-hidden">
        <div className="bg-[#2d1603] text-white pb-3 -m-6 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center mx-auto">
              <img src={Logo} className="w-40 h-32 object-contain" />
            </div>
            <Title level={2} className="!text-white !mb-2">
              Kiosk Login
            </Title>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Text className="text-lg font-semibold">Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    {...field}
                    prefix={<Mail size={20} className="text-gray-400" />}
                    placeholder="Enter your email"
                    className="h-14 text-lg rounded-xl mt-2"
                  />
                )}
              />
              {errors.email && (
                <Text type="danger" className="block mt-1">
                  {errors.email.message}
                </Text>
              )}
            </div>

            <div>
              <Text className="text-lg font-semibold">Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    prefix={<Lock size={20} className="text-gray-400" />}
                    placeholder="Enter your password"
                    className="h-14 text-lg rounded-xl mt-2"
                  />
                )}
              />
              {errors.password && (
                <Text type="danger" className="block mt-1">
                  {errors.password.message}
                </Text>
              )}
            </div>

            <div className="!mt-8">
              <Button
                type="primary"
                htmlType="submit"
                loading={isPending}
                className="w-full bg-[#2d1603] border-[#2d1603] hover:bg-[#3d2613] hover:border-[#3d2613] h-14 text-xl font-semibold rounded-xl"
              >
                Login
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
