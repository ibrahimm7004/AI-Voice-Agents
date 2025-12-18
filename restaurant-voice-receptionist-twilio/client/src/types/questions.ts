export type Question =
  | ({ type: "greeting" } & Greeting)
  | ({ type: "reservations" } & Reservations)
  | ({ type: "address" } & Address)
  | ({ type: "pickup" } & Pickup)
  | ({ type: "delivery" } & Delivery)
  | ({ type: "catering" } & Catering)
  | ({ type: "dietary_accommodations" } & DietaryAccommodations)
  | ({ type: "other" } & Other)
  | ({ type: "value" } & Value);

export interface Greeting {
  id: number;
  base: string;
  tagline: string;
  end: string;
  add_tagline: boolean;
  link: string;
}

export interface Reservations {
  id: number;
  prompt: string;
  label: string;
  response: boolean;
}

export interface Address {
  id: number;
  prompt?: string;
  response?: string;
  prompts?: string[];
  link?: string;
}

export interface Method {
  method: string;
  available: boolean;
  link?: string;
}

export interface Pickup {
  id: number;
  prompt: string;
  response: boolean;
  methods: Method[];
}

export interface Delivery {
  id: number;
  prompt: string;
  response: boolean;
  methods: Method[];
}

export interface Catering {
  id: number;
  prompt: string;
  response: boolean;
  methods: Method[];
}

export interface DietaryAccommodations {
  id: number;
  prompt: string;
  response: boolean;
  link: string;
  methods: Method[];
}

export interface Other {
  id: number;
  prompts: string[];
  response: string;
}

export interface Value {
  id: number;
  label: string;
  value: string;
}

export const tabOptions = [
  {
    title: "Greeting & Reservations",
    categories: ["greeting", "reservations"],
  },
  { title: "Address", categories: ["address"] },
  {
    title: "Pickup, delivery & Catering",
    categories: ["pickup", "delivery", "catering"],
  },
  { title: "Dietary Accommodations", categories: ["dietary_accommodations"] },
  { title: "Other", categories: ["other"] },
  { title: "Settings", categories: ["value"] },
];
