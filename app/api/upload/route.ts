import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files provided." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'You must be logged in to upload files.' }, { status: 401 });
  }

  const bucketName = 'Contracts'; // The name of your bucket

  const uploadPromises = files.map(async (file) => {
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicUrlData) {
      throw new Error(`Could not get public URL for ${file.name}.`);
    }

    return publicUrlData.publicUrl;
  });

  try {
    const publicUrls = await Promise.all(uploadPromises);
    console.log('Uploaded file URLs:', publicUrls);
    return NextResponse.json({ publicUrls });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}