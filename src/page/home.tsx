import {
  Button,
  Card,
  Drawer,
  InputNumber,
  Form,
  Input,
  Result,
  Typography,
  Row,
  Col,
  Space,
  message,
  Select,
} from "antd";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Check,
  Coffee,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useCartPaymentOrder,
  useCreateOrder,
  usePaymentLinkSend,
  useProductListData,
} from "../reactQuery/hooks/product";
import NoImage from "../assets/noProductImage.png";
import { FullScreenSpin } from "../components/full-spin";
import { v4 as uuidv4 } from "uuid";
import { io } from "socket.io-client";
import { debounce } from "../utils/global-func";
import { AppStep, CartItem, PaymentMethod, Product } from "../constant/types";
import { cardOptions, stepsArray } from "../constant/app-constant";
const { Option } = Select;
const { Title, Text } = Typography;

let searchHit = false;

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const selectedLocation = queryParams.get("location");

  const loginUserInfo = JSON.parse(localStorage.getItem("userInfo"));

  const orderId = "ORD" + uuidv4();
  const clientId = "CLIENT" + uuidv4();

  // - - - - - - - - - - S T A T E - - - - - - - - - -

  // - - - - - H E A D E R - - - - -

  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState<AppStep>("products");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // - - - - - M A I N  C O N T E N T - - - - -

  const [productsList, setProductList] = useState([]);
  const [apiPayload, setApiPayload] = useState({
    limit: 10,
    offset: 0,
    search: "",
  });

  // - - - - - F O R M - - - - -

  const [form] = Form.useForm();

  // P A Y M E N T  M E T H O D  C H O S E

  let cancelOrderSocket = useRef(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [paymentLoader, setPaymentLoader] = useState(false);

  // - - - - - - - - - - F U N C T I O N S - - - - - - - - - -

  // - - - - - H E A D E R - - - - -
  const getTotalItems = () =>
    cart.reduce((total, item) => total + item.quantity, 0);
  const handleLogout = () => {
    localStorage.clear();
    resetApp();
    navigate("/login");
    message.info("Logged out successfully");
  };

  const resetApp = () => {
    setCart([]);
    setCurrentStep("products");
    setSelectedPayment(null);
    setIsCartOpen(false);
    form.resetFields();
  };

  // - - - - - P R O G R E S S  S T E P S - - - - -

  const getStepNumber = () => {
    switch (currentStep) {
      case "products":
        return 0;
      case "userInfo":
        return 1;
      case "payment":
        return 2;
      case "confirmation":
        return 3;
      default:
        return 0;
    }
  };

  // - - - - - M A I N  C O N T E N T - - - - -
  const searchHandler = (e) => {
    searchHit = true;
    setApiPayload(() => ({
      limit: 10,
      offset: 0,
      search: e,
    }));
  };

  const getFilteredProducts = () =>
    productsList.filter((product) => {
      return product;
    });

  const loadMoreHandler = () => {
    setApiPayload((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit, // 👈 increment by limit
    }));
  };

  // - - - - - - - - - - F O R M - - - - - - - - - -

  const handleUserInfoSubmit = () => {
    setCurrentStep("payment");
  };

  // P A Y M E N T  M E T H O D  C H O S E

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        message.success(`${product.name} quantity increased in cart`);
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      message.success(`${product.name} added to cart`);
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const orderCreatedSuccessHandler = () => {
    setPaymentLoader(false);
    setCurrentStep("confirmation");
  };

  const handlePaymentSubmit = () => {
    if (selectedPayment) {
      const values = form.getFieldsValue(true);
      const payload = {
        orderId,
        cust_name: values.name,
        cust_phone: values.mobile,
        cust_email: values.email,
        amount: getTotalPrice(),
        clientId,
      };
      paymentLinkSentMutate(payload);
    }
  };

  const orderCreatedHandler = (lastOrderId = null) => {
    const values = form.getFieldsValue(true);
    const payload = {
      orderId: lastOrderId || orderId,
      userId: loginUserInfo.id,
      custName: values.name,
      custPhone: values.mobile,
      custEmail: values.email,
      custAddress: values.address,
      custCity: values.city,
      custState: values.state,
      paymentMode: selectedPayment,
      custPincode: values.pincode,
      channelName: values.channel,
      amount: getTotalPrice(),
      location: loginUserInfo.location,
      items: cart.map((item) => ({
        skuCode: item.skuCode,
        skuName: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };
    
    createdOrderMutate(payload);
  };

  const sendPaymentLinkHandler = () => {
    if (selectedPayment === "upi") {
      cancelOrderSocket.current = io(
        import.meta.env.VITE_API_SERVER_LINK_SOCKET,
        {
          path: "/fabelle_backend/api/socket.io",
        }
      );
      cancelOrderSocket.current.on("connect", () => {
        cancelOrderSocket.current.emit("register", {
          clientId: clientId,
        }); // Register client ID on connection
      });
      cancelOrderSocket.current.on("on_register", (msg) => {
        if (msg === "success") {
          (async () => {
            handlePaymentSubmit();
          })();
        }
      });
      let timeoutId2 = setTimeout(() => {
        // toast.error("Cannot cancel at the moment, try again later");
        cancelOrderSocket.current.emit("disconnectClient", clientId);
        cancelOrderSocket.current.disconnect();
        cancelOrderSocket.current = null;
      }, 900000);
      // on_update
      cancelOrderSocket.current.on("on_payment_response", () => {
        orderCreatedHandler();
        clearTimeout(timeoutId2);
        cancelOrderSocket.current.emit("disconnectClient", clientId);
        cancelOrderSocket.current.disconnect();
        cancelOrderSocket.current = null;
      });
    } else if (selectedPayment === "card") {
      const values = form.getFieldsValue(true);
      const payload = {
        orderId,
        amount: getTotalPrice(),
        custPhone: values.mobile,
      };
      cartPaymentOrderMutate(payload);
    } else {
      orderCreatedHandler();
    }
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  // - - - - - - - - - - - - API CALL - - - - - - - - - - - -

  // - - - - - M A I N  C O N T E N T - - - - -

  const { mutate, data, isPending } = useProductListData();
  const totalItems = data?.total || 0;

  // P A Y M E N T  M E T H O D  C H O S E

  const { mutate: paymentLinkSentMutate, isPending: paymentLinkSentLoader } =
    usePaymentLinkSend(setPaymentLoader);

  const { mutate: createdOrderMutate, isPending: createdOrderIsPending } =
    useCreateOrder(orderCreatedSuccessHandler);

  const {
    mutate: cartPaymentOrderMutate,
    isPending: cartPaymentOrderIsPending,
  } = useCartPaymentOrder(orderCreatedHandler);

  //  - - - - - - - - - - - - O T H E R - - - - - - - - - - - -

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length > 0) {
      setIsCartOpen(false);
      setCurrentStep("userInfo");
    }
  };

  useEffect(() => {
    debounce(() => {
      if (searchHit) {
        setProductList([]);
      }
      searchHit = false;
      mutate({
        location: selectedLocation || loginUserInfo.location,
        limit: apiPayload.limit,
        offset: apiPayload.offset,
        search: apiPayload.search,
      });
    });
  }, [apiPayload]);

  useEffect(() => {
    const updateProductList =
      data?.data?.map((item) => ({
        id: item?.id,
        skuCode: item.sku_code,
        name: item?.sku_name || "N/A",
        price: Number(item?.mrp) || 0,
        image: item?.image || NoImage,
        category: item?.category || "N/A",
        description: item?.description || "N/A",
      })) || [];
    setProductList((pre) =>
      apiPayload?.search?.length > 0
        ? updateProductList
        : [...pre, ...updateProductList]
    );
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <Header
        currentStep={currentStep}
        getTotalItems={getTotalItems}
        handleLogout={handleLogout}
        resetApp={resetApp}
        setCurrentStep={setCurrentStep}
        setIsCartOpen={setIsCartOpen}
      />

      {/* Progress Steps */}
      {currentStep !== "products" && (
        <div className="bg-gradient-to-r from-[#2d1603] to-[#3d2613] py-12 px-8 shadow-2xl">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center">
              {stepsArray.map((item, index) => (
                <div key={item.step} className="flex items-center relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${
                        getStepNumber() > item.step
                          ? "bg-green-500 text-white shadow-2xl scale-110"
                          : getStepNumber() === item.step
                          ? "bg-white text-[#2d1603] shadow-2xl scale-110 ring-4 ring-white ring-opacity-50"
                          : "bg-[#4d3623] text-gray-400 shadow-lg"
                      }`}
                    >
                      {getStepNumber() > item.step ? (
                        <div className="relative">
                          <Check size={20} className="drop-shadow-sm" />
                        </div>
                      ) : (
                        <item.icon size={20} className="drop-shadow-sm" />
                      )}
                      {getStepNumber() === item.step && (
                        <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-pulse"></div>
                      )}
                    </div>
                    <Text
                      className={`mt-4 font-bold text-lg transition-all duration-300 ${
                        getStepNumber() > item.step
                          ? "text-green-300"
                          : getStepNumber() === item.step
                          ? "text-white"
                          : "text-gray-500"
                      }`}
                    >
                      {item.title}
                    </Text>
                    {getStepNumber() === item.step && (
                      <div className="mt-2 w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    )}
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-32 h-2 mx-8 rounded-full transition-all duration-500 relative overflow-hidden ${
                        getStepNumber() > item.step
                          ? "bg-green-500 shadow-lg"
                          : "bg-[#4d3623]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}

      <div className="flex-1 p-8">
        {/* BACK BUTTON */}
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
            className="text-black  border-none"
          >
            Back
          </Button>
        )}

        {currentStep === "products" && (
          <div className="max-w-7xl mx-auto">
            <SearchBar
              searchTerm={apiPayload.search}
              onSearchChange={searchHandler}
            />

            <Row gutter={[24, 24]}>
              {getFilteredProducts().length === 0 ? (
                <Col span={24}>
                  <div className="text-center py-16">
                    <Coffee size={64} className="mx-auto text-gray-300 mb-4" />
                    <Title level={3} className="text-gray-500">
                      No products found
                    </Title>
                    <Text className="text-gray-400">
                      Try adjusting your search or filter criteria
                    </Text>
                  </div>
                </Col>
              ) : (
                <>
                  {getFilteredProducts().map((product) => (
                    <Col key={product.id} xs={24} sm={12} lg={8} xl={6}>
                      <Card
                        hoverable
                        className="h-full shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl overflow-hidden"
                        cover={
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        }
                        actions={[
                          <div
                            className="flex justify-end w-full pr-4"
                            key="add"
                          >
                            <Button
                              type="primary"
                              size="middle"
                              icon={<Plus size={18} />}
                              onClick={() => addToCart(product)}
                              className="bg-[#2d1603] border-[#2d1603] hover:bg-[#3d2613] hover:border-[#3d2613] px-4 !py-5 text-lg font-medium rounded-lg"
                            >
                              Add to Cart
                            </Button>
                          </div>,
                        ]}
                      >
                        <div className="">
                          <div className="!mb-2 text-lg font-semibold !text-gray-800">
                            {product?.name}
                          </div>
                          <Text className="text-gray-600 text-sm mb-3 block" />
                          <Title level={3} className="!mb-0 !text-[#2d1603]">
                            ₹{product?.price?.toFixed(2)}
                          </Title>
                        </div>
                      </Card>
                    </Col>
                  ))}
                  {totalItems !== productsList?.length && (
                    <div className="w-full flex justify-center items-center mt-2">
                      <Button
                        key="add"
                        type="primary"
                        size="middle"
                        icon={<ChevronDown size={20} />}
                        onClick={loadMoreHandler}
                        className="bg-[#2d1603] border-[#2d1603] hover:bg-[#3d2613] hover:border-[#3d2613] mx-4 h-12 text-lg font-semibold rounded-xl"
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Row>
          </div>
        )}

        {/* F O R M */}

        {currentStep === "userInfo" && (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg rounded-2xl">
              <div className="p-8">
                <Title level={2} className="text-center !text-[#2d1603] !mb-8">
                  Customer Information
                </Title>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUserInfoSubmit}
                  size="large"
                  className="space-y-6"
                >
                  {/* Full Name */}
                  <Form.Item
                    name="name"
                    label={
                      <Text className="text-lg font-semibold">Full Name</Text>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter your full name",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter your full name"
                      className="h-14 text-lg rounded-xl"
                    />
                  </Form.Item>

                  {/* Mobile Number */}
                  <Form.Item
                    name="mobile"
                    label={
                      <Text className="text-lg font-semibold">
                        Mobile Number
                      </Text>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter your mobile number",
                      },
                      {
                        pattern: /^\d{10,}$/,
                        message: "Please enter a valid mobile number",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter your mobile number"
                      className="h-14 text-lg rounded-xl"
                    />
                  </Form.Item>

                  {/* Address */}
                  <Form.Item
                    name="address"
                    label={
                      <Text className="text-lg font-semibold">Address</Text>
                    }
                    rules={[
                      { required: true, message: "Please enter your address" },
                    ]}
                  >
                    <Input.TextArea
                      placeholder="Enter your complete address"
                      className="text-lg rounded-xl"
                      rows={3}
                    />
                  </Form.Item>

                  {/* City and State */}
                  <div className="grid grid-cols-2 gap-6">
                    <Form.Item
                      name="city"
                      label={
                        <Text className="text-lg font-semibold">City</Text>
                      }
                      rules={[
                        { required: true, message: "Please enter your city" },
                      ]}
                    >
                      <Input
                        placeholder="Enter your city"
                        className="h-14 text-lg rounded-xl"
                      />
                    </Form.Item>

                    <Form.Item
                      name="state"
                      label={
                        <Text className="text-lg font-semibold">State</Text>
                      }
                      rules={[
                        { required: true, message: "Please enter your state" },
                      ]}
                    >
                      <Input
                        placeholder="Enter your state"
                        className="h-14 text-lg rounded-xl"
                      />
                    </Form.Item>
                  </div>

                  {/* Pincode */}
                  <Form.Item
                    name="pincode"
                    label={
                      <Text className="text-lg font-semibold">Pincode</Text>
                    }
                    rules={[
                      { required: true, message: "Please enter your pincode" },
                      {
                        pattern: /^\d{5,6}$/,
                        message: "Pincode must be 5 or 6 digits",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter your pincode"
                      className="h-14 text-lg rounded-xl"
                    />
                  </Form.Item>

                  {/* Email */}
                  <Form.Item
                    name="email"
                    label={<Text className="text-lg font-semibold">Email</Text>}
                    rules={[
                      { required: true, message: "Please enter your email" },
                      {
                        type: "email",
                        message: "Please enter a valid email address",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter your email"
                      className="h-14 text-lg rounded-xl"
                    />
                  </Form.Item>

                  {/* Channel Name */}
                  <Form.Item
                    name="channel"
                    label={
                      <Text className="text-lg font-semibold">
                        Channel Name
                      </Text>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please select your channel name",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select channel name"
                      size="large"
                      className="text-lg rounded-xl"
                      style={{
                        height: "56px", // exact same as h-14
                        borderRadius: "12px",
                      }}
                      dropdownStyle={{
                        borderRadius: "12px",
                      }}
                    >
                      <Option value="kiosk">Kiosk</Option>
                      <Option value="swiggy">Swiggy</Option>
                      <Option value="zomato">Zomato</Option>
                    </Select>
                  </Form.Item>
                  {/* Submit Button */}
                  <Form.Item className="!mb-0 !mt-8">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      className="w-full bg-[#2d1603] border-[#2d1603] hover:bg-[#3d2613] hover:border-[#3d2613] h-14 text-xl font-semibold rounded-xl"
                    >
                      Continue to Payment
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </Card>
          </div>
        )}

        {currentStep === "payment" && (
          <div className="max-w-6xl mx-auto">
            <Card className="shadow-xl rounded-3xl border-0">
              <div className="p-12">
                <Title level={2} className="text-center !text-[#2d1603] !mb-8">
                  Select Payment Method
                </Title>
                <div className="flex justify-center items-center min-h-[400px]">
                  <div className="max-w-screen-md w-full">
                    <Row justify="center" gutter={[32, 32]} className="mb-12">
                      {cardOptions.map((method) => (
                        <Col key={method.id} xs={24} sm={16} md={12} lg={8}>
                          <div
                            onClick={() =>
                              setSelectedPayment(method.id as PaymentMethod)
                            }
                            className={`cursor-pointer transition-all duration-300 rounded-3xl border-3 p-8 text-center h-64 flex flex-col justify-center ${
                              selectedPayment === method.id
                                ? "border-[#2d1603] bg-[#2d1603] text-white shadow-2xl transform scale-105"
                                : `${method.color} hover:shadow-xl hover:transform hover:scale-102`
                            }`}
                          >
                            <method.icon
                              size={64}
                              className={`mx-auto mb-6 ${
                                selectedPayment === method.id
                                  ? "text-white"
                                  : "text-gray-600"
                              }`}
                            />
                            <Title
                              level={3}
                              className={`!mb-3 ${
                                selectedPayment === method.id
                                  ? "!text-white"
                                  : "!text-gray-800"
                              }`}
                            >
                              {method.label}
                            </Title>
                            <Text
                              className={`text-lg ${
                                selectedPayment === method.id
                                  ? "text-gray-200"
                                  : "text-gray-600"
                              }`}
                            >
                              {method.description}
                            </Text>
                            {selectedPayment === method.id && (
                              <div className="mt-4">
                                <Check
                                  size={32}
                                  className="mx-auto text-white bg-white bg-opacity-20 rounded-full p-1"
                                />
                              </div>
                            )}
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </div>

                {selectedPayment && (
                  <div className="text-center">
                    <Button
                      type="primary"
                      size="large"
                      loading={paymentLinkSentLoader}
                      onClick={sendPaymentLinkHandler}
                      className="bg-[#2d1603] border-[#2d1603] hover:bg-[#3d2613] hover:border-[#3d2613] h-16 px-12 text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {selectedPayment === "upi"
                        ? "Send Payment Link"
                        : "Create Order"}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {currentStep === "confirmation" && (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg rounded-2xl">
              <Result
                icon={
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check size={48} className="text-green-600" />
                  </div>
                }
                title={
                  <Title level={2} className="!text-[#2d1603] !mb-4">
                    {selectedPayment === "upi"
                      ? "Payment Successful!"
                      : "Order Created Successfully"}
                  </Title>
                }
                subTitle={
                  <div className="space-y-4">
                    <Text className="text-lg text-gray-500 block">
                      {selectedPayment === "upi"
                        ? "Payment done and order has been created successfully."
                        : null}
                    </Text>
                  </div>
                }
                extra={
                  <Button
                    type="primary"
                    size="large"
                    onClick={resetApp}
                    className="bg-[#2d1603] border-[#2d1603] hover:bg-[#3d2613] hover:border-[#3d2613] h-14 px-12 text-xl font-semibold rounded-xl"
                  >
                    Start New Order
                  </Button>
                }
              />
            </Card>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <Drawer
        title={
          <Title level={3} className="!text-white !mb-0">
            Your Cart
          </Title>
        }
        placement="right"
        onClose={() => setIsCartOpen(false)}
        open={isCartOpen}
        width={500}
        headerStyle={{
          backgroundColor: "#2d1603",
          borderBottom: "none",
        }}
        bodyStyle={{ padding: 0 }}
        closeIcon={<X size={24} className="text-white" />}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart
                  size={64}
                  className="mx-auto text-gray-300 mb-4"
                />
                <Text className="text-lg text-gray-500">
                  Your cart is empty
                </Text>
              </div>
            ) : (
              <Space direction="vertical" size="large" className="w-full">
                {cart.map((item) => (
                  <Card key={item.id} size="small" className="shadow-sm">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <Title level={5} className="!mb-1">
                          {item.name}
                        </Title>
                        <Text className="text-[#2d1603] font-bold text-lg">
                          ₹{item.price.toFixed(2)}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="small"
                          icon={<Minus size={16} />}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center"
                        />
                        <InputNumber
                          min={0}
                          value={item.quantity}
                          onChange={(value) =>
                            updateQuantity(item.id, value || 0)
                          }
                          className="w-16 text-center"
                          controls={false}
                        />
                        <Button
                          size="small"
                          icon={<Plus size={16} />}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center bg-[#2d1603] border-[#2d1603] text-white hover:bg-[#3d2613] hover:border-[#3d2613]"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </Space>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <Title level={3} className="!mb-0">
                  Total:
                </Title>
                <Title level={3} className="!mb-0 !text-[#2d1603]">
                  ₹{getTotalPrice().toFixed(2)}
                </Title>
              </div>
              <Button
                type="primary"
                size="large"
                onClick={handleCheckout}
                className="w-full bg-[#2d1603] border-[#2d1603] hover:bg-[#3d2613] hover:border-[#3d2613] h-12 text-lg font-semibold rounded-xl"
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </Drawer>

      <FullScreenSpin
        tip={paymentLoader ? "Waiting for payment confirmation…" : ""}
        isLoader={
          isPending ||
          paymentLoader ||
          cartPaymentOrderIsPending ||
          (selectedPayment !== "upi" && createdOrderIsPending)
        }
      />
    </div>
  );
};

export default Home;
