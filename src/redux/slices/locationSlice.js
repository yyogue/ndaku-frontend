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

      // Extract location data from listings
      const locations = listings.map(listing => ({
        quartier: listing.quartier,
        commune: listing.commune,
        district: listing.district,
        ville: listing.ville || "Kinshasa",
      }));

      // Filter out duplicates
      const unique = (arr) => [...new Set(arr.filter(Boolean))];

      // Build relationship maps
      const districtToCommunes = {};
      const communeToQuartiers = {};
      
      // Process listings to build relationships
      locations.forEach(loc => {
        if (loc.district && loc.commune) {
          if (!districtToCommunes[loc.district]) {
            districtToCommunes[loc.district] = [];
          }
          if (!districtToCommunes[loc.district].includes(loc.commune)) {
            districtToCommunes[loc.district].push(loc.commune);
          }
        }
        
        if (loc.commune && loc.quartier) {
          if (!communeToQuartiers[loc.commune]) {
            communeToQuartiers[loc.commune] = [];
          }
          if (!communeToQuartiers[loc.commune].includes(loc.quartier)) {
            communeToQuartiers[loc.commune].push(loc.quartier);
          }
        }
      });

      return {
        quartiers: unique(locations.map(l => l.quartier)),
        communes: unique(locations.map(l => l.commune)),
        districts: unique(locations.map(l => l.district)),
        villes: unique(locations.map(l => l.ville)),
        relationships: {
          districtToCommunes,
          communeToQuartiers
        }
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
  villes: ["Kinshasa"], // Default to Kinshasa
  status: 'idle',
  error: null,
  relationships: {
    districtToCommunes: {},
    communeToQuartiers: {}
  }
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocations: (state, action) => {
      state.locations = action.payload;
    },
    // Filter communes for a selected district
    filterCommunesByDistrict: (state, action) => {
      const district = action.payload;
      if (!district) {
        state.filteredCommunes = state.communes;
        return;
      }
      
      state.filteredCommunes = state.relationships.districtToCommunes[district] || [];
    },
    // Filter quartiers for a selected commune
    filterQuartiersByCommune: (state, action) => {
      const commune = action.payload;
      if (!commune) {
        state.filteredQuartiers = [];
        return;
      }
      
      state.filteredQuartiers = state.relationships.communeToQuartiers[commune] || [];
    }
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
        state.relationships = action.payload.relationships;
      })
      .addCase(fetchLocationData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  setLocations,
  filterCommunesByDistrict,
  filterQuartiersByCommune 
} = locationSlice.actions;

export default locationSlice.reducer;
