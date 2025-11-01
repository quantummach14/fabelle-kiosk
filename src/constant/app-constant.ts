import { Check, Coffee, CreditCard, MonitorSmartphone, Smartphone, Users } from "lucide-react";

export const stepsArray = [
  { step: 0, title: "Products", icon: Coffee },
  { step: 1, title: "Information", icon: Users },
  { step: 2, title: "Payment", icon: CreditCard },
  { step: 3, title: "Confirmation", icon: Check },
];

export const cardOptions = [
  {
    id: "card",
    label: "Card Payment",
    icon: CreditCard,
    description: "Pay with credit or debit card",
    color: "bg-blue-50 border-blue-200 hover:border-blue-400",
  },
  {
    id: "upi",
    label: "Online Payment",
    buttonText: "Send Payment Link",
    icon: Smartphone,
    description: "UPI, Net Banking, Wallets",
    color: "bg-green-50 border-green-200 hover:border-green-400",
  },
  {
    id: "third_party_pos",
    label: "ThirdParty POS",
    icon: MonitorSmartphone, // or another suitable icon
    description: "Process payment via external POS system",
    color: "bg-yellow-50 border-yellow-200 hover:border-yellow-400",
  },
  {
    id: "card_payment",
    label: "Card Payment New",
    icon: CreditCard, // or another suitable icon
    description: "Pay with credit or debit card",
    color: "bg-green-50 border-green-200 hover:border-green-400",
  },
  {
    id: "cash",
    label: "Other Method",
    icon: Users,
    description: "Cash or alternative payment",
    color: "bg-purple-50 border-purple-200 hover:border-purple-400",
  },
];
