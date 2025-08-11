import React from "react";
import { Input } from "antd";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
}) => {
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
      </div>
    </div>
  );
};

export default SearchBar;
