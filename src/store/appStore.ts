import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Client, SimulatedPost } from "@/lib/types";

interface AppState {
  user: Client | { id: "admin"; name: "Admin" } | null;
  userType: "admin" | "client" | null;
  clients: Client[];
  simulatedPosts: SimulatedPost[];
  login: (
    user: Client | { id: "admin"; name: "Admin" },
    type: "admin" | "client"
  ) => void;
  logout: () => void;
  setClients: (clients: Client[]) => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  addSimulatedPost: (post: SimulatedPost) => void;
  updateSimulatedPostsStatus: () => void;
}

const initialClientData: Client[] = [
  {
    access_token:
      "EAASCiZBZBPmPgBPhfV3vl4s99t0ryGTJeYQZApTaWWaKaMSt2z6R9mVVDUKnYwlWKpwX5H7ARrPBZCw9BwWI6iD5naIy3MrlMbH2Ov7OwDSiSncQpZAhT44D5ZCQy2mqI6QKXNLdEYrZB0rwh0gDIi183ey3lZAMLuKSdDr1ybpgCNJxeNSnDvmJvFzNmKjh4F9rW90ANcShx8UYjzKivmvd",
    category: "Loja de roupas",
    name: "Panther Blazz",
    id: "839433682576086",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPtRVlVuidcQWIdW3B4GHlXfJ0UiUExxuWZAswonugSZCd50BZCdWk77uNQGWnz2CRjtTYIKRJKpMjcct6fCpEZBZAIweYBIoV2XRfAdABlNZBnz2G6NwZAZAVzx1Sctos14c2ttTqVF8bkUh3j7ruiXPYRWZBfS2xkTnrWWoVqZBZC4FZBe6RgMeuwy9QrEdf8MiR4yc6cHtde3ZC",
    category: "Comida e bebida",
    name: "Ice Savor",
    id: "778543002001668",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPr4crMGP4T6Cv6GlSUXjiKlhOXZC8tmajQH5tL7eM1i6wcpZAkcZAGcLCHGoEvvNRz7k27BZBaJat7GpZAlmLfcId6Qe7AZCQeZBDETi37daTeJzw7wVOmRXjIhlR6KKeQcV8qPlIrYBUFEhU6vTIvAWzoXFz6OlUqgzh5mto4j6h4pFf3icDVXPPBzceJC5nFUgj7msI7m",
    category: "Otorrinolaringologista",
    name: "Clínica Otto+",
    id: "768337943019641",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPlZAhgBvIClluhWHszX2ZBVxF6a1woNXtK7K37quHBu3U3in8FzjdaqzqrZAYC8zJLnH4gUFV81Vo8V99wt0GNb847ZCNdkOyx6WlEo21ikY7dtfmBOnxomSRIX5JTO06PWNTPwjB78MGq5kvRb7TYDycW3De0V9Jj0GqB53WIuMO8eBc9F7Yxy0VX6ltx2q34naAGB8",
    category: "Loja de roupas femininas",
    name: "Pagina de teste",
    id: "704589799407686",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPiZAgYT8jNcD1dcmHVOFwhDKd7cGOpld1AXbXjPeZCvdSn9ImFg0aX1ZChS4QzXJ7QrPXmFQkCrR7JOWtSIGPmxwcS19ZARCiLJG9P4UdaU6BXZB9gDoGmtBkF6qB1OkdCZCkIkQYjYdoJj7Op9dvvPOsyIY8ncQJbKfqlVTUE4wegZCvfcnp1NXZAQZBnhM2vDdq1iD4L9vs",
    category: "Loja de roupas",
    name: "Shopping da Criança",
    id: "524393897434613",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPpCth244v1oc4cYw107qt0OBAZBz3inB4oh7124EgNMBZASk5QnvUMGDwZCktRaEnszwj39F0pesykqdGTDn5eqTU26Wsa0TWecb8j0ERtlHUUzWItZCJHi1aZBp6cEAjCuN7YIE6Ut34WMg2qQ6xVQCqN0F73lZCLK2LZAvJnZBZBZCzFrKvM07n0bhXaDxTuN2zpoC047vfx",
    category: "Farmácia/drogaria",
    name: "Farmácia Megafarma Multmais",
    id: "623328377520302",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPqfUfATjiiIax1lS0mf3pufEp52YhhuUIFA0leTGdHH0SZCj3NQKvsSk42KOW09pZB4yuNBQGZAAIc6ZCJDZAIDZCm7cSgCEwiG0pHUaDVypT62KZBwFFbC7ZAfmUVU1LPKTEdPruzwDptQhVzDVqR2c0vvA3GYgJooRZBg2DOTSQPijSQMwK5Xwv0SmY8LqoQAKETodRLHMb",
    category: "Laboratório médico",
    name: "Clean Saúde Rio Real",
    id: "511600935380953",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPrtIsWEJU9ZBUNyjC13X6jgoGa6O7CJoU8Mu26dV1cciZA0rHpKWlaj5vCls6hCb1tuVhUNtZAHlHnWeQ7a2rw5uPHf7uQpOFT1fey12qGwndBrTsEW9DeJI61xs0Qxvz4LgaS4yBdY9TcrzuZBB6AIuJdJIe0MZCsUoWiumNYX7KJ9JDnS5ZAJVZAlbZBxHy7YDBnlZAX0ot",
    category: "Medicina e saúde",
    name: "Clínica Gama - Ribeira do Pombal",
    id: "401347113060769",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPqARKH2d5ZCYjHlHCX1Tw7Rnp37OzNpgMJtNN6fgIcKsKGXlWMUOnnfHgVeAa3HFHZBWPjUBXO3ZAcoXRcXuOqZCiD4dCNdaQVGriCDkYAhDymZCshi5kpGj20HlNrFoBFwEd780ZBFxa4I1AWps4geHkf7sxEM8G4qN5J7TXIWADutbxiaaIRnWYZCXfnvEn69VO66GN59",
    category: "Medicina e saúde",
    name: "Centro Médico Bressan Bonfim",
    id: "301561133034232",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPlQIrLd3sSPsN1ZBRJBIYNQJMBkpV1n9iJKVlEmK8iETxvI1iTcdVKAKAxZAw9jnytpsRn5F0j7xwEZBZBkZAi0K5ixZB3W9SRjqZCZC1pgW473QLruCy8sxOLbri81Q71QukMEgirpf2KGH2vnOCMS94uGCz8TjY5skqFjZCAvas4JRjQuqGWE8QR2RJKmW7xUa4JQEUhJUZD",
    category: "Medicina e saúde",
    name: "Dr. Bressan Bonfim",
    id: "140860502443681",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPkWlRZCH9ln9U8edLFHeNxOJxH7LQF7xIZCapJVrceo3ZA9onKs532jouwNmWumF0dUYuMpajtBjX9E9e2Nu9Ho9ZApJMvNMmAvAcCFIiuk1yELA4XFLSmqcalKRqHAqNUAjQJ2Y5IeUyrOH7qqOgvezid6v3K5ho8S2ZClDwBz4WaL2yl98ZBJcZBZAPetQPDF7uOpXuxoZD",
    category: "Publicidade/marketing",
    name: "Carlos Henrique Silva",
    id: "102986028799656",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPo5D3ifrXaIrwROLszG1y9mi06988zwyQn5EVZAVxIjHqR7Dicj1dCnMYOj99ZCrin5DCvZCbwqkeBFcIVZAjMImbK6c7kXfPrCyJeZBkwYidjMNnZAGhhonUIjHt1wO3rlNHrbfDmBLm9cIMJx5i3eFrQZCBEZBiwOCfTIgTpYw6qREgip4KKr7ZB1OVkVtUJHiCznrhe4Lf",
    category: "Centro médico",
    name: "Clean Saúde Esplanada",
    id: "338921743423931",
  },
].map((c) => ({ ...c, isVisible: true }));

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      userType: null,
      clients: initialClientData,
      simulatedPosts: [],

      login: (user, type) => set({ user, userType: type }),
      logout: () => set({ user: null, userType: null }),

      setClients: (clients) => set({ clients }),

      updateClient: (clientId, updates) =>
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === clientId ? { ...client, ...updates } : client
          ),
        })),

      addSimulatedPost: (post) =>
        set((state) => ({
          simulatedPosts: [...state.simulatedPosts, post],
        })),

      updateSimulatedPostsStatus: () => {
        const now = new Date();
        set((state) => ({
          simulatedPosts: state.simulatedPosts.map((post) => {
            if (
              post.status === "scheduled" &&
              new Date(post.scheduledAt) <= now
            ) {
              return { ...post, status: "published" };
            }
            return post;
          }),
        }));
      },
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
