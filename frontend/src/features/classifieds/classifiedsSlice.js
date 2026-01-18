import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseURL } from "../../config";

const normalizeLang = (raw) => {
  const s = (raw || "en").toLowerCase();
  if (s.startsWith("zh")) return "zh";
  if (s.startsWith("es")) return "es";
  return "en";
};

const authHeaders = (token) =>
  token ? { Authorization: `Bearer ${token}` } : {};

const jsonHeaders = (token) => ({
  "Content-Type": "application/json",
  ...authHeaders(token),
});

// --------------------
// Public
// --------------------

export const fetchClassifiedCategories = createAsyncThunk(
  "classifieds/fetchClassifiedCategories",
  async ({ lang }) => {
    const l = normalizeLang(lang);
    const res = await fetch(`${baseURL}/api/classified_categories?lang=${l}`);
    if (!res.ok) throw new Error("Failed to fetch classified categories");
    return res.json(); // returns array of categories (not wrapped)
  },
);

export const fetchClassifieds = createAsyncThunk(
  "classifieds/fetchClassifieds",
  async ({ lang, category, subcategory, limit }) => {
    const l = normalizeLang(lang);
    const qs = new URLSearchParams();
    qs.set("lang", l);
    if (category) qs.set("category", category);
    if (subcategory) qs.set("subcategory", subcategory);
    if (limit) qs.set("limit", String(limit));

    const res = await fetch(`${baseURL}/api/classifieds?${qs.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch classifieds");
    return res.json(); // returns array of classifieds (not wrapped)
  },
);

export const fetchClassifiedByIdOrSlug = createAsyncThunk(
  "classifieds/fetchClassifiedByIdOrSlug",
  async ({ idOrSlug, lang }) => {
    const l = normalizeLang(lang);
    const res = await fetch(`${baseURL}/api/classifieds/${idOrSlug}?lang=${l}`);
    if (!res.ok) throw new Error("Failed to fetch classified");
    return res.json(); // returns detail object (not wrapped)
  },
);

// --------------------
// Admin: Classifieds
// --------------------
// NOTE: Your controller expects params.require(:classified)
// so we send { classified: { ... } }

export const createClassified = createAsyncThunk(
  "classifieds/createClassified",
  async ({ classified, token, lang }) => {
    const l = normalizeLang(lang);
    const res = await fetch(`${baseURL}/api/classifieds?lang=${l}`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify({ classified }),
    });

    if (!res.ok) throw new Error("Failed to create classified");
    const data = await res.json();
    return data.classified; // unwrap
  },
);

export const updateClassified = createAsyncThunk(
  "classifieds/updateClassified",
  async ({ id, classified, token, lang }) => {
    const l = normalizeLang(lang);
    const res = await fetch(`${baseURL}/api/classifieds/${id}?lang=${l}`, {
      method: "PUT",
      headers: jsonHeaders(token),
      body: JSON.stringify({ classified }),
    });

    if (!res.ok) throw new Error("Failed to update classified");
    const data = await res.json();
    return data.classified; // unwrap
  },
);

export const deleteClassified = createAsyncThunk(
  "classifieds/deleteClassified",
  async ({ id, token }) => {
    const res = await fetch(`${baseURL}/api/classifieds/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });

    if (!res.ok) throw new Error("Failed to delete classified");
    return id;
  },
);

// --------------------
// Admin: Categories
// --------------------

export const createClassifiedCategory = createAsyncThunk(
  "classifieds/createClassifiedCategory",
  async ({ category, token, lang }) => {
    const l = normalizeLang(lang);
    const res = await fetch(`${baseURL}/api/classified_categories?lang=${l}`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify({ classified_category: category }),
    });

    if (!res.ok) throw new Error("Failed to create category");
    const data = await res.json();
    return data.category; // unwrap
  },
);

export const updateClassifiedCategory = createAsyncThunk(
  "classifieds/updateClassifiedCategory",
  async ({ id, category, token, lang }) => {
    const l = normalizeLang(lang);
    const res = await fetch(
      `${baseURL}/api/classified_categories/${id}?lang=${l}`,
      {
        method: "PUT",
        headers: jsonHeaders(token),
        body: JSON.stringify({ classified_category: category }),
      },
    );

    if (!res.ok) throw new Error("Failed to update category");
    const data = await res.json();
    return data.category; // unwrap
  },
);

