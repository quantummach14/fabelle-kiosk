import React from 'react';
import { Input, Select } from 'antd';
import { Search, Filter } from 'lucide-react';

const { Option } = Select;

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories
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
              fontSize: '18px',
              boxShadow: 'none',
              padding: '0',
              height: 'auto'
            }}
          />
        </div>
        
        {/* <div className="w-px h-12 bg-gray-200 mx-6"></div> */}
        
        {/* <div className="w-64 flex items-center">
          <Select
            value={selectedCategory}
            onChange={onCategoryChange}
            placeholder="All Categories"
            className="w-full [&_.ant-select-selector]:border-0 [&_.ant-select-selector]:bg-transparent [&_.ant-select-selector]:shadow-none [&_.ant-select-selector]:h-auto [&_.ant-select-selection-item]:text-lg [&_.ant-select-selection-placeholder]:text-lg"
            suffixIcon={<Filter size={20} className="text-gray-400" />}
            style={{
              fontSize: '18px'
            }}
            dropdownStyle={{
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              border: '1px solid #f0f0f0'
            }}
          >
            <Option value="">All Categories</Option>
            {categories.map(category => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </div> */}
      </div>
    </div>
  );
};

export default SearchBar;