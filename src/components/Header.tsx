import { Badge, Button, Typography } from "antd";
import { ArrowLeft, LogOut, ShoppingCart } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

const { Title } = Typography;

type AppStep = "products" | "userInfo" | "payment" | "confirmation";
type HeaderProps = {
  currentStep: string;
  setCurrentStep: Dispatch<SetStateAction<AppStep>>;
  resetApp: () => void;
  getTotalItems: () => number;
  setIsCartOpen: (open: boolean) => void;
  handleLogout: () => void;
};

const Header = ({
  currentStep,
  setCurrentStep,
  resetApp,
  getTotalItems,
  setIsCartOpen,
  handleLogout,
}: HeaderProps) => {
  return (
<div className="bg-gradient-to-br from-[#2d1603] via-[#6b3e26] to-[#b87333] text-white py-6 px-8 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          {currentStep !== "products" && (
            <Button
              type="text"
              size="large"
              icon={<ArrowLeft size={24} />}
              onClick={() => {
                if (currentStep === "userInfo") setCurrentStep("products");
                else if (currentStep === "payment") setCurrentStep("userInfo");
                else if (currentStep === "confirmation") resetApp();
              }}
              className="text-white  border-none"
            />
          )}
          <Title level={2} className="!text-white !mb-0">
            Fabelle Kiosk
          </Title>
        </div>

        <div className="flex items-center gap-4">
          {currentStep === "products" && (
            <Badge
              count={getTotalItems()}
              size="default"
              className="[&_.ant-badge-count]:bg-red-500"
            >
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCart size={24} />}
                onClick={() => setIsCartOpen(true)}
                className="bg-white text-[#2d1603] border-white hover:bg-gray-100 hover:border-gray-100 h-12 px-6 text-lg font-semibold"
              >
                Cart ({getTotalItems()})
              </Button>
            </Badge>
          )}
          <Button
            type="text"
            size="large"
            icon={<LogOut size={24} />}
            onClick={handleLogout}
            className="text-white hover:bg-[#3d2613] border-none h-12 px-4"
            title="Logout"
          ></Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
