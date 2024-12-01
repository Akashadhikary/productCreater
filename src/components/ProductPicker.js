import React, { useState, useEffect } from "react";
import ClearIcon from "@mui/icons-material/Clear";

const fetchAllProducts = async () => {
  //const response = await fetch("https://stageapi.monkcommerce.app/task/products");
  const response = await fetch("https://dummyjson.com/products");   
  const data = await response.json();
  //console.log(data);
  
  return data.products || [];
};

const ProductPicker = ({ onClose, onProductsSelected }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const loadAllProducts = async () => {
      const products = await fetchAllProducts();
      const productsWithVariants = products.map((product) => ({
        ...product,
        variants: product.variants || [{ title: "Default Variant" }],
      }));
      setAllProducts(productsWithVariants);
      setDisplayedProducts(productsWithVariants.slice(0, pageSize));
    };
    loadAllProducts();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setDisplayedProducts(allProducts.slice(0, pageSize));
    } else {
      const filteredProducts = allProducts.filter((product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDisplayedProducts(filteredProducts.slice(0, pageSize));
    }
  }, [searchTerm, allProducts]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectProduct = (product) => {
    const isSelected = selectedProducts.some((p) => p.id === product.id);
    const updatedSelectedProducts = isSelected
      ? selectedProducts.filter((p) => p.id !== product.id)
      : [...selectedProducts, product];

    setSelectedProducts(updatedSelectedProducts);
    const defaultVariant = product.variants?.[0] || {
      title: "Default Variant",
    };

    setSelectedVariants((prev) => ({
      ...prev,
      [product.id]: isSelected ? undefined : defaultVariant,
    }));
  };

  const handleVariantSelect = (productId, variant) => {
    setSelectedVariants({
      ...selectedVariants,
      [productId]: variant,
    });
  };

  const handleAddProducts = () => {
    const finalSelectedProducts = selectedProducts.map((product) => ({
      ...product,
      variant: selectedVariants[product.id],
    }));
    onProductsSelected(finalSelectedProducts);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      loadMoreProducts();
    }
  };

  const loadMoreProducts = () => {
    const nextPage = currentPage + 1;
    const startIndex = currentPage * pageSize;
    const newProducts = allProducts.slice(startIndex, startIndex + pageSize);

    if (newProducts.length > 0) {
      setDisplayedProducts((prev) => [...prev, ...newProducts]);
      setCurrentPage(nextPage);
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-3/4 max-w-3xl h-3/4 rounded-lg flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Select Products</h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-gray-800"
          >
            <ClearIcon />
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search products"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex-grow overflow-y-auto p-4" onScroll={handleScroll}>
          {displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center p-4 border-b border-gray-200"
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.some((p) => p.id === product.id)}
                  onChange={() => handleSelectProduct(product)}
                  className="mr-4"
                />
                <div className="flex-grow flex flex-col">
                  <div className="flex items-center mb-2">
                    <img
                      src={product.images || "https://via.placeholder.com/50"}
                      alt={product.title}
                      className="w-12 h-12 mr-4"
                    />
                    <span>{product.title}</span>
                  </div>
                  <div className="flex space-x-4">
                    {product.variants?.map((variant, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="radio"
                          name={`variant-${product.id}`}
                          value={variant.title}
                          checked={
                            selectedVariants[product.id]?.title ===
                            variant.title
                          }
                          onChange={() =>
                            handleVariantSelect(product.id, variant)
                          }
                          className="mr-2"
                        />
                        <span>{variant.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">Loading...</div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end gap-3 bg-white">
          <button
            onClick={handleCancel}
            className="w-24 p-2 border border-black text-black rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleAddProducts}
            className={`w-24 p-2 rounded ${
              selectedProducts.length > 0
                ? "bg-green-700 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPicker;
