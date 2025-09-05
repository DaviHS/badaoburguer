import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

export const ourFileRouter = {
  productImageUploader: f({ 
    image: { 
      maxFileSize: "4MB", 
      maxFileCount: 10 // Aumentei para 10 imagens
    } 
  })
  .middleware(async ({ req }) => {
    // Aqui você pode adicionar autenticação
    // const session = await getServerAuthSession();
    // if (!session) throw new Error("Não autorizado");
    
    return { uploadedBy: "admin", timestamp: new Date().toISOString() }
  })
  .onUploadComplete(async ({ metadata, file }) => {
    console.log("Upload completo:", file.url)
    
    // Aqui você pode salvar diretamente no banco se quiser
    // Mas vamos salvar via frontend para ter mais controle
    
    return { 
      uploadedBy: metadata.uploadedBy, 
      url: file.url,
      name: file.name,
      size: file.size
    }
  }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter