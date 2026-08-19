import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Typography,
  Tag,
} from "antd";
import { Plus } from "lucide-react";
import dayjs from "dayjs";
import Header from "../components/Header";
import { FullScreenSpin } from "../components/full-spin";
import {
  useCoupons,
  useCreateCoupon,
  useToggleCoupon,
} from "../reactQuery/hooks/coupon";
import { Coupon } from "../constant/types";

const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const CouponsPage = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { mutate: fetchCoupons, isPending: listLoading } = useCoupons();
  const { mutate: createCouponMutate, isPending: createLoading } =
    useCreateCoupon(() => {
      setIsModalOpen(false);
      form.resetFields();
      loadCoupons();
    });
  const { mutate: toggleCouponMutate } = useToggleCoupon(() => loadCoupons());

  const loadCoupons = () => {
    fetchCoupons(undefined, {
      onSuccess: (res) => {
        setCoupons(res?.data || []);
      },
    });
  };

  useEffect(() => {
    loadCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateCoupon = () => {
    form.validateFields().then((values) => {
      const [validFrom, validUntil] = values.validity || [];
      createCouponMutate({
        code: values.code,
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        min_order_value: values.min_order_value || 0,
        max_discount_amount: values.max_discount_amount || null,
        usage_limit: values.usage_limit || null,
        valid_from: validFrom ? validFrom.toISOString() : null,
        valid_until: validUntil ? validUntil.toISOString() : null,
        description: values.description || null,
      });
    });
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <Tag color="#2d1603">{text}</Tag>,
    },
    {
      title: "Discount",
      key: "discount",
      render: (_: unknown, record: Coupon) =>
        record.discount_type === "percentage"
          ? `${record.discount_value}%`
          : `₹${record.discount_value}`,
    },
    {
      title: "Min Order Value",
      dataIndex: "min_order_value",
      key: "min_order_value",
      render: (val: number) => (val ? `₹${val}` : "-"),
    },
    {
      title: "Max Discount Cap",
      dataIndex: "max_discount_amount",
      key: "max_discount_amount",
      render: (val: number) => (val ? `₹${val}` : "-"),
    },
    {
      title: "Usage",
      key: "usage",
      render: (_: unknown, record: Coupon) =>
        `${record.used_count} / ${record.usage_limit ?? "∞"}`,
    },
    {
      title: "Valid From",
      dataIndex: "valid_from",
      key: "valid_from",
      render: (val: string) => (val ? dayjs(val).format("DD MMM YYYY") : "-"),
    },
    {
      title: "Valid Until",
      dataIndex: "valid_until",
      key: "valid_until",
      render: (val: string) => (val ? dayjs(val).format("DD MMM YYYY") : "-"),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (val: string) => val || "-",
    },
    {
      title: "Active",
      key: "is_active",
      render: (_: unknown, record: Coupon) => (
        <Switch
          checked={record.is_active}
          onChange={() => toggleCouponMutate({ id: record.id })}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentStep="coupons"
        setCurrentStep={() => {}}
        handleLogout={() => {
          localStorage.clear();
          navigate("/login");
        }}
      />

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/home")}>← Back to Home</Button>
            <Title level={3} style={{ margin: 0, color: "#2d1603" }}>
              Coupons
            </Title>
          </div>
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={() => setIsModalOpen(true)}
            style={{ backgroundColor: "#2d1603", borderColor: "#2d1603" }}
          >
            Create Coupon
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={coupons}
          rowKey="id"
          bordered
          loading={listLoading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title="Create Coupon"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreateCoupon}
        confirmLoading={createLoading}
        okText="Create"
      >
        <Form form={form} layout="vertical" initialValues={{ discount_type: "flat" }}>
          <Form.Item
            name="code"
            label="Coupon Code"
            rules={[{ required: true, message: "Coupon code is required" }]}
          >
            <Input
              placeholder="e.g. FABELLE10"
              onChange={(e) =>
                form.setFieldValue("code", e.target.value.toUpperCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="discount_type"
            label="Discount Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="flat">Flat Amount (₹)</Option>
              <Option value="percentage">Percentage (%)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="discount_value"
            label="Discount Value"
            rules={[{ required: true, message: "Discount value is required" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="min_order_value" label="Minimum Order Value (₹)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="max_discount_amount"
            label="Max Discount Cap (₹) — applies to percentage coupons"
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="usage_limit" label="Usage Limit (leave blank for unlimited)">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="validity" label="Validity Period">
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Internal note (optional)" />
          </Form.Item>
        </Form>
      </Modal>

      <FullScreenSpin isLoader={listLoading && coupons.length === 0} />
    </div>
  );
};

export default CouponsPage;
