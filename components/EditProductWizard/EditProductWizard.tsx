import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Stack,
} from "@mui/material";
import { useCollectionData, useDocument } from "react-firebase-hooks/firestore";
import {
  Product,
  productCollection,
  ProductVariant,
  variantCollection,
} from "types/product";
import { deleteDoc, doc, setDoc } from "@firebase/firestore";
import ProductSearchAutocomplete from "./ProductSearchAutocomplete";
import EditProductDetails from "./EditProductDetails";
import EditProductVariants from "./EditProductVariants";
import LoadingButton, { LoadingStatus } from "components/LoadingButton";

export default function EditProductWizard(): React.ReactElement {
  const [editStatus, setEditStatus] = useState<LoadingStatus | null>(null);

  const [productId, setProductId] = useState<string | null>(null);

  // manage product details
  const docReference = productId ? doc(productCollection, productId) : null;
  const [product, productLoading] = useDocument(docReference);
  const [edits, setEdits] = useState<Product | null>(null);
  useEffect(() => {
    if (!productLoading) {
      setEditStatus(null);
      setEdits(product?.data() ?? null);
    }
  }, [product, productLoading]);

  const handleEdit = (edit: Partial<Product>) => {
    setEditStatus("pending");
    setEdits({ ...edits!, ...edit });
  };

  // manage variants
  const variantCollectionMemo = useMemo(
    () => (productId ? variantCollection(productId) : null),
    [productId]
  );
  const [variants, variantsLoading] = useCollectionData<ProductVariant>(
    variantCollectionMemo
  );
  const [updatedVariants, setUpdatedVariants] = useState<ProductVariant[]>([]);
  const handleSetVariants = (variants: ProductVariant[]) => {
    setEditStatus("pending");
    setUpdatedVariants(variants);
  };
  useEffect(() => {
    if (variants && !variantsLoading) {
      setUpdatedVariants(variants);
    } else if (variantsLoading) {
      setUpdatedVariants([]);
    }
  }, [variantsLoading]);

  const handleDelete = async () => {
    if (!docReference) {
      return;
    }
    setEditStatus("loading");
    if (variants) {
      for (const variant of variants) {
        await deleteDoc(variant.ref);
      }
    }
    await deleteDoc(docReference);
    setEditStatus("success");
    setProductId(null);
  };

  const handleSubmit = () => {
    if (docReference && edits && editStatus == "pending") {
      setEditStatus("loading");
      setDoc(docReference, edits)
        .then(() => {
          // deleting old variants
          variants
            ?.filter(
              (old) => !updatedVariants.find((update) => old.id == update.id)
            )
            .forEach(
              async (toDelete) =>
                await deleteDoc(doc(variantCollectionMemo!, toDelete.id))
            );
        })
        .then(() => {
          // adding new variants and updating
          updatedVariants.forEach(async (v, i) => {
            await setDoc(doc(variantCollectionMemo!, v.id), {
              id: v.id,
              order: i,
            } as ProductVariant);
          });
        })
        .then(() => setEditStatus("success"))
        .catch((e) => {
          setEditStatus("error");
          console.error(e);
        });
    }
  };

  return (
    <Container maxWidth={"lg"}>
      <Card>
        <CardHeader title={"Edit Product"} />
        <CardContent>
          <Grid container justifyContent={"left"} spacing={4}>
            <Grid item xs={12}>
              <ProductSearchAutocomplete onChange={(id) => setProductId(id)} />
            </Grid>
            <Grid item xs={12}>
              <EditProductDetails edits={edits} handleEdit={handleEdit} />
            </Grid>
            <Grid item xs={12}>
              <EditProductVariants
                variants={updatedVariants}
                setVariants={handleSetVariants}
                variantsLoading={variantsLoading}
                disabled={!Boolean(productId) || variantsLoading}
              />
            </Grid>
            <Grid item xs={6}>
              <Stack direction={"row"} alignItems={"center"}>
                <LoadingButton onClick={handleSubmit} status={editStatus}>
                  SUBMIT CHANGES
                </LoadingButton>
              </Stack>
            </Grid>
            <Grid item xs={6} container justifyContent={"right"}>
              <Button onClick={handleDelete} disabled={!Boolean(productId)}>
                DELETE ITEM
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
