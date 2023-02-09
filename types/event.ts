import {
  collection,
  CollectionReference,
  DocumentReference,
  FirestoreError,
  query,
  where,
} from "@firebase/firestore";
import { firestore } from "config/firebaseApp";
import { getFirestoreConverter } from "config/firestoreConverter";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import { useMemo } from "react";

export type EventProductStatus =
  | "Ready for Pickup"
  | "Picked Up"
  | "Shipped"
  | "Delivered";

export function getProductStatusColor(status?: EventProductStatus) {
  if (!status) return "#000000";
  switch (status) {
    case "Ready for Pickup":
    case "Shipped":
    case "Delivered":
    case "Picked Up":
      return "green";
  }
  return "#000000";
}

export type ServerEvent = {
  id: string;
  name: string;
  endDate: Date;
  productIds: string[];
  productStatuses: { productId: string; status: EventProductStatus }[];
  sizingChartCount: number;
};

export type Event = ServerEvent & {
  ref: DocumentReference<Event>;
};

export const eventCollection: CollectionReference<Event> = collection(
  firestore,
  "events"
).withConverter(getFirestoreConverter<Event>());

export function useActiveEventsOnce(): [
  Event[],
  boolean,
  FirestoreError | undefined
] {
  const q = useMemo(
    () => query(eventCollection, where("endDate", ">", new Date())),
    []
  );
  const [events, loading, error] = useCollectionDataOnce(q);
  return [events || [], loading, error];
}
