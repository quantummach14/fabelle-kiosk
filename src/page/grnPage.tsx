import {
  Button,
  Card,
  Drawer,
  InputNumber,
  Form,
  Input,
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
import { v4 as uuidv4 } from "uuid"; // keep if required elsewhere
import { debounce as _debounce } from "../utils/global-func"; // if you have a debounce util
import {
  AppStep,
  GrnCartItem,
  PaymentMethod,
  Product,
} from "../constant/types";
import { cardOptions, stepsArray } from "../constant/app-constant";

const { Option } = Select;
const { Title, Text } = Typography;

const GrnPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Forms: keep separate instances for modal form and final GRN form
  const [grnForm] = Form.useForm();
  const [productForm] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [grnLoader, setGrnLoader] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const selectedLocation = queryParams.get("location");

  // safe parse for localStorage userInfo
  let loginUserInfo: any = { location: null };
  try {
    const raw = localStorage.getItem("userInfo");
    loginUserInfo = raw ? JSON.parse(raw) : { location: null };
  } catch (err) {
    loginUserInfo = { location: null };
  }

  const [grnCart, setGrnCart] = useState<GrnCartItem[]>([]);
  const [currentStep, setCurrentStep] = useState<AppStep>("grnPage");
  const [isGrnCartOpen, setIsGrnCartOpen] = useState(false);

  // - - - - - M A I N  C O N T E N T - - - - -

  const [productsList, setProductList] = useState<any[]>([]);
  const [apiPayload, setApiPayload] = useState({
    limit: 10,
    offset: 0,
    search: "",
  });

  // debounce ref to avoid module-level var
  const searchHitRef = useRef(false);
  const debounceTimerRef = useRef<number | null>(null);

  // header helpers
  const getGRNTotalItems = () =>
    grnCart.reduce((total, item) => total + Number(item.quantity), 0);

  const handleLogout = () => {
    // prefer removing specific keys instead of clearing everything
    localStorage.removeItem("userInfo");
    // If you want to clear more keys, remove them explicitly
    resetGrnApp();
    navigate("/login");
    message.info("Logged out successfully");
  };

  const resetGrnApp = () => {
    setGrnCart([]);
    setCurrentStep("grnPage");
    setIsGrnCartOpen(false);
    grnForm.resetFields();
    productForm.resetFields();
  };

  // search handler
  const searchHandler = (value: string) => {
    searchHitRef.current = true;
    setApiPayload(() => ({
      limit: 10,
      offset: 0,
      search: value,
    }));
  };

  // If you don't need client-side filtering, just return the list
  const getFilteredProducts = () => productsList;

  const loadMoreHandler = () => {
    setApiPayload((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  // --- API hooks
  const { mutate: fetchProducts, data, isPending } = useProductListData();
  const totalItems = data?.total || 0;
  const onSuccessHandler = () => {
    setGrnLoader(false); // 🔥 Stop loader
    resetGrnApp();
  };

  // const { mutate: updateVinculum } = useupdateVinculumInvApi({
  //   onSuccess: onSuccessHandler,
  //   onError: () => {
  //     setGrnLoader(false); // 🔥 Stop loader if API fails
  //   },
  // });

  const { mutate: updateVinculum } = useupdateVinculumInvApi(
  () => {
    setGrnLoader(false);
    resetGrnApp();
  },
  () => {
    setGrnLoader(false);  // ❗ Stop loader on error
    resetGrnApp();
  }
);

  // Debounced fetch effect (safe implementation)
  useEffect(() => {
    // clear previous timer
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    debounceTimerRef.current = window.setTimeout(() => {
      // if searchHitRef was set, we probably want to reset product list client-side
      if (searchHitRef.current) {
        setProductList([]);
        searchHitRef.current = false;
      }
      fetchProducts({
        location: selectedLocation || loginUserInfo.location,
        limit: apiPayload.limit,
        offset: apiPayload.offset,
        search: apiPayload.search,
      });
    }, 300); // 300ms debounce; adjust as needed

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPayload, selectedLocation, fetchProducts]);

  // Update productList when `data` changes
  useEffect(() => {
    const updateProductList =
      data?.data?.map((item: any) => ({
        id: item?.id,
        skuCode: item.sku_code,
        name: item?.sku_name || "N/A",
        price: Number(item?.mrp) || 0,
        image: item?.image || NoImage,
        category: item?.category || "N/A",
        description: item?.description || "N/A",
      })) || [];

    setProductList((prev) =>
      apiPayload?.search?.length > 0
        ? updateProductList
        : [...prev, ...updateProductList]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Form submit for final GRN info
  const handleGrnFormSubmit = (values: any) => {
    // defensive checks
    if (!grnCart.length) {
      message.error("Cart is empty");
      return;
    }
    setGrnLoader(true); // 🔥 Start Loader
    const payload = {
      po_no: values.po_no,
      ext_inbound_no: values.ext_inbound_no,
      invoice_no: values.invoice_no,
      location: selectedLocation,
      items: grnCart.map((item) => ({
        sku: item.sku,
        qty: item.quantity,
        mrp: item.mrp,
        bin: item.bin,
        manufacturing_date: item.manufacturingDate,
        expiry_date: item.expiryDate,
      })),
    };

    console.log("FINAL GRN PAYLOAD:", payload);
    updateVinculum(payload);
  };

  // Product modal form submit
  const handleFormSubmit = (values: any) => {
    if (!selectedProduct) return;

    const payload = {
      sku: selectedProduct?.skuCode,
      id: selectedProduct?.id,
      location: selectedLocation,
      name: selectedProduct?.name,
      qty: values.qty,
      image: selectedProduct?.image,
      bin: values.bin,
      mrp: values.mrp,
      manufacturing_date: values.manufacturing_date
        ? values.manufacturing_date.format?.("DD/MM/YYYY") || ""
        : "",
      expiry_date: values.expiry_date
        ? values.expiry_date.format?.("DD/MM/YYYY") || ""
        : "",
    };

    addToGrn(payload);
    setIsModalOpen(false);
    productForm.resetFields();
  };

  const addToGrn = (payload: any) => {
    setGrnCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === payload.id);

      if (existingItem) {
        message.success(`${payload.name} quantity increased in cart`);
        return prevCart.map((item) =>
          item.id === payload.id
            ? {
                ...item,
                quantity: Number(item.quantity) + Number(payload.qty),
              }
            : item
        );
      }

      message.success(`${payload.name} added to cart`);

      const newItem: GrnCartItem = {
        id: payload.id,
        name: payload.name,
        sku: payload.sku,
        mrp: Number(payload.mrp) || 0,
        bin: payload.bin,
        manufacturingDate: payload.manufacturing_date || "",
        expiryDate: payload.expiry_date || "",
        image: payload.image || "",
        category: payload.category || "",
        description: payload.description || "",
        quantity: Number(payload.qty),
      };

      return [...prevCart, newItem];
    });
  };

  // Accept both string|number ids to be safe
  const handleUpdateClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    productForm.resetFields();
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      setGrnCart((prevCart) => prevCart.filter((item) => item.id !== id));
    } else {
      setGrnCart((prevCart) =>
        prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };
  const getTotalPrice = () =>
    grnCart.reduce((total, item) => total + item.mrp * item.quantity, 0);

  const handleCheckout = () => {
    if (grnCart.length > 0) {
      setIsGrnCartOpen(false);
      setCurrentStep("grnfinal");
    } else {
      message.info("Cart is empty");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <Header
        currentStep={currentStep}
        getGRNTotalItems={getGRNTotalItems}
        handleLogout={handleLogout}
        resetGrnApp={resetGrnApp}
        setCurrentStep={setCurrentStep}
        setIsGrnCartOpen={setIsGrnCartOpen}
      />

      <div className="flex-1 p-8">
        {/* Back Button */}
        {currentStep !== "grnPage" && (
          <Button
            type="text"
            size="large"
            icon={<ArrowLeft size={24} />}
            onClick={() => {
              if (currentStep === "grnfinal") setCurrentStep("grnPage");
            }}
            className="text-black  border-none"
          >
            Back
          </Button>
        )}

        {currentStep === "grnPage" && (
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
                              onClick={() => handleUpdateClick(product)}
                              className="bg-[#2d1603] border-[#2d1603] hover:bg-[#3d2613] hover:border-[#3d2613] px-4 !py-5 text-lg font-medium rounded-lg"
                            >
                              Add to GRN
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

        {currentStep === "grnfinal" && (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg rounded-2xl">
              <div className="p-8">
                <Title level={2} className="text-center !text-[#2d1603] !mb-8">
                  GRN Information
                </Title>
                <Form
                  form={grnForm}
                  layout="vertical"
                  onFinish={handleGrnFormSubmit}
                  initialValues={{
                    po_no: "",
                    invoice_no: "",
                    ext_inbound_no: "",
                  }}
                  size="large"
                  className="space-y-6"
                >
                  <Form.Item
                    label="Enter PO Number"
                    name="po_no"
                    rules={[
                      { required: true, message: "Please enter PO number" },
                    ]}
                  >
                    <Input placeholder="Enter PO number" />
                  </Form.Item>

                  <Form.Item
                    label="Enter Invoice Number"
                    name="invoice_no"
                    rules={[
                      {
                        required: true,
                        message: "Please enter invoice number",
                      },
                    ]}
                  >
                    <Input placeholder="Enter external inbound number" />
                  </Form.Item>

                  <Form.Item
                    label="Enter External Inbound Number"
                    name="ext_inbound_no"
                    rules={[
                      {
                        required: true,
                        message: "Please enter external inbound number",
                      },
                    ]}
                  >
                    <Input placeholder="Enter external inbound number" />
                  </Form.Item>

                  <Form.Item className="!mb-0 !mt-8">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      className="w-full bg-[#2d1603] border-[#2d1603] hover:bg-[#3d2613] hover:border-[#3d2613] h-14 text-xl font-semibold rounded-xl"
                    >
                      Continue to GRN
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </Card>
          </div>
        )}

        {/* Modal for product add */}
        <Modal
          title={`GRN - ${selectedProduct?.name || ""}`}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnClose
        >
          <Form
            form={productForm}
            layout="vertical"
            onFinish={handleFormSubmit}
            initialValues={{
              qty: "",
              bin: "",
              mrp: "",
              manufacturing_date: null,
              expiry_date: null,
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

      {/* Cart Drawer */}
      <Drawer
        title={
          <Title level={3} className="!text-white !mb-0">
            Your GRN Cart
          </Title>
        }
        placement="right"
        onClose={() => setIsGrnCartOpen(false)}
        open={isGrnCartOpen}
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
            {grnCart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart
                  size={64}
                  className="mx-auto text-gray-300 mb-4"
                />
                <Text className="text-lg text-gray-500">
                  Your Grn cart is empty
                </Text>
              </div>
            ) : (
              <Space direction="vertical" size="large" className="w-full">
                {grnCart.map((item) => (
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

          {grnCart.length > 0 && (
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
                Proceed to GRN
              </Button>
            </div>
          )}
        </div>
      </Drawer>

      <FullScreenSpin
        tip={grnLoader ? "Updating GRN details…" : ""}
        isLoader={grnLoader}
      />
    </div>
  );
};

export default GrnPage;
