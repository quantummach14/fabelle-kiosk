import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  Space,
  Typography,
  message,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
// import Header from "../components/header";
import NoImage from "../assets/no-image.png";
import { FullScreenSpin } from "../components/full-spin";
// import { appConstants } from "../constants";
// import { useProductListData } from "../hooks/useData"; // ✅ your existing hook

const { Title } = Typography;

let searchHit = false;

export default function KioskPOS() {
  const loginUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const [productList, setProductList] = useState([]);
  const [apiPayload, setApiPayload] = useState({
    limit: 10,
    offset: 0,
    search: "",
  });
  const [selectedLocation, setSelectedLocation] = useState(
    loginUserInfo?.location || ""
  );
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();

  // ✅ React Query hook (no change)
  const { mutate, data, isPending } = useProductListData();

  // ✅ Fetch product list from API
  useEffect(() => {
    debounce(() => {
      if (searchHit) setProductList([]);
      searchHit = false;
      mutate({
        location: selectedLocation || loginUserInfo?.location,
        limit: apiPayload.limit,
        offset: apiPayload.offset,
        search: apiPayload.search,
      });
    });
  }, [apiPayload]);

  // ✅ Update UI when data arrives
  useEffect(() => {
    if (data?.data?.length > 0) {
      setProductList((prev) =>
        apiPayload.search?.length > 0 ? data.data : [...prev, ...data.data]
      );
    }
  }, [data]);

  const debounce = (fn) => {
    clearTimeout(debounce.timer);
    debounce.timer = setTimeout(fn, 500);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    searchHit = true;
    setApiPayload({ ...apiPayload, search: val, offset: 0 });
  };

  const loadMore = () => {
    setApiPayload({
      ...apiPayload,
      offset: apiPayload.offset + apiPayload.limit,
    });
  };

  // ✅ Open Drawer with selected product
  const handleOpenForm = (product) => {
    setSelectedProduct(product);
    form.resetFields();
    setOpenDrawer(true);
  };

  // ✅ Handle form submit
  const handleSubmit = (values) => {
    message.success(`Form submitted for ${selectedProduct?.sku_name}`);
    console.log("Form Data:", values);
    console.log("Selected Product:", selectedProduct);
    setOpenDrawer(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Kiosk POS" />

      {isPending ? (
        <FullScreenSpin />
      ) : (
        <div className="p-4">
          {/* 🔍 Search Bar */}
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Search SKU or Product Name"
              onChange={handleSearch}
              style={{ width: 300 }}
            />
            <Select
              placeholder="Select Location"
              value={selectedLocation}
              onChange={(val) => setSelectedLocation(val)}
              style={{ width: 200 }}
              options={appConstants.LOCATION_OPTIONS || []}
              suffixIcon={<ChevronDown size={16} />}
            />
          </div>

          {/* 🧾 Product Cards */}
          <Row gutter={[16, 16]}>
            {productList?.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <Card
                  className="rounded-2xl shadow-sm hover:shadow-lg transition-all"
                  cover={
                    <img
                      src={product.image || NoImage}
                      alt={product.sku_name}
                      className="h-48 w-full object-cover rounded-t-2xl"
                    />
                  }
                >
                  <div className="flex flex-col gap-2">
                    <Title level={5} className="mb-0">
                      {product.sku_name}
                    </Title>
                    <p className="text-sm text-gray-500 mb-1">
                      {product.description || "No description available"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-green-600">
                        ₹{product.mrp}
                      </span>
                      <Button
                        type="primary"
                        onClick={() => handleOpenForm(product)}
                      >
                        Fill Form
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* 📥 Load More */}
          {data?.total > productList?.length && (
            <div className="text-center mt-6">
              <Button type="default" onClick={loadMore}>
                Load More
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 🧾 Drawer Form */}
      <Drawer
        title={
          <span>
            Fill Details —{" "}
            <strong>{selectedProduct?.sku_name || "Selected SKU"}</strong>
          </span>
        }
        width={400}
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Customer Name"
            name="customer_name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              { required: true, message: "Please enter phone number" },
              { len: 10, message: "Enter valid 10-digit number" },
            ]}
          >
            <Input placeholder="Enter phone number" maxLength={10} />
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="qty"
            rules={[{ required: true, message: "Enter quantity" }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item label="Remarks" name="remarks">
            <Input.TextArea placeholder="Optional remarks" rows={3} />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setOpenDrawer(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}
