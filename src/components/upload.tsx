"use client";

import { UploadButton } from "@/lib/uploadthing";

export default function ProductImageUploader() {
  return (
    <div>
      <h2>Upload de Imagens do Produto</h2>
      
      <UploadButton
        endpoint="productImageUploader" // Esse é o routeSlug do seu core.ts
        onClientUploadComplete={(res) => {
          console.log("Upload completo no cliente:", res);
          alert("Upload feito com sucesso!");
        }}
        onUploadError={(err) => {
          console.error("Erro no upload:", err);
          alert("Erro ao enviar arquivo");
        }}
      />
    </div>
  );
}
