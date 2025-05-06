// redux/slices/locationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

// Async thunk to fetch location data
export const fetchLocationData = createAsyncThunk(
  'location/fetchLocationData',
  async (_, thunkAPI) => {
    try {
      const res = await API.get('/listings');
      const listings = res.data.listings;

      const locations = listings.map(listing => ({
        quartier: listing.quartier,
        commune: listing.commune,
        district: listing.district,
        ville: listing.ville,
      }));

      // Filter out duplicates
      const unique = (arr) => [...new Set(arr.filter(Boolean))];

      return {
        quartiers: unique(locations.map(l => l.quartier)),
        communes: unique(locations.map(l => l.commune)),
        districts: unique(locations.map(l => l.district)),
        villes: unique(locations.map(l => l.ville)),
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  quartiers: [],
  communes: [],
  districts: [],
  villes: [],
  status: 'idle',
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocations: (state, action) => {
      state.locations = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocationData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLocationData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.quartiers = action.payload.quartiers;
        state.communes = action.payload.communes;
        state.districts = action.payload.districts;
        state.villes = action.payload.villes;
      })
      .addCase(fetchLocationData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setLocations } = locationSlice.actions;
export default locationSlice.reducer;
