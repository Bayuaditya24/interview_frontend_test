// features/sidebar/sidebarSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SidebarState {
  isVisible: boolean;
  activeMenu: string;
}

const initialState: SidebarState = {
  isVisible: true,
  activeMenu: "Home",
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isVisible = !state.isVisible;
    },
    setActiveMenu(state, action: PayloadAction<string>) {
      state.activeMenu = action.payload;
    },
  },
});

export const { toggleSidebar, setActiveMenu } = sidebarSlice.actions;
export default sidebarSlice.reducer;
