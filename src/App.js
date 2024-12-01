import React from 'react';
import ProductList from './components/ProductList';

const App = () => {
  return (
    <div className="mt-10 p-4">
      <h1>Add Products (Max. 4 Products)</h1>
      <ProductList />
    </div>
  );
};

export default App;
