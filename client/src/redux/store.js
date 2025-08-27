import { configureStore } from '@reduxjs/toolkit';
import Table from './tableSlice';

const store = configureStore({
  reducer: {
    tableData: Table,
  },
});

export default store;
