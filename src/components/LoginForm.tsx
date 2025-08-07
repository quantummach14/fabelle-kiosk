import React from "react";
import { Form, Input, Button, Card, Typography } from "antd";
import { User, Lock, LogIn } from "lucide-react";
import Logo from "../assets/logo.png";
const { Title, Text } = Typography;

interface LoginFormProps {
  onLogin: (credentials: { username: string; password: string }) => void;
  loading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading = false }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: { username: string; password: string }) => {
    onLogin(values);
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
            <Text className="text-gray-200">
              Access the fabelle kiosk system
            </Text>
          </div>
        </div>

        <div className="p-8">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            className="space-y-6"
          >
            <Form.Item
              name="username"
              label={<Text className="text-lg font-semibold">Username</Text>}
              rules={[
                { required: true, message: "Please enter your username" },
              ]}
            >
              <Input
                prefix={<User size={20} className="text-gray-400" />}
                placeholder="Enter username"
                className="h-14 text-lg rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<Text className="text-lg font-semibold">Password</Text>}
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                prefix={<Lock size={20} className="text-gray-400" />}
                placeholder="Enter password"
                className="h-14 text-lg rounded-xl"
              />
            </Form.Item>

            <Form.Item className="!mb-0 !mt-8">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full bg-[#2d1603] border-[#2d1603] hover:bg-[#3d2613] hover:border-[#3d2613] h-14 text-xl font-semibold rounded-xl"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-6 text-center">
            <Text className="text-gray-500">
              Demo credentials: admin / password
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
