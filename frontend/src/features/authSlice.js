import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/auth/login', credentials);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Login failed' });
    }
  }
);

export const fetchTenantMeta = createAsyncThunk(
  'auth/fetchTenantMeta',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const { data } = await axios.get('/api/tenants/meta', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Could not fetch tenant info' });
    }
  }
);


export const fetchTenantUsers = createAsyncThunk(
  'auth/fetchTenantUsers',
  async (slug, { getState, rejectWithValue }) => {
    try {
      const { token, tenant } = getState().auth;
      const tenantSlug = slug || tenant?.slug;
      const url = tenantSlug 
        ? `/api/tenants/${tenantSlug}/users` 
        : `/api/tenants/users`; 

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Could not fetch tenant users' });
    }
  }
);


export const upgradePlan = createAsyncThunk(
  'auth/upgradePlan',
  async (slug, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const { data } = await axios.post(`/api/tenants/${slug}/upgrade`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Upgrade failed' });
    }
  }
);

export const downgradePlan = createAsyncThunk(
  'auth/downgradePlan',
  async (slug, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const { data } = await axios.post(`/api/tenants/${slug}/downgrade`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Could not downgrade plan' });
    }
  }
);

const safeParse = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    user: safeParse('user'),
    tenant: safeParse('tenant'),
    users: [],
    loading: false,
    error: null
  },
  reducers: {
    logoutUser: (state) => {
      state.token = null;
      state.user = null;
      state.tenant = null;
      state.users = [];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(fetchTenantMeta.fulfilled, (state, action) => {
        state.tenant = action.payload;
        localStorage.setItem('tenant', JSON.stringify(action.payload));
      })
      .addCase(upgradePlan.fulfilled, (state) => {
        if (state.tenant) state.tenant.plan = 'PRO';
      })
         .addCase(downgradePlan.fulfilled, (state) => {
      if (state.tenant) state.tenant.plan = 'FREE';
    })
      .addCase(fetchTenantUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      });
  }
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;