export const deleteClassifiedCategory = createAsyncThunk(
  "classifieds/deleteClassifiedCategory",
  async ({ id, token }) => {
    const res = await fetch(`${baseURL}/api/classified_categories/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });

    if (!res.ok) throw new Error("Failed to delete category");
    return id;
  },
);

// --------------------
// Admin: Subcategories
// --------------------

export const createClassifiedSubcategory = createAsyncThunk(
  "classifieds/createClassifiedSubcategory",
  async ({ subcategory, token, lang }) => {
    const l = normalizeLang(lang);
    const res = await fetch(
      `${baseURL}/api/classified_subcategories?lang=${l}`,
      {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify({ classified_subcategory: subcategory }),
      },
    );

    if (!res.ok) throw new Error("Failed to create subcategory");
    const data = await res.json();
    return data.subcategory; // unwrap
  },
);

export const updateClassifiedSubcategory = createAsyncThunk(
  "classifieds/updateClassifiedSubcategory",
  async ({ id, subcategory, token, lang }) => {
    const l = normalizeLang(lang);
    const res = await fetch(
      `${baseURL}/api/classified_subcategories/${id}?lang=${l}`,
      {
        method: "PUT",
        headers: jsonHeaders(token),
        body: JSON.stringify({ classified_subcategory: subcategory }),
      },
    );

    if (!res.ok) throw new Error("Failed to update subcategory");
    const data = await res.json();
    return data.subcategory; // unwrap
  },
);

export const deleteClassifiedSubcategory = createAsyncThunk(
  "classifieds/deleteClassifiedSubcategory",
  async ({ id, token }) => {
    const res = await fetch(`${baseURL}/api/classified_subcategories/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });

    if (!res.ok) throw new Error("Failed to delete subcategory");
    return id;
  },
);

const classifiedsSlice = createSlice({
  name: "classifieds",
  initialState: {
    categories: [],
    classifieds: [],
    selected: null,

    categoriesStatus: "idle",
    classifiedsStatus: "idle",
    selectedStatus: "idle",

    error: null,
  },
  reducers: {
    clearSelectedClassified(state) {
      state.selected = null;
      state.selectedStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchClassifiedCategories.pending, (state) => {
        state.categoriesStatus = "loading";
        state.error = null;
      })
      .addCase(fetchClassifiedCategories.fulfilled, (state, action) => {
        state.categoriesStatus = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchClassifiedCategories.rejected, (state, action) => {
        state.categoriesStatus = "failed";
        state.error = action.error.message;
      })

      // Classifieds list
      .addCase(fetchClassifieds.pending, (state) => {
        state.classifiedsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchClassifieds.fulfilled, (state, action) => {
        state.classifiedsStatus = "succeeded";
        state.classifieds = action.payload;
      })
      .addCase(fetchClassifieds.rejected, (state, action) => {
        state.classifiedsStatus = "failed";
        state.error = action.error.message;
      })

      // Selected detail
      .addCase(fetchClassifiedByIdOrSlug.pending, (state) => {
        state.selectedStatus = "loading";
        state.error = null;
      })
      .addCase(fetchClassifiedByIdOrSlug.fulfilled, (state, action) => {
        state.selectedStatus = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchClassifiedByIdOrSlug.rejected, (state, action) => {
        state.selectedStatus = "failed";
        state.error = action.error.message;
      })

      // Create classified
      .addCase(createClassified.fulfilled, (state, action) => {
        state.classifieds = [action.payload, ...state.classifieds];
      })

      // Update classified
      .addCase(updateClassified.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.classifieds.findIndex((c) => c.id === updated.id);
        if (idx !== -1) state.classifieds[idx] = updated;
        if (state.selected && state.selected.id === updated.id)
          state.selected = updated;
      })

      // Delete classified
      .addCase(deleteClassified.fulfilled, (state, action) => {
        state.classifieds = state.classifieds.filter(
          (c) => c.id !== action.payload,
        );
        if (state.selected && state.selected.id === action.payload)
          state.selected = null;
      })

      // Create category
      .addCase(createClassifiedCategory.fulfilled, (state, action) => {
        state.categories = [...state.categories, action.payload];
      })

      // Update category
      .addCase(updateClassifiedCategory.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.categories.findIndex((c) => c.id === updated.id);
        if (idx !== -1) state.categories[idx] = updated;
      })

      // Delete category
      .addCase(deleteClassifiedCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c.id !== action.payload,
        );
      });

    // Subcategory create/update/delete:
    // Your categories index returns nested subcategories, so the simplest move is:
    // after any subcategory mutation, just refetch categories.
    // We still return the subcategory for UI, but we don't attempt deep state surgery here.
  },
});

export const { clearSelectedClassified } = classifiedsSlice.actions;
export default classifiedsSlice.reducer;
