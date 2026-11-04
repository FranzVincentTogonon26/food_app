import { z } from "zod";

export const Role = z.enum(["admin", "call_center", "packer", "warehouse", "delivery", "user"]);
export type Role = z.infer<typeof Role>;

export const STAFF_ROLES = ["admin", "call_center", "packer", "warehouse", "delivery"] as const satisfies readonly Role[];
export type StaffRole = (typeof STAFF_ROLES)[number];

export const isStaff = (role: Role | null | undefined): role is StaffRole =>
  !!role && role !== "user";

export const ROLE_INFO: Record<Role, { label: string; desc: string; icon: string }> = {
  admin: {
    label: "Admin",
    desc: "Full control: menu, settings, users and every order",
    icon: "shield",
  },
  call_center: {
    label: "Call center",
    desc: "Confirms new orders and delivery addresses",
    icon: "support_agent",
  },
  packer: {
    label: "Packer",
    desc: "Packs confirmed orders",
    icon: "inventory_2",
  },
  warehouse: {
    label: "Warehouse",
    desc: "Assigns packed orders to delivery riders",
    icon: "local_shipping",
  },
  delivery: {
    label: "Delivery",
    desc: "Picks up and delivers assigned orders",
    icon: "two_wheeler",
  },
  user: {
    label: "Customer",
    desc: "Orders food, books tables, earns rewards",
    icon: "person",
  },
};

export const OrderStage = z.enum([
  "placed",
  "confirmed",
  "packed",
  "assigned",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);
export type OrderStage = z.infer<typeof OrderStage>;

export const STAGE_LABEL: Record<OrderStage, string> = {
  placed: "New",
  confirmed: "Confirmed",
  packed: "Packed",
  assigned: "Rider assigned",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

type Mode = "delivery" | "pickup";

export function stepOfStage(stage: OrderStage, mode: Mode): 0 | 1 | 2 | 3 | 4 {
  switch (stage) {
    case "placed":
      return 0;
    case "confirmed":
    case "assigned":
      return 1;
    case "packed":
      return mode === "pickup" ? 2 : 1;
    case "out_for_delivery":
      return 2;
    case "delivered":
      return 3;
    case "cancelled":
      return 4;
  }
}

/** The stage an older order (saved before stages existed) is at, from its tracking step. */
export const stageOfStep = (step: number): OrderStage =>
  (["placed", "confirmed", "out_for_delivery", "delivered", "cancelled"] as const)[
    step
  ] ?? "placed";