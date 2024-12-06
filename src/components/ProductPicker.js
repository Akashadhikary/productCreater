import React, { useState, useEffect, useCallback } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

const fetchAllProducts = async (search = "", page = 0, limit = 10) => {
  const apiKey = "72njgfa948d9aS7gs5";
  const url = `https://stageapi.monkcommerce.app/task/products/search?search=${search}&page=${page}&limit=${limit}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });
    const data = await response.json();
    //console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

const ProductPicker = ({ onClose, onProductsSelected }) => {
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const loadProducts = async () => {
      const products = await fetchAllProducts(
        searchTerm,
        currentPage,
        pageSize
      );
      const productsWithVariants = products.map((product) => ({
        ...product,
        variants: product.variants || [{ title: "Default Variant" }],
      }));
      setDisplayedProducts((prev) => [...prev, ...productsWithVariants]);
    };

    loadProducts();
  }, [searchTerm, currentPage]);


  // throttling feature
  const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  };

  const throttledSearch = useCallback(
    throttle((search) => {
      setCurrentPage(0);
      setDisplayedProducts([]);
      loadProducts(search, 0);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    throttledSearch(e.target.value);
  };

  const loadProducts = async (search, page) => {
    const products = await fetchAllProducts(search, page, pageSize);
    const productsWithVariants = products.map((product) => ({
      ...product,
      variants: product.variants || [{ title: "Default Variant" }],
    }));
    setDisplayedProducts((prev) => [...prev, ...productsWithVariants]);
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
      [product.id]: isSelected ? [] : [defaultVariant],
    }));
  };

  const handleVariantSelect = (productId, variant) => {
    setSelectedVariants((prev) => {
      const productVariants = prev[productId] || [];
      const isSelected = productVariants.some(
        (selected) => selected.title === variant.title
      );

      return {
        ...prev,
        [productId]: isSelected
          ? productVariants.filter((v) => v.title !== variant.title)
          : [...productVariants, variant],
      };
    });
  };

  const handleAddProducts = () => {
    const finalSelectedProducts = selectedProducts.map((product) => ({
      ...product,
      variants: selectedVariants[product.id],
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
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-3/4 max-w-3xl h-3/4 rounded-lg flex flex-col">

        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Select Products</h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-gray-800"
          >
            <ClearIcon />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative flex items-center border border-gray-300 rounded">
            <SearchIcon className="absolute left-3 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search product"
              className="w-full p-2 pl-10 focus:outline-none"
            />
          </div>
        </div>

        {/* Product List */}
        <div className="flex-grow overflow-y-auto p-4" onScroll={handleScroll}>
          {displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <div key={product.id} className="p-4 border-b border-gray-200">
                {/* Product Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedProducts.some((p) => p.id === product.id)}
                    onChange={() => handleSelectProduct(product)}
                    className="mr-4 w-4 h-4 border-2 border-gray-300 rounded-md bg-white checked:bg-green-500 checked:border-green-500"
                  />

                  <img
                    src={product.image?.src || "https://via.placeholder.com/50"}
                    alt={product.title}
                    className="w-16 h-16 mr-4"
                  />
                  <span className="font-medium">{product.title}</span>
                </div>

                {/* Variants Section */}
                <div className="ml-10 mt-2 space-y-2">
                  {product.variants?.map((variant, index) => {
                    const [part1, part2] = variant.title.split("/");
                    return (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`variant-${product.id}`}
                          value={variant.title}
                          checked={(selectedVariants[product.id] || []).some(
                            (selected) => selected.title === variant.title
                          )}
                          onChange={() =>
                            handleVariantSelect(product.id, variant)
                          }
                          className="mr-2 w-4 h-4"
                        />
                        {part1 && part2 ? (
                          <div className="flex space-x-4">
                            <span className="text-gray-700">{part1}</span>
                            <span className="text-gray-700">/</span>
                            <span className="text-gray-700">
                              {part2?.toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-700">{variant.title}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">Loading...</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center bg-white">
          <span className="text-sm text-gray-600">
            {selectedProducts.length} product selected
          </span>

          <div className="flex gap-3">
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
    </div>
  );
};

export default ProductPicker;
