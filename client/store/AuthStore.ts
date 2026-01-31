import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserInfoType = {
  first_name: string
  last_name: string
  email: string
  role: string
};

type AuthStoreType = {
  userInfo: UserInfoType | null;
  setUserInfo: (user: UserInfoType) => void;
  clearUserInfo: () => void;
  updateAccessToken: (token: string) => void;
};

export const useAuthStore = create<AuthStoreType>()(
  persist(
    (set, get) => ({
      userInfo: null,
      setUserInfo: (user) => set({ userInfo: user }),
      clearUserInfo: () => set({ userInfo: null }),
      updateAccessToken: (token) => {
        const current = get().userInfo;
        if (current) {
          set({
            userInfo: {
              ...current
            },
          });
        }
      },
    }),
    {
      name: "auth-store", // key in localStorage
    }
  )
);

