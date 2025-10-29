import React, { useState } from "react";
import { Input, Button, Modal } from "antd";
import { Search } from "lucide-react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchBarWithScanner: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barcodeData, setBarcodeData] = useState("Scanning...");

  const openModal = () => {
    setIsModalOpen(true);
    setBarcodeData("Scanning...");
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl mb-8 border border-gray-100 overflow-hidden">
      <div className="flex items-center h-20 px-8">
        <div className="flex-1 flex items-center">
          <Search size={24} className="text-gray-400 mr-4 flex-shrink-0" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-0 text-lg bg-transparent focus:shadow-none hover:bg-transparent"
            style={{
              fontSize: "18px",
              boxShadow: "none",
              padding: "0",
              height: "auto",
            }}
          />
        </div>

        {/* Scan Barcode Button */}
        <Button type="primary" onClick={openModal} style={{ marginLeft: 16 }}>
          Scan Barcode
        </Button>
      </div>

      {/* Modal for Barcode Scanner */}
      {isModalOpen && (
        <Modal
          title="Barcode Scanner"
          open={isModalOpen}
          onCancel={closeModal}
          footer={[
            <Button key="close" onClick={closeModal}>
              Close
            </Button>,
          ]}
        >
          <div style={{ position: "relative" }}>
            <BarcodeScannerComponent
              width={400}
              height={300}
              onUpdate={(err, result) => {
                if (result && result.text) {
                  onSearchChange(result.text);
                  setBarcodeData(result.text);
                  setIsModalOpen(false);
                } else {
                  setBarcodeData("Scanning...");
                }
              }}
            />

            {/* Green scanning box overlay */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "60%",
                height: "30%",
                border: "3px solid #00FF00",
                borderRadius: 8,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <p style={{ marginTop: 10, fontWeight: "bold", fontSize: 16 }}>
            {barcodeData}
          </p>
        </Modal>
      )}
    </div>
  );
};

export default SearchBarWithScanner;
