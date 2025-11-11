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
  Modal,
  DatePicker,
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
  useupdateVinculumInvApi,
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

const GrnPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const queryParams = new URLSearchParams(location.search);
  const selectedLocation = queryParams.get("location");

  const loginUserInfo = JSON.parse(localStorage.getItem("userInfo"));

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
    setIsCartOpen(false);
    form.resetFields();
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

  // P A Y M E N T  M E T H O D  C H O S E
  const orderCreatedSuccessHandler = () => {
    setCurrentStep("confirmation");
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

    // console.log(payload)

    createdOrderMutate(payload);
  };

  // const handleFormSubmit = (values: {
  //   qty: any;
  //   po_no: any;
  //   invoice_no: any;
  // }) => {
  //   if (!selectedProduct) return;
  //   console.log("Info---", values, selectedLocation, selectedProduct?.skuCode);
  //   const payload = {
  //     sku: selectedProduct?.skuCode,
  //     location: selectedLocation,
  //     qty: values.qty,
  //     po_no: values.po_no,
  //     invoice_no: values.invoice_no,
  //   };
  //   console.log("payload-->>>", payload);
  //   updateVinculum(payload);
  // };
  const handleFormSubmit = (values: any) => {
    if (!selectedProduct) return;

    console.log(
      "Form Values ---",
      values,
      selectedLocation,
      selectedProduct?.skuCode
    );

    const payload = {
      sku: selectedProduct?.skuCode,
      location: selectedLocation,
      qty: values.qty,
      po_no: values.po_no,
      invoice_no: values.invoice_no,
      bin: values.bin,
      mrp: values.mrp,
      manufacturing_date: values.manufacturing_date
        ? values.manufacturing_date.format("DD/MM/YYYY")
        : "",
      expiry_date: values.expiry_date
        ? values.expiry_date.format("DD/MM/YYYY")
        : "",
    };

    console.log("Final Payload →", payload);
    updateVinculum(payload);
  };

  const handleUpdateClick = (product: never) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // - - - - - - - - - - - - API CALL - - - - - - - - - - - -

  // - - - - - M A I N  C O N T E N T - - - - -

  const { mutate, data, isPending } = useProductListData();
  const totalItems = data?.total || 0;
  const onSuccessHandler = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const { mutate: updateVinculum } = useupdateVinculumInvApi(onSuccessHandler);

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
                            {/* <Button
                              type="primary"
                              size="middle"
                              icon={<Plus size={18} />}
                              onClick={() => addToCart(product)}
                              className="bg-[#2d1603] border-[#2d1603] hover:bg-[#3d2613] hover:border-[#3d2613] px-4 !py-5 text-lg font-medium rounded-lg"
                            >
                              Add to Cart
                            </Button> */}
                            <Button
                              type="primary"
                              className="bg-[#2d1603] border-[#2d1603] hover:bg-[#3d2613] hover:border-[#3d2613]"
                              onClick={() => handleUpdateClick(product)}
                            >
                              Update Vinculum
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
        <Modal
          title={`Update Vinculum - ${selectedProduct?.name || ""}`}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            initialValues={{
              qty: "",
              po_no: "",
              invoice_no: "",
              bin: "",
              mrp: "",
              manufacturing_date: "",
              expiry_date: "",
            }}
          >
            <Form.Item
              label="Enter Quantity"
              name="qty"
              rules={[{ required: true, message: "Please enter quantity" }]}
            >
              <Input type="number" placeholder="Enter quantity" />
            </Form.Item>

            <Form.Item
              label="Enter PO Number"
              name="po_no"
              rules={[{ required: true, message: "Please enter PO number" }]}
            >
              <Input placeholder="Enter PO number" />
            </Form.Item>

            <Form.Item
              label="Enter Invoice Number"
              name="invoice_no"
              rules={[
                { required: true, message: "Please enter invoice number" },
              ]}
            >
              <Input placeholder="Enter invoice number" />
            </Form.Item>

            <Form.Item
              label="Enter Bin"
              name="bin"
              rules={[
                {
                  required: true,
                  message: "Please enter bin name (e.g. GOOD, POSBIN)",
                },
              ]}
            >
              <Input placeholder="Enter bin (e.g. GOOD)" />
            </Form.Item>

            <Form.Item
              label="Enter MRP"
              name="mrp"
              rules={[{ required: true, message: "Please enter MRP" }]}
            >
              <Input type="number" step="0.01" placeholder="Enter MRP" />
            </Form.Item>

            <Form.Item
              label="Manufacturing Date"
              name="manufacturing_date"
              rules={[
                { required: true, message: "Please select manufacturing date" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Select manufacturing date"
              />
            </Form.Item>

            <Form.Item
              label="Expiry Date"
              name="expiry_date"
              rules={[{ required: true, message: "Please select expiry date" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Select expiry date"
              />
            </Form.Item>

            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isPending}
                className="bg-[#2d1603] border-[#2d1603] hover:bg-[#3d2613] hover:border-[#3d2613]"
              >
                Submit
              </Button>
            </div>
          </Form>
        </Modal>
      </div>

      {/* <FullScreenSpin
        tip={paymentLoader ? "Waiting for payment confirmation…" : ""}
        isLoader={
          isPending ||
          paymentLoader ||
          cartPaymentOrderIsPending ||
          (selectedPayment !== "upi" && createdOrderIsPending)
        }
      /> */}
    </div>
  );
};

export default GrnPage;
