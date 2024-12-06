import React, { useState, useEffect } from "react";
import AddProductButton from "./AddProductButton";
import ProductPicker from "./ProductPicker";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ListIcon from "@mui/icons-material/List";

const ProductList = () => {
  const [searchFields, setSearchFields] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentFieldId, setCurrentFieldId] = useState(null);

  const handleAddSearchField = () => {
    if (searchFields.length < 4) {
      setSearchFields([
        ...searchFields,
        {
          id: Date.now(),
          searchTerm: "",
          discount: { value: "", type: "" },
          selectedProduct: null,
          variant: null,
          showDiscount: false,
          showVariant: false,
        },
      ]);
    }
  };

  useEffect(() => {
    handleAddSearchField();
  }, []);

  const handleSearchChange = (id, value) => {
    setSearchFields((fields) =>
      fields.map((field) =>
        field.id === id ? { ...field, searchTerm: value } : field
      )
    );
  };

  const handleEditSearchField = (id) => {
    setIsDialogOpen(true);
    setCurrentFieldId(id);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setCurrentFieldId(null);
  };

  const handleProductsSelected = (selectedProducts) => {
    setSearchFields((fields) =>
      fields.map((field) =>
        field.id === currentFieldId
          ? {
              ...field,
              selectedProduct: selectedProducts[0],
              variant: selectedProducts[0]?.variants || null,
            }
          : field
      )
    );
    setIsDialogOpen(false);
    setCurrentFieldId(null);
  };

  const toggleDiscountFields = (id) => {
    setSearchFields((fields) =>
      fields.map((field) =>
        field.id === id
          ? { ...field, showDiscount: !field.showDiscount }
          : field
      )
    );
  };

  const toggleVariantVisibility = (id) => {
    setSearchFields((fields) =>
      fields.map((field) =>
        field.id === id ? { ...field, showVariant: !field.showVariant } : field
      )
    );
  };

  const handleOnDragEnd = (result, fieldId) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      // Find the product field by ID
      const updatedFields = searchFields.map((field) => {
        if (field.id === fieldId) {
          const updatedVariants = Array.from(field.selectedProduct.variants);
          const [movedVariant] = updatedVariants.splice(source.index, 1);
          updatedVariants.splice(destination.index, 0, movedVariant);

          return {
            ...field,
            selectedProduct: {
              ...field.selectedProduct,
              variants: updatedVariants,
            },
          };
        }
        return field;
      });

      setSearchFields(updatedFields);
    }
  };

  const handleRemoveProduct = (id) => {
    setSearchFields((fields) => fields.filter((field) => field.id !== id));
  };

  const handleProductDiscountChange = (fieldId, key, value) => {
    setSearchFields((fields) =>
      fields.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              discount: {
                ...field.discount,
                [key]: value,
              },
              selectedProduct: {
                ...field.selectedProduct,
                variants: field.selectedProduct.variants.map((variant) => ({
                  ...variant,
                  discount: {
                    ...variant.discount,
                    [key]: value,
                  },
                })),
              },
            }
          : field
      )
    );
  };

  const handleVariantDiscountChange = (fieldId, variantIdx, key, value) => {
    setSearchFields((fields) =>
      fields.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              selectedProduct: {
                ...field.selectedProduct,
                variants: field.selectedProduct.variants.map((variant, idx) =>
                  idx === variantIdx
                    ? {
                        ...variant,
                        discount: {
                          ...variant.discount,
                          [key]: value,
                        },
                      }
                    : variant
                ),
              },
            }
          : field
      )
    );
  };

  const handleRemoveVariant = (fieldId, variantIdx) => {
    setSearchFields((fields) =>
      fields.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              selectedProduct: {
                ...field.selectedProduct,
                variants: field.selectedProduct.variants.filter(
                  (variant, idx) => idx !== variantIdx
                ),
              },
            }
          : field
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <DragDropContext
        onDragEnd={(result) =>
          handleOnDragEnd(result, result.source.droppableId.split("-")[1])
        }
      >
        <div className="mx-auto flex w-full justify-between flex-wrap self-stretch">
          <h3 className="font-medium text-black ml-20">Product</h3>
          <h3 className="font-medium text-black mr-32">Discount</h3>
        </div>
        <Droppable droppableId="products" type="product">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-6"
            >
              {searchFields.map((field, index) => (
                <Draggable key={field.id} draggableId={`${field.id}`} index={index}>
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className="p-4"
                    >
                      {/* Top Section: Product Input, Discount Button, Clear Button */}
                      <div className="flex items-center gap-5">
                        <div className="w-6 h-6 gap-2 flex items-center justify-center text-sm font-bold text-gray-700">
                          <div className="text-gray-400">
                            <ListIcon />
                          </div>
                          {index + 1}.
                        </div>

                        {/* Product Input */}
                        {field.selectedProduct ? (
                          <div className="flex px-2 items-center border shadow-md gap-4 w-full text-gray-500 justify-between">
                            <span>{field.selectedProduct.title}</span>
                            <button
                              onClick={() => handleEditSearchField(field.id)}
                              className="p-2 text-gray-400 ml-auto"
                            >
                              <EditIcon />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center w-full gap-2 border border-gray-300 rounded shadow-md">
                            <input
                              type="text"
                              value={field.searchTerm}
                              onChange={(e) =>
                                handleSearchChange(field.id, e.target.value)
                              }
                              placeholder="Select Product"
                              className="flex-grow p-2 rounded-l focus:outline-none"
                            />
                            <button
                              onClick={() => handleEditSearchField(field.id)}
                              className="p-2 bg-white rounded text-gray-400"
                            >
                              <EditIcon />
                            </button>
                          </div>
                        )}

                        {/* Discount Button */}
                        {!field.showDiscount ? (
                          <button
                            onClick={() => toggleDiscountFields(field.id)}
                            className="py-2 px-12 bg-green-700 text-white rounded whitespace-nowrap"
                          >
                            Add Discount
                          </button>
                        ) : (
                          <div className="flex items-center gap-4">
                            <input
                              type="text"
                              value={field.discount?.value || ""}
                              onChange={(e) =>
                                handleProductDiscountChange(
                                  field.id,
                                  "value",
                                  e.target.value
                                )
                              }
                              className="p-2 border border-gray-300 text-gray-500 rounded focus:outline-none w-20 shadow-md"
                              placeholder="Value"
                            />
                            <select
                              value={field.discount?.type || ""}
                              onChange={(e) =>
                                handleProductDiscountChange(
                                  field.id,
                                  "type",
                                  e.target.value
                                )
                              }
                              className="p-2 border border-gray-300 text-gray-500 rounded focus:outline-none w-24 shadow-md"
                            >
                              <option value="flat">% Off</option>
                              <option value="percent">Flat Off</option>
                            </select>
                            <button
                              onClick={() => toggleDiscountFields(field.id)}
                              className="p-2 text-gray-500 rounded"
                            >
                              Done
                            </button>
                          </div>
                        )}

                        {/* Remove Product */}
                        {searchFields.length > 1 && (
                          <button
                            onClick={() => handleRemoveProduct(field.id)}
                            className="p-2 text-gray-500 rounded hover:cursor-pointer"
                          >
                            <ClearIcon />
                          </button>
                        )}
                      </div>

                      {/* Bottom Section: Variant Button and Variants */}
                      <div className="mt-4 flex flex-wrap">
                        {field.selectedProduct?.variants?.length > 0 && (
                          <div className="w-full">
                            <button
                              onClick={() => toggleVariantVisibility(field.id)}
                              className="cursor-pointer text-blue-600 underline flex items-center gap-2 ml-auto"
                            >
                              {field.showVariant ? (
                                <>
                                  Hide Variant <KeyboardArrowUpIcon />
                                </>
                              ) : (
                                <>
                                  Show Variant <KeyboardArrowDownIcon />
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Show Variants */}
                        {field.showVariant && (
                          <Droppable droppableId={`variants-${field.id}`} type="variant">
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex flex-wrap justify-end w-full"
                              >
                                {field.selectedProduct?.variants?.map((variant, idx) => (
                                  <Draggable key={variant.id} draggableId={`variant-${variant.id}`} index={idx}>
                                    {(provided) => (
                                      <div
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        ref={provided.innerRef}
                                        className="mt-4 p-2 flex items-center gap-4"
                                      >
                                        <div className="text-gray-400">
                                          <ListIcon />
                                        </div>
                                        <p className="w-36 p-2 border text-center rounded-full shadow-md text-sm font-medium text-gray-500">
                                          {variant.title}
                                        </p>
                                        <div className="flex items-center gap-4">
                                          <input
                                            type="text"
                                            value={variant.discount?.value || ""}
                                            onChange={(e) =>
                                              handleVariantDiscountChange(field.id, idx, "value", e.target.value)
                                            }
                                            className="p-2 border rounded-full text-gray-500 shadow-md focus:outline-none w-20"
                                            placeholder="Value"
                                          />
                                          <select
                                            value={variant.discount?.type || ""}
                                            onChange={(e) =>
                                              handleVariantDiscountChange(field.id, idx, "type", e.target.value)
                                            }
                                            className="p-2 border rounded-full text-gray-500 shadow-md focus:outline-none w-24"
                                          >
                                            <option value="flat">% Off</option>
                                            <option value="percent">Flat Off</option>
                                          </select>

                                          {/* clear variant */}
                                          <div
                                            className="text-gray-500"
                                            onClick={() =>
                                              handleRemoveVariant(field.id, idx)
                                            }
                                          >
                                            <ClearIcon />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <AddProductButton
        onAddField={handleAddSearchField}
        isDisabled={searchFields.length >= 4}
      />

      {isDialogOpen && (
        <ProductPicker
          onClose={handleDialogClose}
          onProductsSelected={handleProductsSelected}
        />
      )}
    </div>
  );
};

export default ProductList;
