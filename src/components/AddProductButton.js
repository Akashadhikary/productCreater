import React from 'react';

const AddProductButton = ({ onAddField, isDisabled }) => {
  return (
    <div className="flex justify-end mt-4">
      <button
        onClick={onAddField}
        className={`px-32 py-2 border ${
          isDisabled
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : 'border border-x-2 border-y-2 border-green-700 text-green-700'
        }`}
        disabled={isDisabled}
      >
        Add Product
      </button>
    </div>
  );
};

export default AddProductButton;
