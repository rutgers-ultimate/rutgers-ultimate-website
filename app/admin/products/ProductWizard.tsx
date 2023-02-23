"use client";
import React, { useState } from "react";
import { Autocomplete, Grid, Stack, TextField } from "@mui/material";
import {
  defaultProduct,
  Product,
  productCollection,
  ProductImage,
} from "types/product";
import { useCollectionData } from "react-firebase-hooks/firestore";
import LoadingButton from "components/LoadingButton";
import BetterTextField from "components/BetterTextField";
import { replace } from "util/array";
import { doc, updateDoc } from "@firebase/firestore";
import { isEmptyObject } from "util/object";
import { randomString } from "util/random";
import { deleteObject, ref, uploadBytes } from "@firebase/storage";
import { storage } from "config/firebaseApp";
import { useMySnackbar } from "hooks/useMySnackbar";
import ProductFieldEditor from "app/admin/products/ProductFieldEditor";

type PendingUploads = { [storagePath: string]: ArrayBuffer };

export default function ProductWizard() {
  const { showError } = useMySnackbar();
  const [products, loading] = useCollectionData(productCollection);

  const [product, setProduct] = useState<Product | null>(null);
  const [changes, setChanges] = useState<Partial<Product>>({});
  const [pendingUploads, setPendingUploads] = useState<PendingUploads>({});
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);

  const [submitLoading, setSubmitLoading] = useState(false);

  const updatePending = !isEmptyObject(changes);
  const currentImages = changes.productImages || product?.productImages || [];
  const updatedProduct: Product = {
    ...defaultProduct(),
    ...product,
    ...changes,
  };

  const handleReset = () => {
    setChanges({});
    setPendingUploads({});
    setPendingDeletions([]);
  };

  const handleSubmit = async () => {
    if (!product || isEmptyObject(changes)) return;

    setSubmitLoading(true);
    try {
      for (const storagePath of pendingDeletions) {
        if (!storagePath) continue;
        await deleteObject(ref(storage, storagePath));
      }
      for (const storagePath of Object.keys(pendingUploads)) {
        const extension = storagePath.slice(storagePath.lastIndexOf(".") + 1);
        const contentType = ["jpeg", "jpg"].includes(extension)
          ? "image/jpeg"
          : "image/png";
        await uploadBytes(
          ref(storage, storagePath),
          pendingUploads[storagePath],
          { contentType }
        );
      }
      await updateDoc(doc(productCollection, product.id), changes);
    } catch (e: any) {
      console.error(e);
      showError(e.message);
    }
    setProduct({ ...product, ...changes });
    handleReset();
    setSubmitLoading(false);
  };
  const textFieldProps = (label: string, key: keyof Product) => ({
    label,
    value: updatedProduct[key] || "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setChanges({ ...changes, [key]: e.target.value }),
    disabled: !product,
    fullWidth: true,
    handlePressControlEnter: handleSubmit,
  });
  const updateImage = (index: number, update: Partial<ProductImage>) => {
    const oldImage = currentImages[index];
    const newImage = { ...oldImage, ...update };
    setChanges({
      ...changes,
      productImages: replace(currentImages, newImage, index),
    });
  };

  const handleImageUpload = (index: number) => {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;

      const file = e.target.files[0];
      if (file.name.lastIndexOf(".") < 0) {
        showError("File has no extension");
        return;
      }
      const extension = file.name.slice(file.name.lastIndexOf("."));
      const binaryData = await file.arrayBuffer();
      const storagePath = `product-images/${randomString(12)}${extension}`;

      updateImage(index, { storagePath });
      setPendingUploads({ ...pendingUploads, [storagePath]: binaryData });
    };
  };

  return (
    <Stack>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Autocomplete
            options={products ?? []}
            getOptionLabel={(p: Product) => p.name}
            onChange={(e, newValue) => {
              handleReset();
              setProduct(newValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={loading}
            renderInput={(params) => {
              // @ts-ignore
              const { key, ...p } = params;
              return <TextField {...p} label={"Select Product"} />;
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <BetterTextField {...textFieldProps("Id", "id")} disabled />
        </Grid>
        <Grid item xs={12}>
          <BetterTextField {...textFieldProps("Name", "name")} />
        </Grid>
        <Grid item xs={12}>
          <BetterTextField
            {...textFieldProps("Description", "description")}
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12}>
          <ProductFieldEditor
            product={product}
            updatedProduct={updatedProduct}
            changes={changes}
            setChanges={setChanges}
          />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ padding: 1 }}>
        <Grid item>
          <LoadingButton
            variant={"contained"}
            disabled={!updatePending || !product}
            onClick={handleSubmit}
            loading={submitLoading}
          >
            Submit Changes
          </LoadingButton>
        </Grid>
        <Grid item>
          <LoadingButton
            variant={"contained"}
            disabled={!updatePending || !product}
            onClick={handleReset}
            loading={submitLoading}
          >
            Reset
          </LoadingButton>
        </Grid>
        <Grid item flexGrow={1} />
        <Grid item>
          <LoadingButton variant={"contained"}>New</LoadingButton>
        </Grid>
        <Grid item>
          <LoadingButton variant={"contained"} disabled={!product}>
            Delete
          </LoadingButton>
        </Grid>
      </Grid>
    </Stack>
  );
}
