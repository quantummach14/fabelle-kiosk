import { useNavigate } from "react-router-dom";
import { Button, Form, Input, InputNumber, DatePicker, Select, Divider, Tag } from "antd";
import {
  ArrowLeft,
  PackagePlus,
  Tag as TagIcon,
  ScanBarcode,
  IndianRupee,
  CalendarDays,
  MapPin,
  Save,
} from "lucide-react";
import dayjs from "dayjs";
import Header from "../components/Header";
import { useCreateProduct } from "../reactQuery/hooks/product-master";

const { Option } = Select;

const SectionLabel = ({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-9 h-9 rounded-lg bg-[#fdf4ea] text-[#2d1603] flex items-center justify-center shrink-0">
      <Icon size={18} />
    </div>
    <div>
      <div className="text-[#2d1603] font-semibold leading-tight">{title}</div>
      <div className="text-gray-400 text-xs leading-tight">{subtitle}</div>
    </div>
  </div>
);

const AddProductPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  let loginUserInfo: any = { location: null };
  try {
    const raw = localStorage.getItem("userInfo");
    loginUserInfo = raw ? JSON.parse(raw) : { location: null };
  } catch (err) {
    loginUserInfo = { location: null };
  }

  const mrpValue = Form.useWatch("mrp", form);
  const sellingPriceValue = Form.useWatch("selling_price", form);
  const mfgDateValue = Form.useWatch("manufacturing_date", form);
  const expiryDateValue = Form.useWatch("expiry_date", form);

  const discountPercent =
    typeof mrpValue === "number" && typeof sellingPriceValue === "number" && mrpValue > 0
      ? Math.round(((mrpValue - sellingPriceValue) / mrpValue) * 100)
      : null;

  const shelfLifeDays =
    mfgDateValue && expiryDateValue && expiryDateValue.isAfter(mfgDateValue, "day")
      ? expiryDateValue.diff(mfgDateValue, "day")
      : null;

  const { mutate: createProductMutate, isPending } = useCreateProduct(() => {
    form.resetFields();
    navigate("/home");
  });

  const handleSave = () => {
    form.validateFields().then((values) => {
      createProductMutate({
        sku_code: values.sku_code.trim(),
        sku_name: values.sku_name.trim(),
        ean_code: values.ean_code.trim(),
        mrp: values.mrp,
        selling_price: values.selling_price,
        manufacturing_date: values.manufacturing_date.format("YYYY-MM-DD"),
        expiry_date: values.expiry_date.format("YYYY-MM-DD"),
        location: values.location,
      });
    });
  };

  const handleCancel = () => {
    form.resetFields();
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentStep="addProduct"
        setCurrentStep={() => {}}
        handleLogout={() => {
          localStorage.clear();
          navigate("/login");
        }}
      />

      <div className="max-w-3xl mx-auto px-8 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2d1603] transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
          {/* Hero banner */}
          <div className="relative bg-gradient-to-br from-[#2d1603] via-[#4a2a10] to-[#7a4a1f] px-8 py-8 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-56 h-56 bg-white opacity-5 rounded-full blur-2xl" />
            <div className="absolute -bottom-16 -left-10 w-64 h-64 bg-[#f3d1a4] opacity-10 rounded-full blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                <PackagePlus size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold m-0">Add Product</h1>
                <p className="text-white/70 text-sm m-0">
                  Register a new SKU into the Fabelle product master
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <Form
              form={form}
              layout="vertical"
              initialValues={{ location: loginUserInfo?.location || undefined }}
            >
              <SectionLabel
                icon={MapPin}
                title="Store"
                subtitle="Which store's catalog does this product belong to"
              />
              <Form.Item
                name="location"
                rules={[{ required: true, message: "Store location is required" }]}
              >
                <Select placeholder="Select store" size="large">
                  <Option value="FCW">Mumbai (FCW)</Option>
                  <Option value="FCB">Bangalore (FCB)</Option>
                </Select>
              </Form.Item>

              <Divider className="!my-6" />

              <SectionLabel
                icon={TagIcon}
                title="Product Identity"
                subtitle="How this product is identified across the catalog"
              />
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="sku_code"
                  label="SKU Code"
                  rules={[{ required: true, message: "SKU code is required" }]}
                >
                  <Input size="large" placeholder="e.g. FCH10801P" />
                </Form.Item>
                <Form.Item
                  name="ean_code"
                  label="EAN / Barcode"
                  rules={[{ required: true, message: "EAN code is required" }]}
                >
                  {/* Plain text input, not a number field — leading zeros in the EAN
                      code must survive exactly as typed. */}
                  <Input
                    size="large"
                    prefix={<ScanBarcode size={16} className="text-gray-400 mr-1" />}
                    placeholder="e.g. 8901725105730"
                  />
                </Form.Item>
              </div>
              <Form.Item
                name="sku_name"
                label="SKU Name"
                rules={[{ required: true, message: "SKU name is required" }]}
              >
                <Input size="large" placeholder="e.g. Fabelle Rocky Road Bar" />
              </Form.Item>

              <Divider className="!my-6" />

              <SectionLabel
                icon={IndianRupee}
                title="Pricing"
                subtitle="Selling price can't exceed MRP"
              />
              <div className="grid grid-cols-2 gap-4 items-start">
                <Form.Item
                  name="mrp"
                  label="MRP (₹)"
                  rules={[
                    { required: true, message: "MRP is required" },
                    { type: "number", min: 0, message: "MRP must be 0 or more" },
                  ]}
                >
                  <InputNumber size="large" min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  name="selling_price"
                  label="Selling Price (₹)"
                  dependencies={["mrp"]}
                  rules={[
                    { required: true, message: "Selling price is required" },
                    { type: "number", min: 0, message: "Selling price must be 0 or more" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const mrp = getFieldValue("mrp");
                        if (value === undefined || mrp === undefined || value <= mrp) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Selling price cannot be greater than MRP"));
                      },
                    }),
                  ]}
                >
                  <InputNumber size="large" min={0} style={{ width: "100%" }} />
                </Form.Item>
              </div>
              {discountPercent !== null && (
                <div className="-mt-2 mb-4">
                  {discountPercent > 0 ? (
                    <Tag color="green" className="px-3 py-1 rounded-full text-sm">
                      {discountPercent}% off MRP
                    </Tag>
                  ) : (
                    <Tag className="px-3 py-1 rounded-full text-sm">No discount</Tag>
                  )}
                </div>
              )}

              <Divider className="!my-6" />

              <SectionLabel
                icon={CalendarDays}
                title="Shelf Life"
                subtitle="Expiry must fall after the manufacturing date"
              />
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="manufacturing_date"
                  label="Manufacturing Date"
                  rules={[{ required: true, message: "Manufacturing date is required" }]}
                >
                  <DatePicker
                    size="large"
                    style={{ width: "100%" }}
                    disabledDate={(d) => d.isAfter(dayjs())}
                  />
                </Form.Item>
                <Form.Item
                  name="expiry_date"
                  label="Expiry Date"
                  dependencies={["manufacturing_date"]}
                  rules={[
                    { required: true, message: "Expiry date is required" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const mfgDate = getFieldValue("manufacturing_date");
                        if (!value || !mfgDate || value.isAfter(mfgDate, "day")) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Expiry date must be after manufacturing date"));
                      },
                    }),
                  ]}
                >
                  <DatePicker size="large" style={{ width: "100%" }} />
                </Form.Item>
              </div>
              {shelfLifeDays !== null && (
                <div className="-mt-2 mb-2">
                  <Tag color="gold" className="px-3 py-1 rounded-full text-sm">
                    Shelf life: {shelfLifeDays} days
                  </Tag>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <Button size="large" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  size="large"
                  type="primary"
                  icon={<Save size={16} />}
                  loading={isPending}
                  onClick={handleSave}
                  style={{ backgroundColor: "#2d1603", borderColor: "#2d1603" }}
                >
                  Save Product
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;
