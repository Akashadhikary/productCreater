import React, { useState, useEffect } from "react";
import AddProductButton from "./AddProductButton";
import ProductPicker from "./ProductPicker";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

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
              variant: selectedProducts[0]?.variant || null,
            }
          : field
      )
    );
    setIsDialogOpen(false);
    setCurrentFieldId(null);
  };

  const handleDiscountValueChange = (id, value) => {
    setSearchFields((fields) =>
      fields.map((field) =>
        field.id === id
          ? { ...field, discount: { ...field.discount, value } }
          : field
      )
    );
  };

  const handleDiscountTypeChange = (id, type) => {
    setSearchFields((fields) =>
      fields.map((field) =>
        field.id === id
          ? { ...field, discount: { ...field.discount, type } }
          : field
      )
    );
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

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(searchFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSearchFields(items);
  };

  const handleRemoveProduct = (id) => {
    setSearchFields((fields) => fields.filter((field) => field.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="products">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {searchFields.map((field, index) => (
                <Draggable
                  key={field.id}
                  draggableId={`${field.id}`}
                  index={index}
                >
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className="flex items-center gap-4 p-2 bg-white shadow rounded"
                    >
                      <span className="text-gray-500">{index + 1}.</span>

                      {field.selectedProduct ? (
                        <div className="flex items-center gap-4 w-full">
                          <span>{field.selectedProduct.title}</span>

                          <button
                            onClick={() => handleEditSearchField(field.id)}
                            className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            <EditIcon />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center w-full gap-2 border border-gray-300 rounded">
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
                            className="p-2 bg-gray-200 rounded-r hover:bg-gray-300"
                          >
                            <EditIcon />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between w-full mt-2">
                        <div className="flex items-center gap-4">
                          {field.showDiscount && (
                            <div className="flex items-center gap-2 w-full mt-2">
                              <input
                                type="text"
                                value={field.discount.value}
                                onChange={(e) =>
                                  handleDiscountValueChange(
                                    field.id,
                                    e.target.value
                                  )
                                }
                                className="p-2 border border-gray-300 hover:border-green-700 hover:border-x-2 hover:border-y-2 rounded w-full focus:border-green-700 focus:outline-none"
                              />
                              <select
                                value={field.discount.type}
                                onChange={(e) =>
                                  handleDiscountTypeChange(
                                    field.id,
                                    e.target.value
                                  )
                                }
                                className="p-2 border border-gray-300 hover:border-green-700 hover:border-x-2 hover:border-y-2 rounded focus:border-green-700 focus:outline-none"
                              >
                                <option value="flat">Flat Off</option>
                                <option value="percent">% Off</option>
                              </select>
                            </div>
                          )}
                        </div>

                        <div>
                          {!field.showDiscount && (
                            <button
                              onClick={() => toggleDiscountFields(field.id)}
                              className="py-2 px-10 bg-green-700 text-white rounded"
                            >
                              Add Discount
                            </button>
                          )}

                          <div className="w-full mt-6">
                            <div className="flex items-center justify-between w-full">
                              {field.showVariant && field.variant && (
                                <div className="text-gray-700 font-semibold border border-gray-300 p-2 rounded-md w-full mr-6 whitespace-nowrap">
                                  <p className="text-sm">
                                    {field.variant.title}
                                  </p>
                                </div>
                              )}

                              <div className="">
                                <button
                                  onClick={() =>
                                    toggleVariantVisibility(field.id)
                                  }
                                  className="cursor-pointer text-blue-600 underline flex items-center gap-2"
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
                            </div>
                          </div>
                        </div>

                        {searchFields.length > 1 && (
                          <button
                            onClick={() => handleRemoveProduct(field.id)}
                            className="p-2 text-black rounded hover:cursor-pointer"
                          >
                            <ClearIcon />
                          </button>
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
