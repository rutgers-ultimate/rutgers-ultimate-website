import { collection, DocumentReference } from "@firebase/firestore";
import { firestore } from "config/firebaseApp";
import { getFirestoreConverter } from "config/firestoreConverter";
import { CartItem } from "types/userData";
import { currencyFormat } from "../config/currencyUtils";
import { Product } from "./product";

export interface OrderInfo {
  venmo?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: number;
  machinePercentage?: number;
  nightshadePercentage?: number;
  comments?: string;
}

export interface Order {
  id: string;
  ref: DocumentReference<Order>;
  uid: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  comments: string;
  venmo?: string;
  machinePercentage?: number;
  nightshadePercentage?: number;
  totalCost: number;
  isTeam: boolean;
  dateCreated: Date;
  dateUpdated: Date;
  cart: CartItem[];

  requested: boolean;
  paid: boolean;
  delivered: boolean;
}

export const orderCollection = collection(firestore, "orders").withConverter(
  getFirestoreConverter<Order>()
);

export function orderAsStringSummary(
  order: Order,
  productMap: { [id: string]: Product }
): string {
  let orderSummary = "";

  for (const item of order.cart) {
    orderSummary += (productMap[item.productId]?.name || item.productId) + "\n";
    const attributes = [];

    if (item.size) attributes.push(item.size);
    if (item.number !== null && item.number !== undefined)
      attributes.push("number " + item.number);
    if (item.name) attributes.push(item.name);

    if (attributes.length > 0) orderSummary += attributes.join(", ") + "\n";
    orderSummary += `${item.quantity} x ${currencyFormat(item.unitPrice)}\n\n`;
  }

  orderSummary += `Total: ${currencyFormat(order.totalCost)}`;

  return orderSummary;
}
