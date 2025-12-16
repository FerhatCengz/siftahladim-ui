import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_VEHICLES } from './constants';
import { Vehicle } from './types';

// Inventory Slice
interface InventoryState {
  vehicles: Vehicle[];
}

const initialInventoryState: InventoryState = {
  vehicles: MOCK_VEHICLES,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: initialInventoryState,
  reducers: {
    addVehicle: (state, action: PayloadAction<Vehicle>) => {
      state.vehicles.unshift(action.payload);
    },
    updateVehicleStatus: (state, action: PayloadAction<{ id: string; status: any }>) => {
      const vehicle = state.vehicles.find(v => v.id === action.payload.id);
      if (vehicle) {
        vehicle.status = action.payload.status;
      }
    },
  },
});

// Configuration Slice (Brands, Models, Packages)
interface ConfigState {
  brands: string[];
  models: string[]; 
  packages: string[]; 
}

const initialConfigState: ConfigState = {
  brands: ['Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Renault', 'Fiat', 'Ford', 'Toyota', 'Honda', 'Volvo', 'Peugeot', 'Citroen'],
  models: ['A3', 'Passat', 'Clio', 'Civic', 'Corolla', 'Egea', 'Focus', '320i', 'C200', 'XC90', '3008', 'Austral', 'C-Elysée'],
  packages: ['AMG', 'M Sport', 'R-Line', 'Titanium', 'Urban', 'Touch', 'Elite', 'Vision', 'Prestige', 'Avantgarde', 'Icon', 'Joy', 'Feel', 'Techno Esprit Alpine', 'Easy Plus', 'Shine'],
};

const configSlice = createSlice({
  name: 'config',
  initialState: initialConfigState,
  reducers: {
    addBrand: (state, action: PayloadAction<string>) => {
      if (!state.brands.includes(action.payload)) {
        state.brands.push(action.payload);
        state.brands.sort();
      }
    },
    addModel: (state, action: PayloadAction<string>) => {
      if (!state.models.includes(action.payload)) {
        state.models.push(action.payload);
        state.models.sort();
      }
    },
    addPackage: (state, action: PayloadAction<string>) => {
      if (!state.packages.includes(action.payload)) {
        state.packages.push(action.payload);
        state.packages.sort();
      }
    }
  }
});

export const { addVehicle, updateVehicleStatus } = inventorySlice.actions;
export const { addBrand, addModel, addPackage } = configSlice.actions;

// Store setup
export const store = configureStore({
  reducer: {
    inventory: inventorySlice.reducer,
    config: configSlice.reducer,
  },
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;